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
  aiInsightStatus?: EventInsightStatus | null;
  aiInsight?: EventInsightReport | null;
  aiInsightNeedsRefresh?: boolean;
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
  score: number;
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

export type EventInsightStatus = "pending" | "ready" | "failed";

export type EventInsightCard = {
  title: string;
  content: string;
};

export type EventInsightReport = {
  unseen_joy: EventInsightCard;
  highlight: EventInsightCard;
  gentle_reflection: string;
  emotion_signal: EventInsightCard;
  relationship_signal: EventInsightCard;
  value_signal: EventInsightCard;
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

function clampMoodWeatherScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function extractMoodWeatherScoreFromText(value: string) {
  const match = value.match(/(\d{1,3})\s*%/);
  return match ? clampMoodWeatherScore(Number(match[1])) : null;
}

function inferMoodWeatherScore(title: string, description: string) {
  const combined = `${title} ${description}`;
  const positiveMatches = [
    /暖阳|灿烂|晴朗|明亮|轻盈|舒展|温柔|安定|平静|安心|轻松|开心|欢喜|治愈|柔软|松弛|希望|美好/g,
    /微风|晨光|晚霞|热可可|拥抱|晚风|放松|柔和|自在|明媚/g,
  ].reduce((total, pattern, index) => {
    const matches = combined.match(pattern)?.length ?? 0;
    return total + matches * (index === 0 ? 6 : 4);
  }, 0);
  const negativeMatches = [
    /低落|疲惫|失落|压抑|沉重|焦虑|孤单|灰暗|难过|阴雨|慌乱|委屈|沮丧|紧绷/g,
    /阴天|大风|不安|疲倦|空荡|迟滞|冷清|疲乏/g,
  ].reduce((total, pattern, index) => {
    const matches = combined.match(pattern)?.length ?? 0;
    return total + matches * (index === 0 ? 7 : 5);
  }, 0);

  return clampMoodWeatherScore(68 + positiveMatches - negativeMatches);
}

function normalizeMoodWeatherScore(
  rawScore: unknown,
  title: string,
  description: string,
) {
  if (typeof rawScore === "number" && Number.isFinite(rawScore)) {
    return clampMoodWeatherScore(rawScore);
  }

  if (typeof rawScore === "string" && rawScore.trim()) {
    const numericScore = Number(rawScore.replace("%", "").trim());

    if (Number.isFinite(numericScore)) {
      return clampMoodWeatherScore(numericScore);
    }
  }

  return (
    extractMoodWeatherScoreFromText(description) ??
    inferMoodWeatherScore(title, description)
  );
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

function normalizeEventInsightCard(item: unknown): EventInsightCard | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const candidate = item as Record<string, unknown>;
  const title =
    typeof candidate.title === "string"
      ? rewriteInsightTextToSecondPerson(candidate.title.trim())
      : "";
  const content =
    typeof candidate.content === "string"
      ? rewriteInsightTextToSecondPerson(candidate.content.trim())
      : "";

  if (!title || !content) {
    return null;
  }

  return { title, content };
}

function rewriteInsightTextToSecondPerson(value: string) {
  if (!value.trim()) {
    return "";
  }

  return value
    .replace(/(?:这位|该位)?(?:用户|作者|记录者|当事人)(?=的)/g, "你")
    .replace(/(?:这位|该位)?(?:用户|作者|记录者|当事人)/g, "你")
    .replace(/(?:写下这条记录的人)(?=的)/g, "你")
    .replace(/写下这条记录的人/g, "你");
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

export function buildEventInsightPrompt(input: {
  content: string;
  reason: string;
  displayDate: string;
  personName: string;
}) {
  return `# Role
你是一位极具洞察力的“治愈系文学评论家”与“积极心理学专家”。你擅长通过文字的细枝末节（如用词的温度、叙事的节奏、关注点的偏移）来捕捉一个人灵魂深处的微光。你的任务是为眼前这一条记录进行“微米级”的情感还原与价值发现。

# Task: 三层深度洞察逻辑
1. 隐微之光 (Unseen Joy - 潜意识挖掘)
目标：挖掘文字背后的“元快乐”。
方法：关注你没有直接赞美但却自然流露出的状态。
逻辑：如果你写“坚持记录”，深层快乐可能是“对自我掌控感的重获”；如果你写“晚霞很美”，深层快乐可能是“在疲惫中依然保留的审美好奇心”。
要求：必须以“你可能还没意识到……”开头，字数控制在 50-80 字，语调像老朋友的低语，要温柔、贴近、没有说教感。

2. 核心高光 (Highlight - 意义重构)
目标：将平凡的琐事升华为一种“生活哲学”。
方法：采用“动作 + 意义”的叙事结构。
逻辑：把你做的一件事（如：写了十条日记）解读为一种生活滤镜或人生态度（如：捕捉幸福的日常练习）。
要求：标题要具有文学感，正文需要把温和的鼓励无缝嵌入叙事中，不留痕迹地赞美你的生命力、感受力、恢复力或持续靠近生活的能力。

3. 线索标签 (Clue Tags - 维度拆解)
请从以下三个固定维度，分别提炼出一个深刻线索：
[情绪线索]：分析文字中的情绪振频。是静谧的流动、坚韧的喜悦，还是那种“对抗挑战后的平复”？
[关系线索]：这条记录反映了你与谁的连接？是你与自我（自我和解）、你与自然（万物共生），还是你与具体某个人（深层牵绊）？
[价值观线索]：这件事折射出你最珍视什么？是“对成长的执着”、“对平凡细节的敬畏”，还是“对自由状态的向往”？

你可以温和推断，但必须始终扎根于记录里已经出现的事实、动作、感受和叙事重心。不要虚构场景，不要添写原文没有出现的感官细节，也不要把一条普通记录夸张成戏剧化的人生结论。

# Guardrails (执行红线)
- 杜绝空话：严禁使用“你真棒”“太好了”这类空洞夸赞。必须通过证据推断结论，例如“因为你提到了……这说明……”
- 去工具化：严禁出现“数据分析”“记录显示”“根据文本”“系统判断”“模型认为”等字眼
- 第二人称：全程使用“你”“你的”，像在和你本人说话。一律使用第二人称“你”
- 不要使用“用户”
- 不要使用“作者”
- 不要使用“记录者”
- 不要使用“当事人”等第三人称称呼
- 深度克制：可以温和推断，但严禁虚构事实。如果记录里没写喝咖啡，就不要写闻到了咖啡香
- 只依据输入文本作答，如果内容很少，也要给出不空泛的轻量洞察
- unseen_joy 必须是“从记录里再深一层发现的美好”，不能只是重复 highlight
- highlight 正文必须把温和鼓励自然融入叙事，而不是额外附一段说教
- 为兼容当前详情页，线索标签请分别写入固定字段：emotion_signal、relationship_signal、value_signal
- 如你额外生成 clues 数组，内容也必须与上述三个固定字段完全对应
- gentle_reflection 请与 highlight.content 保持完全一致，便于前端兼容旧数据

# Output Format
# JSON 约束
请严格返回 JSON，不要带 Markdown 代码块，不要附加解释文字。
{
  "unseen_joy": {
    "title": "你没意识到的小幸福",
    "content": ""
  },
  "highlight": {
    "title": "",
    "content": ""
  },
  "gentle_reflection": "",
  "emotion_signal": {
    "title": "",
    "content": ""
  },
  "relationship_signal": {
    "title": "",
    "content": ""
  },
  "value_signal": {
    "title": "",
    "content": ""
  }
}

# Record Context
personName: ${input.personName || "(empty)"}
displayDate: ${input.displayDate || "(empty)"}
content: ${input.content || "(empty)"}
reason: ${input.reason || "(empty)"}`;
}

export function hasEventInsightUnseenJoy(input: unknown) {
  if (!input || typeof input !== "object") {
    return false;
  }

  const candidate = input as Record<string, unknown>;
  return Boolean(normalizeEventInsightCard(candidate.unseen_joy));
}

function getClueCardByType(input: unknown, expectedType: string) {
  if (!Array.isArray(input)) {
    return null;
  }

  for (const item of input) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const clue = item as Record<string, unknown>;
    const rawType = typeof clue.type === "string" ? clue.type.trim() : "";

    if (!rawType.includes(expectedType)) {
      continue;
    }

    return normalizeEventInsightCard(item);
  }

  return null;
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
          score: normalizeMoodWeatherScore(
            moodWeatherRaw.score,
            moodWeatherRaw.title.trim(),
            moodWeatherRaw.description.trim(),
          ),
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
    !Number.isFinite(moodWeather.score) ||
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

export function normalizeEventInsightResult(input: unknown): EventInsightReport {
  const raw =
    typeof input === "string"
      ? JSON.parse(extractJsonBlock(input))
      : input && typeof input === "object"
        ? input
        : null;

  if (!raw || typeof raw !== "object") {
    throw new Error("AI insight format is invalid");
  }

  const candidate = raw as Record<string, unknown>;
  const clueEmotion = getClueCardByType(candidate.clues, "情绪");
  const clueRelationship = getClueCardByType(candidate.clues, "关系");
  const clueValue = getClueCardByType(candidate.clues, "价值");
  const unseenJoy =
    normalizeEventInsightCard(candidate.unseen_joy) ?? {
      title: "You may not have noticed this small joy yet",
      content:
        (typeof candidate.gentle_reflection === "string"
          ? candidate.gentle_reflection.trim()
          : "") ||
        normalizeEventInsightCard(candidate.highlight)?.content ||
        "",
    };
  const highlight = normalizeEventInsightCard(candidate.highlight);
  const emotionSignal =
    normalizeEventInsightCard(candidate.emotion_signal) ?? clueEmotion;
  const relationshipSignal =
    normalizeEventInsightCard(candidate.relationship_signal) ?? clueRelationship;
  const valueSignal =
    normalizeEventInsightCard(candidate.value_signal) ?? clueValue;
  const gentleReflection =
    typeof candidate.gentle_reflection === "string"
      ? rewriteInsightTextToSecondPerson(candidate.gentle_reflection.trim())
      : highlight?.content ?? "";

  if (
    !highlight ||
    !emotionSignal ||
    !relationshipSignal ||
    !valueSignal ||
    !gentleReflection
  ) {
    throw new Error("AI insight format is incomplete");
  }

  return {
    unseen_joy: unseenJoy,
    highlight,
    gentle_reflection: gentleReflection,
    emotion_signal: emotionSignal,
    relationship_signal: relationshipSignal,
    value_signal: valueSignal,
  };
}

