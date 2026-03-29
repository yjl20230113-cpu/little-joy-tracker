export const defaultCloudyThemeTitle = "今晚先把心放在这里";

export type CloudyAnalysisResult = {
  themeTitle: string;
  hug: string;
  analysis: string;
  light: string;
};

function extractJsonBlock(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Cloudy analysis format is invalid");
  }

  return value.slice(start, end + 1);
}

function decodeXmlEntities(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractXmlTag(value: string, tagName: string) {
  const pattern = new RegExp(`<${tagName}>([\\s\\S]*?)</${tagName}>`, "i");
  const match = value.match(pattern);
  return match?.[1] ? decodeXmlEntities(match[1]).trim() : "";
}

function pickString(
  candidate: Record<string, unknown>,
  keys: string[],
  fallback = "",
) {
  for (const key of keys) {
    const value = candidate[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return fallback;
}

function parseCloudyString(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("Cloudy analysis format is invalid");
  }

  if (/<Card_UI>/i.test(trimmed)) {
    return {
      themeTitle:
        extractXmlTag(trimmed, "Theme_Title") || defaultCloudyThemeTitle,
      hug: extractXmlTag(trimmed, "Empathy_Section"),
      analysis: extractXmlTag(trimmed, "Cognitive_Reframe_Section"),
      light: extractXmlTag(trimmed, "Actionable_Logging_Section"),
    };
  }

  return JSON.parse(extractJsonBlock(trimmed)) as Record<string, unknown>;
}

export function normalizeCloudyAnalysisResult(
  input: unknown,
): CloudyAnalysisResult {
  const raw =
    typeof input === "string"
      ? parseCloudyString(input)
      : input && typeof input === "object"
        ? input
        : null;

  if (!raw || typeof raw !== "object") {
    throw new Error("Cloudy analysis format is invalid");
  }

  const candidate = raw as Record<string, unknown>;
  const themeTitle = pickString(
    candidate,
    ["themeTitle", "theme_title", "Theme_Title", "title"],
    defaultCloudyThemeTitle,
  );
  const hug = pickString(candidate, ["hug", "empathy", "Empathy_Section"]);
  const analysis = pickString(candidate, [
    "analysis",
    "reframe",
    "Cognitive_Reframe_Section",
  ]);
  const light = pickString(candidate, [
    "light",
    "action",
    "Actionable_Logging_Section",
  ]);

  if (!themeTitle || !hug || !analysis || !light) {
    throw new Error("Cloudy analysis format is incomplete");
  }

  return {
    themeTitle,
    hug,
    analysis,
    light,
  };
}
