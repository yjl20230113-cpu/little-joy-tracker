import { NextResponse } from "next/server";
import {
  buildEventInsightPrompt,
  normalizeEventInsightResult,
} from "@/lib/app-logic";

type EventInsightRequest = {
  content?: string;
  reason?: string;
  displayDate?: string;
  personName?: string;
};

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

  const body = (await request.json()) as EventInsightRequest;
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason.trim() : "";
  const displayDate =
    typeof body.displayDate === "string" ? body.displayDate.trim() : "";
  const personName =
    typeof body.personName === "string" ? body.personName.trim() : "";

  if (!content && !reason) {
    return NextResponse.json(
      { error: "No event text provided" },
      { status: 400 },
    );
  }

  const response = await requestDeepSeek(apiKey, [
    {
      role: "system",
      content:
        "你是一位温柔、克制、具体的生活观察者。请严格返回 JSON，不要带 Markdown，不要附加解释。",
    },
    {
      role: "user",
      content: buildEventInsightPrompt({
        content,
        reason,
        displayDate,
        personName,
      }),
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
    return NextResponse.json(normalizeEventInsightResult(messageContent));
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to parse DeepSeek event insight",
      },
      { status: 502 },
    );
  }
}
