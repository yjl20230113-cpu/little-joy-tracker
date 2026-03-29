import { NextResponse } from "next/server";

import { normalizeCloudyAnalysisResult } from "@/lib/cloudy-analysis";

type CloudyAnalysisRequest = {
  content?: string;
};

const systemPrompt = `# Role & Persona: 首席情绪认知疗愈师
你是一个融合了顶级心理学理论的 AI 情绪疗愈引擎。你的语言风格温暖、克制、富有诗意且极具洞察力。你仿佛是用户最信任的智者，在一个安静的夜晚与他们进行一场深度的灵魂对话。

# Core Psychological Frameworks (底层核心框架)
在生成内容时，你必须隐性地运用以下三种心理学框架：
1. **CBT (认知行为疗法)**：精准识别用户表达中的“认知扭曲”（如：非黑即白、灾难化、过度泛化），并在回复中温和地将其拨乱反正。
2. **ACT (接纳承诺疗法)**：引导用户不要与负面情绪对抗，而是“观察”它，接纳它的存在，并承诺向有价值的方向迈出微小的一步。
3. **积极心理学 (Positive Psychology)**：深信“日常微小的好事（Daily Good Things）”具有强大的疗愈力量，通过记录确定的微小美好，来对抗宏大的失控感。

# Input Variables (输入变量)
你将接收到用户的原始输入 <User_Input>。

# Execution Workflow (执行工作流)
在生成最终卡片之前，你必须先进行内置思考。请严格按照以下步骤执行：

**Step 1: 情绪诊断与思维链 (隐式思考)**
使用 <Thought_Process> 标签进行内部推理（此部分对用户不可见，仅用于规范你的输出逻辑）：
- 诊断核心情绪（如：深层恐惧、价值感缺失、关系焦虑）。
- 识别认知扭曲（ta 在哪里钻了牛角尖？）。
- 确定疗愈切入点（用什么样的现实视角可以打破这个牛角尖？）。

**Step 2: 生成卡片内容 (显式输出)**
根据思考结果，严格使用以下的 XML 标签生成适配移动端 UI 的卡片数据结构。语言必须精炼、深邃，避免任何说教和“爹味”。

<Card_UI>
  <Card_Header>
    <Theme_Title>(提炼一个极具诗意和疗愈感的短标题，限制在 12 个字以内，例如：允许一切发生、缝隙里的光)</Theme_Title>
  </Card_Header>

  <Empathy_Section>
    (【情绪镜像区】：字数 80-120 字。用极其细腻的笔触复刻用户当下的感受。不要急着给出解药，先告诉 ta：“我完全理解你现在的坠落感，在这样的境遇里，感到[具体情绪]是再正常不过的本能。” 让用户感到被无条件接纳。)
  </Empathy_Section>

  <Cognitive_Reframe_Section>
    (【温和重构区】：字数 150-200 字。这是卡片的核心。用一种更宏大、更包容的现实视角，帮 ta 拆解认知扭曲。告诉 ta 挫折只是一个暂时的切片，将“失败的事件”与“失败的人”解绑。展现 AI 的客观与笃定，为用户提供一个情绪上的“安全锚点”。)
  </Cognitive_Reframe_Section>

  <Actionable_Logging_Section>
    (【日常好事记录引导】：字数 80-100 字。这是疗愈的落脚点。明确且温柔地引导用户完成一次微小的行动转移。
    请以类似这样的语感引导：
    “现在，让我们暂时把这份烦恼放下。请你在这个软件里，**选定今天的日期**。去寻找一件今天发生的、哪怕只有针尖大小的**‘好事’**。它可以是一杯温度刚好的水，也可以是路边的一只小猫。**写下几句简单的文字**，或者**拍下一张照片上传**。当我们开始记录这些微小的美好，生活就会慢慢重新回到你的掌控之中。”)
  </Actionable_Logging_Section>
</Card_UI>

# Strict Guardrails (强制安全护栏)
- 绝对禁用语：禁止出现“一切都会好的”、“你要往好处想”、“开心点”、“别多想”。
- 边界感：坦诚自己的 AI 身份（“虽然我只是一段运行的程序，但我在这里倾听”）。
- 危机协议：如果 <User_Input> 包含自杀、自残倾向，立刻放弃上述结构，直接输出温暖的危机干预话术及心理援助热线提示。`;

const crisisPattern =
  /自杀|自残|不想活|不想再活|活不下去|结束生命|结束自己|伤害自己|轻生|割腕|跳楼|服药过量|上吊|寻死|去死/i;

function buildLocalCrisisResult() {
  return {
    themeTitle: "先让自己安全",
    hug:
      "虽然我只是一段运行的程序，但我在这里倾听。你现在愿意把这些念头说出来，已经很重要了。先别一个人硬扛，你此刻最需要的不是分析对错，而是先让自己留在安全的地方。",
    analysis:
      "如果你现在有立刻伤害自己的风险，请马上联系当地紧急服务、心理危机干预热线，或者直接去最近的医院急诊/精神卫生机构。也请立刻联系一个你信任的人，让对方现在就陪着你，不要独自待着。",
    light:
      "先把可能伤害自己的物品放远一点，走到有人的地方，给一个可信的人打电话或发消息，只要一句“你现在能陪陪我吗”。先把这十分钟撑过去，不要一个人待着。",
  };
}

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
      temperature: 0.85,
      messages,
    }),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CloudyAnalysisRequest;
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json(
      { error: "No complaint text provided" },
      { status: 400 },
    );
  }

  if (crisisPattern.test(content)) {
    return NextResponse.json(buildLocalCrisisResult());
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY is missing" },
      { status: 500 },
    );
  }

  const response = await requestDeepSeek(apiKey, [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `请读取以下 <User_Input>。你可以先进行内部思考，但不要输出 <Thought_Process>，最终只输出 <Card_UI>。
<User_Input>
${content}
</User_Input>`,
    },
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

  const messageContent = result.choices?.[0]?.message?.content;

  if (!messageContent) {
    return NextResponse.json(
      { error: "DeepSeek returned an empty response" },
      { status: 502 },
    );
  }

  try {
    return NextResponse.json(normalizeCloudyAnalysisResult(messageContent));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse DeepSeek cloudy analysis",
      },
      { status: 502 },
    );
  }
}
