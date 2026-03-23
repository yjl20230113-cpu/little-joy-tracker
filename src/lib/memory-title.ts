export type MemoryTitleEventInput = {
  content?: string;
  reason?: string;
  time?: string;
};

export type MemoryTitleItem = {
  index: number;
  title: string;
};

const titlePattern = /^[\u4e00-\u9fff]{4,6}$/;
const chineseCharPattern = /[\u4e00-\u9fff]/g;
const punctuationPattern = /[\s，。！？；：、“”‘’（）【】《》,.!?;:]/g;

export function isValidMemoryTitle(title: string) {
  return titlePattern.test(title.trim());
}

export function fallbackMemoryTitle(content: string) {
  const stripped = content
    .replace(punctuationPattern, " ")
    .match(chineseCharPattern)
    ?.join("")
    .trim() ?? "";

  if (stripped.length >= 4) {
    return stripped.slice(0, 6);
  }

  return "今日记录";
}

export function normalizeMemoryTitleItems(input: unknown): MemoryTitleItem[] {
  const raw =
    typeof input === "string"
      ? JSON.parse(extractJsonBlock(input))
      : input && typeof input === "object"
        ? input
        : null;

  if (!raw || typeof raw !== "object") {
    throw new Error("AI title format is invalid");
  }

  const candidate = raw as Record<string, unknown>;
  const items = Array.isArray(candidate.items) ? candidate.items : [];

  const normalized = items
    .map((item, index) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const candidateItem = item as Record<string, unknown>;
      const itemIndex =
        typeof candidateItem.index === "number" && Number.isInteger(candidateItem.index)
          ? candidateItem.index
          : index;
      const title =
        typeof candidateItem.title === "string" ? candidateItem.title.trim() : "";

      if (!isValidMemoryTitle(title)) {
        return null;
      }

      return {
        index: itemIndex,
        title,
      };
    })
    .filter((item): item is MemoryTitleItem => Boolean(item));

  if (normalized.length === 0) {
    throw new Error("AI title format is incomplete");
  }

  return normalized;
}

function extractJsonBlock(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI title did not return valid JSON");
  }

  return value.slice(start, end + 1);
}
