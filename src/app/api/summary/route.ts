import { NextResponse } from "next/server";
import { normalizeSummaryResult } from "../../../lib/app-logic";

type SummaryEventInput = {
  content?: string;
  reason?: string;
  time?: string;
};

const systemPrompt = `# Role
你是一位温柔、克制、善于发现生活微光的治愈系生活观察者，同时具备积极心理学分析能力。

# Task
请根据用户提供的一组“小美好记录”，输出一份结构化、温暖、有仪式感的回忆报告。
输入内容包含事件描述、当下感悟和记录时间。

# Output Dimensions
1. mood_weather
- title: 用一个核心词概括最近的情绪气候，例如“暖阳”“微风”“晨光”
- icon: 只能从 Sun、Cloud、Moon、Wind、Sunrise 中选一个
- description: 一段自然、温和、具体的总结

2. keywords
- 提炼 5 个最有代表性的关键词
- 每个词不超过 4 个字

3. personality
- title: 一句简短的人格画像标题
- description: 一段对记录习惯和情绪特征的温暖侧写

4. suggestions
- 返回 2 条延续幸福感的建议
- 每条包含 title、content、icon

# Style
- 使用第二人称“你”
- 保持温暖、诗意，但不要夸张
- 不要使用“根据你的数据”“系统分析”等工具化表达

# Output Format
只返回 JSON，不要带 Markdown 代码块，不要附加解释文字。
{
  "mood_weather": { "title": "", "icon": "", "description": "" },
  "keywords": ["", "", "", "", ""],
  "personality": { "title": "", "description": "" },
  "suggestions": [
    { "title": "", "content": "", "icon": "" },
    { "title": "", "content": "", "icon": "" }
  ]
}`;

async function requestDeepSeek(
  apiKey: string,
  messages: Array<{ role: "system" | "user"; content: string }>,
) {
  return fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.8,
      messages,
      response_format: { type: "json_object" },
    }),
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is missing" },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { events?: SummaryEventInput[] };
  const events = Array.isArray(body.events) ? body.events : [];

  const cleanedEvents = events
    .map((event) => ({
      content: typeof event.content === "string" ? event.content.trim() : "",
      reason: typeof event.reason === "string" ? event.reason.trim() : "",
      time: typeof event.time === "string" ? event.time.trim() : "",
    }))
    .filter((event) => event.content || event.reason);

  if (cleanedEvents.length === 0) {
    return NextResponse.json(
      { error: "No event text provided" },
      { status: 400 },
    );
  }

  const userPrompt = cleanedEvents
    .map(
      (event, index) =>
        `${index + 1}. content: ${event.content || "(empty)"}\nreason: ${
          event.reason || "(empty)"
        }\ntime: ${event.time || "(empty)"}`,
    )
    .join("\n\n");

  const response = await requestDeepSeek(apiKey, [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ]);

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: errorText || "DeepSeek request failed" },
      { status: 502 },
    );
  }

  const result = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    return NextResponse.json(
      { error: "DeepSeek returned an empty response" },
      { status: 502 },
    );
  }

  try {
    return NextResponse.json(normalizeSummaryResult(content));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse DeepSeek summary",
      },
      { status: 502 },
    );
  }
}
