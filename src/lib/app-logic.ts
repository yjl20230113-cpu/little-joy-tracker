export type PersonOption = {
  id: string;
  name: string;
  is_default: boolean;
};

export type TimelineEntry = {
  id: string;
  title?: string | null;
  content: string;
  reason: string | null;
  imageUrl: string | null;
  displayDate: string;
  createdAt: string;
  personName: string;
  personId: string;
};

export type TimelineRange = "week" | "month" | "threeMonths";

export type TimelineFilters = {
  personId: string;
  range: TimelineRange;
  customStartDate: string;
  customEndDate: string;
  today: string;
};

export type TimelineGroup = {
  date: string;
  items: TimelineEntry[];
};

export type SummaryMoodWeather = {
  title: string;
  icon: string;
  description: string;
};

export type SummaryPersonality = {
  title: string;
  description: string;
};

export type SummarySuggestion = {
  title: string;
  content: string;
  icon: string;
};

export type SummaryReport = {
  mood_weather: SummaryMoodWeather;
  keywords: string[];
  personality: SummaryPersonality;
  suggestions: SummarySuggestion[];
};

export type SummaryRequestEvent = {
  content: string;
  reason: string;
  time: string;
};

type CredentialErrors = {
  email?: string;
  password?: string;
};

type EventInput = {
  userId: string;
  personId: string;
  content: string;
  reason: string;
  imageUrls?: string[];
  displayDate: string;
};

type EventPayload = {
  user_id: string;
  person_id: string;
  content: string;
  reason: string | null;
  image_urls: string | null;
  display_date: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(
  email: string,
  password: string,
): CredentialErrors {
  const errors: CredentialErrors = {};
  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    errors.email = "请输入邮箱地址";
  } else if (!emailPattern.test(trimmedEmail)) {
    errors.email = "邮箱格式不正确";
  }

  if (!password.trim()) {
    errors.password = "请输入密码";
  }

  return errors;
}

export function pickInitialPerson(
  persons: PersonOption[],
): PersonOption | null {
  return persons.find((person) => person.is_default) ?? persons[0] ?? null;
}

export function serializeImageUrls(imageUrls: string[]) {
  return imageUrls.length > 0 ? JSON.stringify(imageUrls) : null;
}

export function normalizePersonName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("zh-CN");
}

export function getRetryAfterSeconds(message: string) {
  const match = message.match(/after\s+(\d+)\s+seconds?/i);
  return match ? Number(match[1]) : null;
}

export function isRateLimitError(message: string) {
  return /rate limit|too many requests|for security purposes/i.test(message);
}

export function normalizeAuthErrorMessage(message: string) {
  const normalized = message.trim();

  if (/invalid login credentials/i.test(normalized)) {
    return "邮箱或密码不正确，请检查后重试";
  }

  if (/user already registered/i.test(normalized)) {
    return "这个邮箱已经注册过了，请直接登录";
  }

  if (/email not confirmed/i.test(normalized)) {
    return "请先前往邮箱完成验证，再回来登录";
  }

  if (/password should be at least/i.test(normalized)) {
    return "密码至少需要 6 位";
  }

  if (/signups are disabled/i.test(normalized) || /signup is disabled/i.test(normalized)) {
    return "当前暂不支持注册，请联系管理员";
  }

  if (/network error|fetch failed|failed to fetch|load failed/i.test(normalized)) {
    return "网络连接不稳定，请稍后再试";
  }

  return "登录暂时失败，请稍后再试";
}

export function buildEventPayload(input: EventInput): EventPayload {
  const content = input.content.trim();

  if (!content) {
    throw new Error("记录内容不能为空");
  }

  const reason = input.reason.trim();

  return {
    user_id: input.userId,
    person_id: input.personId,
    content,
    reason: reason || null,
    image_urls: serializeImageUrls(input.imageUrls ?? []),
    display_date: input.displayDate,
  };
}

function addDays(dateString: string, offset: number) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function padTimePart(value: number) {
  return String(value).padStart(2, "0");
}

function unpadDatePart(value: string) {
  return String(Number(value));
}

function extractJsonBlock(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI summary did not return valid JSON");
  }

  return value.slice(start, end + 1);
}

function normalizeSuggestion(item: unknown): SummarySuggestion | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const suggestion = item as Record<string, unknown>;
  const title = typeof suggestion.title === "string" ? suggestion.title.trim() : "";
  const content =
    typeof suggestion.content === "string" ? suggestion.content.trim() : "";
  const icon = typeof suggestion.icon === "string" ? suggestion.icon.trim() : "";

  if (!title || !content || !icon) {
    return null;
  }

  return { title, content, icon };
}

export function filterTimelineItems(
  items: TimelineEntry[],
  filters: TimelineFilters,
) {
  const rangeStart =
    filters.range === "week"
      ? addDays(filters.today, -6)
      : filters.range === "month"
        ? addDays(filters.today, -29)
        : addDays(filters.today, -89);
  const rangeEnd = filters.today;

  return items.filter((item) => {
    if (filters.personId !== "all" && item.personId !== filters.personId) {
      return false;
    }

    if (rangeStart && item.displayDate < rangeStart) {
      return false;
    }

    if (rangeEnd && item.displayDate > rangeEnd) {
      return false;
    }

    return true;
  });
}

export function groupTimelineItemsByDate(items: TimelineEntry[]): TimelineGroup[] {
  const groups = new Map<string, TimelineEntry[]>();

  for (const item of items) {
    const current = groups.get(item.displayDate) ?? [];
    current.push(item);
    groups.set(item.displayDate, current);
  }

  return Array.from(groups.entries()).map(([date, groupedItems]) => ({
    date,
    items: groupedItems,
  }));
}

export function formatTimelineHeading(date: string) {
  const [year, month, day] = date.split("-");
  return `${year}年${unpadDatePart(month)}月${unpadDatePart(day)}日`;
}

export function formatTimelineTime(timestamp: string) {
  const date = new Date(timestamp);
  return `${padTimePart(date.getHours())}:${padTimePart(date.getMinutes())}`;
}

export function formatDetailTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${padTimePart(date.getMonth() + 1)}-${padTimePart(
    date.getDate(),
  )} ${padTimePart(date.getHours())}:${padTimePart(
    date.getMinutes(),
  )}:${padTimePart(date.getSeconds())}`;
}

export function buildSummaryRequestEvents(items: TimelineEntry[]): SummaryRequestEvent[] {
  return items.map((item) => ({
    content: item.content,
    reason: item.reason ?? "",
    time: formatDetailTimestamp(item.createdAt),
  }));
}

export function buildSummaryPrompt(eventTexts: string[]) {
  return `# Role
你是一位擅长从日常记录中提炼情绪、关系和成长线索的治愈系生活观察家。
# Task
请分析这些小美好记录，输出一份温暖、诗意、结构化的回忆报告。
# Output Format
请严格返回 JSON，不要带 Markdown 代码块，不要添加解释。
记录内容：
${eventTexts.join("\n\n")}`;
}

export function normalizeSummaryResult(input: unknown): SummaryReport {
  const raw =
    typeof input === "string"
      ? JSON.parse(extractJsonBlock(input))
      : input && typeof input === "object"
        ? input
        : null;

  if (!raw || typeof raw !== "object") {
    throw new Error("AI summary format is invalid");
  }

  const candidate = raw as Record<string, unknown>;
  const moodWeatherRaw =
    candidate.mood_weather && typeof candidate.mood_weather === "object"
      ? (candidate.mood_weather as Record<string, unknown>)
      : null;
  const personalityRaw =
    candidate.personality && typeof candidate.personality === "object"
      ? (candidate.personality as Record<string, unknown>)
      : null;

  const moodWeather =
    moodWeatherRaw &&
    typeof moodWeatherRaw.title === "string" &&
    typeof moodWeatherRaw.icon === "string" &&
    typeof moodWeatherRaw.description === "string"
      ? {
          title: moodWeatherRaw.title.trim(),
          icon: moodWeatherRaw.icon.trim(),
          description: moodWeatherRaw.description.trim(),
        }
      : null;

  const keywords = Array.isArray(candidate.keywords)
    ? candidate.keywords
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const personality =
    personalityRaw &&
    typeof personalityRaw.title === "string" &&
    typeof personalityRaw.description === "string"
      ? {
          title: personalityRaw.title.trim(),
          description: personalityRaw.description.trim(),
        }
      : null;

  const suggestions = Array.isArray(candidate.suggestions)
    ? candidate.suggestions
        .map((item) => normalizeSuggestion(item))
        .filter((item): item is SummarySuggestion => Boolean(item))
    : [];

  if (
    !moodWeather?.title ||
    !moodWeather.icon ||
    !moodWeather.description ||
    keywords.length === 0 ||
    !personality?.title ||
    !personality.description ||
    suggestions.length < 2
  ) {
    throw new Error("AI summary format is incomplete");
  }

  return {
    mood_weather: moodWeather,
    keywords: keywords.slice(0, 5),
    personality,
    suggestions: suggestions.slice(0, 2),
  };
}

