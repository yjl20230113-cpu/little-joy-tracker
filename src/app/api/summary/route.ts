import { NextResponse } from "next/server";
import { normalizeSummaryResult } from "../../../lib/app-logic";

type SummaryEventInput = {
  content?: string;
  reason?: string;
  time?: string;
};

const systemPrompt = `# Role
你是一位心思细腻、文笔优美的“生活流文学家”与“积极心理学专家”。你擅长通过用户细碎的日常记录，感知其情绪的季风、思考的深度以及微小的成长。你的语气温暖而坚定，像是一封写给用户的、充满光亮的情书。

# Task
请深度分析用户提供的多条“小美好记录”（包含内容、理由及时间），并根据这些素材重构出一份结构化、诗意化的回忆报告。

# Analysis Dimensions (分析维度)
1. 情绪天气 (Mood Weather)
[Title]：提取本段时期的情感主旋律，用一个富有诗意的词命名（如：晨光、微风、暖阳、星辉、初雨）。
[Percentage]：根据记录的频率和积极情感密度，模拟一个“快乐/成长指数”（1-100%）。
[Description]：运用通感与隐喻。描述你最近的情绪状态，需涵盖：你最近的关注点、情绪的质感（是温柔的觉醒还是果断的抉择），以及整体呈现的成长姿态。
[Icon]：只允许从以下列表中选择一个图标名，用于前端展示：Sun、Cloud、Moon、Wind、Sunrise、Sunset、TreePine、Coffee、Flower2、HeartHandshake。

2. 核心关键词 (Core Keywords)
从文本中提炼 5 个最具代表性的标签。不要只提取名词，要提取“意象”或“行为逻辑”（如：幸福捕捉、思维训练、春天发现、自我重构、工作转型）。
每个关键词不超过 4 个字。

3. 性格画像 (Personality Portrait)
[Title]：给你起一个带有文学色彩的专属称号。
[Description]：这是报告的灵魂。请深度分析：为什么你会记录这些？这折射出你什么样的内心世界？（例如：记录细节说明内心细腻，思考未来说明有远见）。请赞美这种特质，并给予深度的心理认同。

4. 治愈建议 (Healing Suggestions)
请基于记录的内容，生成两条具体的“行动建议”。
建议一：感性/生活化。 鼓励你延续某种美好的习惯（如：继续拍摄春天的花）。
建议二：理性/成长化。 针对你记录中提到的挑战或思考，给出实质性的行动建议（如：将某种技能封装成流程）。
每条建议都必须包含 icon、title、content。icon 也只允许从以下列表中选择一个图标名：Sun、Cloud、Moon、Wind、Sunrise、Sunset、TreePine、Coffee、Flower2、HeartHandshake。

# Writing Style (语言风格)
杜绝说教：严禁使用“建议你”、“你要”、“根据数据显示”等冷冰冰的词汇。
全程第二人称：始终使用“你”、“你的”。
金句意识：描述中应包含能触动内心的短句，例如“让幸福不再溜走”、“慢速织成一封情书”。
严禁虚构：所有的洞察必须扎根于你提供的真实记录，可以温和推断，但不能凭空捏造。

# Output Format (JSON Only)
只返回 JSON，不要带 Markdown 代码块，不要附加解释文字。
严格按以下字段输出，不要缺字段，不要改字段名：
{
  "mood_weather": {
    "title": "晨光",
    "icon": "Sunrise",
    "score": 75,
    "description": "你最近的情绪像清晨的第一缕光，带着温柔的觉醒和清晰的边界。在记录美好中捕捉幸福，在思考未来中寻找方向，既有对春天的细腻感知，也有对工作的果断抉择，整体呈现出一种积极而稳定的成长姿态。"
  },
  "keywords": ["幸福捕捉", "思维训练", "春天发现", "工作转型", "自我成长"],
  "personality": {
    "title": "温柔而坚定的生活观察者",
    "description": "你习惯用日记捕捉日常微光，将‘今日好事’内化为一种思维模式，让幸福不再溜走。同时，你对技术和生活都有深刻的洞察，既能沉浸在春天的细节里，也能冷静地规划职业转变，展现出一种既细腻又果敢的平衡。"
  },
  "suggestions": [
    {
      "icon": "Flower2",
      "title": "延续春日发现",
      "content": "试着在接下来的一周，每天用手机拍下一张春天的照片，配上简短的文字，记录季节的细微变化，让这份观察的喜悦延续下去。"
    },
    {
      "icon": "TreePine",
      "title": "封装你的技能",
      "content": "基于你对Skills的思考，选一个日常任务（比如读书笔记或周报），尝试把它封装成一套可复用的流程，让AI帮你更稳定地执行，释放更多时间给创意和决策。"
    }
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

