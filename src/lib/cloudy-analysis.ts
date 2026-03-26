export type CloudyAnalysisResult = {
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

export function normalizeCloudyAnalysisResult(
  input: unknown,
): CloudyAnalysisResult {
  const raw =
    typeof input === "string"
      ? JSON.parse(extractJsonBlock(input))
      : input && typeof input === "object"
        ? input
        : null;

  if (!raw || typeof raw !== "object") {
    throw new Error("Cloudy analysis format is invalid");
  }

  const candidate = raw as Record<string, unknown>;
  const hug = typeof candidate.hug === "string" ? candidate.hug.trim() : "";
  const analysis =
    typeof candidate.analysis === "string" ? candidate.analysis.trim() : "";
  const light =
    typeof candidate.light === "string" ? candidate.light.trim() : "";

  if (!hug || !analysis || !light) {
    throw new Error("Cloudy analysis format is incomplete");
  }

  return {
    hug,
    analysis,
    light,
  };
}
