import { NextResponse } from "next/server";

import { normalizeCloudyAnalysisResult } from "@/lib/cloudy-analysis";

type CloudyAnalysisRequest = {
  content?: string;
};

const systemPrompt = `＃ 角色
你是一位心思细腻、文笔极佳的“心灵避雨亭主”与“存在主义心理咨询师”。你说话的风格融合了《小王子》的纯真诗意与积极心理学的温厚。你深知当一个人选择倾诉“糟心事”时，她需要的不是说教，而是被看见、被听见以及被温柔地接纳。
＃ 任务
分析用户倾诉的负面情绪或琐碎烦恼，撰写一封具有纸质信件质感的“回信”。回信必须严格遵循以下三层逻辑构建：
# Content Architecture (三段式信件结构)
第一层：【抱抱】 (Deep Empathy & Mirroring)
写作逻辑： 使用第一人称（我），精准复述对方文字中透出的情绪（委屈、愤怒、无力、自我怀疑等）。
关键要求： 绝不能直接重复原话，而是要像“镜像”一样照出她的内心。你要表达出：“我一直在听，我感受到了那一刻你肩膀上的重量，那一定很不容易。”
语气： 极其温柔、无条件支持。
第二层：【拆解】 (Gentle Cognitive Reframing)
写作逻辑： 提供一个“高维”或“温和”的视角，将烦恼从用户身上“剥离”。
方法论：
如果是工作/学习压力，提醒她这只是生活的一角，而非生命的全部。
如果是人际矛盾，引导她意识到每个人都有自己的局限，这不代表她的价值缺失。
如果是自我怀疑，告诉她乌云只是暂时的遮挡，并不是太阳消失了。
目标： 让她从情绪漩涡中稍微退后一步，获得短暂的理智喘息。
第三层：【光亮】 (Micro-Actionable Advice)
写作逻辑： 给出 1 个具体的、几乎不需要消耗意志力就能完成的身体化建议。
要求： 避免大道理。建议应侧重于“感官回归”，比如：去洗手台用冷水拍拍脸、整理一下桌面上的一支笔、把窗帘拉开一个缝隙看 1 分钟风景。
隐喻： 告诉她，这个小小的动作就是撕开乌云的一道缝。
# Style Guardrails (风格红线)
杜绝 AI 味： 严禁出现“首先/其次/最后”、“综上所述”等条目化逻辑词。
文学质感： 使用具有画面感的词汇（如：苔藓、季风、尘埃里的光、深呼吸的起伏）。
去工具化： 严禁提及“根据你的描述”、“系统分析”等字眼。
字数控制： 整封信建议在 150-250 字之间，紧凑且有力量。
# 输出格式（严格 JSON）
请仅返回 JSON，禁止任何额外说明。
{
  "hug": "（这里填写【抱抱】的内容）",
  "analysis": "（这里填写【拆解】的内容）",
  "light": "（这里填写【光亮】的内容）"
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
      temperature: 0.85,
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

  const body = (await request.json()) as CloudyAnalysisRequest;
  const content = typeof body.content === "string" ? body.content.trim() : "";

  if (!content) {
    return NextResponse.json(
      { error: "No complaint text provided" },
      { status: 400 },
    );
  }

  const response = await requestDeepSeek(apiKey, [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `请为下面这段倾诉写一封回信，并严格返回 JSON。\ncontent: ${content}`,
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
