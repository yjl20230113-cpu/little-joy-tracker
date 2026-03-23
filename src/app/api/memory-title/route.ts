import { NextResponse } from "next/server";
import {
  normalizeMemoryTitleItems,
  type MemoryTitleEventInput,
} from "../../../lib/memory-title";

const systemPrompt = `你是一个中文生活记录标题生成器。

你的任务：
根据输入的一组生活记录，生成可直接展示在“详情页大标题”和“时间线卡片标题”上的短标题。

必须严格遵守：
1. 只输出合法 JSON，不要输出任何额外文字、解释、注释、Markdown、代码块。
2. JSON 结构只能是：
{"items":[{"index":0,"title":"四到六字标题"}]}
3. 每个 title 必须是 4-6 个中文字符。
4. title 必须自然、简洁、准确，能概括这条记录最核心的事件或情绪。
5. 不要使用英文、数字、表情、符号、标点。
6. 不要编造输入中不存在的信息。
7. 输出必须保留每条输入的 index，顺序不能变。
8. 如果某条内容过于空白，也要尽量提炼出一个能用的中文标题。

标题风格：
- 像时间线卡片上的小标题
- 口语化、克制、有画面感
- 不要过度文学化，不要抽象空泛`;

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
      temperature: 0.4,
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

  const body = (await request.json()) as { events?: MemoryTitleEventInput[] };
  const events = Array.isArray(body.events) ? body.events : [];

  const cleanedEvents = events
    .map((event, index) => ({
      index,
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

  const userPrompt = JSON.stringify(
    {
      events: cleanedEvents.map((event) => ({
        index: event.index,
        content: event.content || "(empty)",
        reason: event.reason || "(empty)",
        time: event.time || "(empty)",
      })),
      output: {
        items: cleanedEvents.map((event) => ({
          index: event.index,
          title: "四到六字标题",
        })),
      },
    },
    null,
    2,
  );

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
    const items = normalizeMemoryTitleItems(content);
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse DeepSeek memory title",
      },
      { status: 502 },
    );
  }
}
