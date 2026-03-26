import { describe, expect, it } from "vitest";

import {
  buildEventPayload,
  buildEventInsightPrompt,
  buildSummaryPrompt,
  buildSummaryRequestEvents,
  filterTimelineItems,
  formatDetailTimestamp,
  formatTimelineHeading,
  formatTimelineTime,
  getRetryAfterSeconds,
  groupTimelineItemsByDate,
  isRateLimitError,
  normalizeAuthErrorMessage,
  normalizeEventInsightResult,
  normalizePersonName,
  normalizeSummaryResult,
  pickInitialPerson,
  serializeImageUrls,
  validateCredentials,
} from "./app-logic";

describe("validateCredentials", () => {
  it("rejects blank email and password", () => {
    expect(validateCredentials("", "")).toEqual({
      email: "请输入邮箱地址",
      password: "请输入密码",
    });
  });

  it("rejects invalid email format", () => {
    expect(validateCredentials("hello", "123456")).toEqual({
      email: "邮箱格式不正确",
    });
  });

  it("accepts valid credentials", () => {
    expect(validateCredentials("joy@example.com", "123456")).toEqual({});
  });
});

describe("normalizeAuthErrorMessage", () => {
  it("maps invalid login credentials to Chinese", () => {
    expect(normalizeAuthErrorMessage("Invalid login credentials")).toBe(
      "邮箱或密码不正确，请检查后重试",
    );
  });

  it("maps unknown errors to a safe fallback", () => {
    expect(normalizeAuthErrorMessage("Something unexpected")).toBe(
      "登录暂时失败，请稍后再试",
    );
  });
});

describe("buildSummaryRequestEvents", () => {
  it("keeps content, reason, and time for summary requests", () => {
    expect(
      buildSummaryRequestEvents([
        {
          id: "event-1",
          title: "Test title",
          content: "An evening walk together",
          reason: "The breeze felt gentle",
          imageUrl: "https://example.com/a.jpg",
          displayDate: "2026-03-22",
          createdAt: "2026-03-22T21:10:45+08:00",
          personName: "Self",
          personId: "person-self",
        },
      ]),
    ).toEqual([
      {
        content: "An evening walk together",
        reason: "The breeze felt gentle",
        time: "2026-03-22 21:10:45",
      },
    ]);
  });
});
describe("pickInitialPerson", () => {
  it("prefers the default person", () => {
    expect(
      pickInitialPerson([
        { id: "1", name: "Mom", is_default: false },
        { id: "2", name: "Self", is_default: true },
      ]),
    ).toEqual({ id: "2", name: "Self", is_default: true });
  });

  it("falls back to the first person", () => {
    expect(
      pickInitialPerson([
        { id: "1", name: "Mom", is_default: false },
        { id: "2", name: "Self", is_default: false },
      ]),
    ).toEqual({ id: "1", name: "Mom", is_default: false });
  });

  it("returns null when no persons exist", () => {
    expect(pickInitialPerson([])).toBeNull();
  });
});
describe("buildEventPayload", () => {
  it("builds a trimmed event payload", () => {
    expect(
      buildEventPayload({
        userId: "user-1",
        personId: "person-1",
        content: "  Watched the sunset together  ",
        reason: "  It felt peaceful ",
        displayDate: "2026-03-22",
      }),
    ).toEqual({
      user_id: "user-1",
      person_id: "person-1",
      content: "Watched the sunset together",
      reason: "It felt peaceful",
      image_urls: null,
      display_date: "2026-03-22",
      event_type: "joy",
    });
  });

  it("drops an empty reason", () => {
    expect(
      buildEventPayload({
        userId: "user-1",
        personId: "person-1",
        content: "Bought flowers I liked",
        reason: "   ",
        displayDate: "2026-03-22",
      }),
    ).toEqual({
      user_id: "user-1",
      person_id: "person-1",
      content: "Bought flowers I liked",
      reason: null,
      image_urls: null,
      display_date: "2026-03-22",
      event_type: "joy",
    });
  });

  it("defaults event_type to joy and supports cloudy entries", () => {
    expect(
      buildEventPayload({
        userId: "user-1",
        personId: "person-1",
        content: "Needed a quiet corner after work",
        reason: "",
        displayDate: "2026-03-22",
      }),
    ).toEqual(
      expect.objectContaining({
        event_type: "joy",
      }),
    );

    expect(
      buildEventPayload({
        userId: "user-1",
        personId: "person-1",
        content: "Everything felt too loud today",
        reason: "",
        displayDate: "2026-03-22",
        eventType: "cloudy",
      }),
    ).toEqual(
      expect.objectContaining({
        event_type: "cloudy",
      }),
    );
  });

  it("rejects blank content", () => {
    expect(() =>
      buildEventPayload({
        userId: "user-1",
        personId: "person-1",
        content: "   ",
        reason: "",
        displayDate: "2026-03-22",
      }),
    ).toThrow("记录内容不能为空");
  });
});

describe("serializeImageUrls", () => {
  it("stores a single uploaded image as a JSON array string", () => {
    expect(serializeImageUrls(["https://example.com/a.jpg"])).toBe(
      '["https://example.com/a.jpg"]',
    );
  });

  it("returns null when there is no uploaded image", () => {
    expect(serializeImageUrls([])).toBeNull();
  });
});

describe("normalizePersonName", () => {
  it("trims spaces and normalizes casing for duplicate checks", () => {
    expect(normalizePersonName("  SELF  ")).toBe("self");
    expect(normalizePersonName("  鐖哥埜 ")).toBe("鐖哥埜");
    expect(normalizePersonName("  鎴?  鑷繁 ")).toBe("鎴? 鑷繁");
  });
});

describe("getRetryAfterSeconds", () => {
  it("extracts cooldown seconds from auth rate limit errors", () => {
    expect(
      getRetryAfterSeconds(
        "For security purposes, you can only request this after 10 seconds.",
      ),
    ).toBe(10);
  });

  it("returns null when no cooldown exists in the message", () => {
    expect(getRetryAfterSeconds("Invalid login credentials")).toBeNull();
  });
});

describe("isRateLimitError", () => {
  it("detects auth rate limit messages", () => {
    expect(
      isRateLimitError(
        "For security purposes, you can only request this after 10 seconds.",
      ),
    ).toBe(true);
    expect(isRateLimitError("email rate limit exceeded")).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isRateLimitError("Invalid login credentials")).toBe(false);
  });
});

describe("filterTimelineItems", () => {
  const items = [
    {
      id: "event-1",
      title: "A",
      content: "A",
      reason: null,
      imageUrl: null,
      displayDate: "2026-03-22",
      createdAt: "2026-03-22T10:00:00+08:00",
      personName: "鑷繁",
      personId: "person-self",
    },
    {
      id: "event-2",
      title: "B",
      content: "B",
      reason: null,
      imageUrl: null,
      displayDate: "2026-03-01",
      createdAt: "2026-03-01T10:00:00+08:00",
      personName: "鐖哥埜",
      personId: "person-dad",
    },
  ];

  it("filters by person and date range", () => {
    const filtered = filterTimelineItems(items, {
      personId: "person-self",
      range: "month",
      customStartDate: "",
      customEndDate: "",
      today: "2026-03-22",
    });

    expect(filtered.map((item) => item.id)).toEqual(["event-1"]);
  });

  it("uses the selected start and end dates when a custom range is provided", () => {
    const filtered = filterTimelineItems(items, {
      personId: "all",
      range: "month",
      customStartDate: "2026-03-01",
      customEndDate: "2026-03-10",
      today: "2026-03-22",
    });

    expect(filtered.map((item) => item.id)).toEqual(["event-2"]);
  });
});

describe("groupTimelineItemsByDate", () => {
  it("groups items by display date", () => {
    expect(
      groupTimelineItemsByDate([
        {
          id: "event-1",
          title: "A",
          content: "A",
          reason: null,
          imageUrl: null,
          displayDate: "2026-03-22",
          createdAt: "2026-03-22T10:00:00+08:00",
          personName: "鑷繁",
          personId: "person-self",
        },
        {
          id: "event-2",
          title: "B",
          content: "B",
          reason: null,
          imageUrl: null,
          displayDate: "2026-03-22",
          createdAt: "2026-03-22T11:00:00+08:00",
          personName: "鑷繁",
          personId: "person-self",
        },
        {
          id: "event-3",
          title: "C",
          content: "C",
          reason: null,
          imageUrl: null,
          displayDate: "2026-03-21",
          createdAt: "2026-03-21T11:00:00+08:00",
          personName: "鐖哥埜",
          personId: "person-dad",
        },
      ]),
    ).toEqual([
      {
        date: "2026-03-22",
        items: expect.arrayContaining([
          expect.objectContaining({ id: "event-1" }),
          expect.objectContaining({ id: "event-2" }),
        ]),
      },
      {
        date: "2026-03-21",
        items: [expect.objectContaining({ id: "event-3" })],
      },
    ]);
  });
});

describe("formatters", () => {
  it("formats the timeline day heading in Chinese", () => {
    expect(formatTimelineHeading("2026-03-22")).toBe("2026年3月22日");
  });

  it("formats record time to minutes", () => {
    expect(formatTimelineTime("2026-03-22T13:10:45+08:00")).toBe("13:10");
  });

  it("formats detail timestamps to seconds", () => {
    expect(formatDetailTimestamp("2026-03-22T21:10:45+08:00")).toBe(
      "2026-03-22 21:10:45",
    );
  });
});

describe("buildSummaryPrompt", () => {
  it("includes the provided event texts in the DeepSeek prompt", () => {
    const prompt = buildSummaryPrompt([
      "1. content: 涓€璧风湅鏅氶湠\nreason: 澶╃┖寰堣蒋\ntime: 2026-03-22 21:10:45",
      "2. content: 鏅氶キ鍚庣殑鏁ｆ\nreason: 椋庡緢鑸掓湇\ntime: 2026-03-20 20:00:00",
    ]);

    expect(prompt).toContain("治愈系生活观察家");
    expect(prompt).toContain("涓€璧风湅鏅氶湠");
    expect(prompt).toContain("time: 2026-03-22 21:10:45");
  });
});

describe("buildEventInsightPrompt", () => {
  it("includes content, reason, date, and person context for a single record", () => {
    const prompt = buildEventInsightPrompt({
      content: "I bought myself a hot drink on the way home.",
      reason: "It felt quietly comforting.",
      displayDate: "2026-03-24",
      personName: "Self",
    });

    expect(prompt).toContain("highlight");
    expect(prompt).toContain("unseen_joy");
    expect(prompt).toContain("gentle_reflection");
    expect(prompt).toContain("emotion_signal");
    expect(prompt).toContain("没意识到");
    expect(prompt).toContain("2026-03-24");
    expect(prompt).toContain("I bought myself a hot drink on the way home.");
    expect(prompt).toContain("Self");
  });

  it("explicitly requires second-person wording instead of third-person labels like user or author", () => {
    const prompt = buildEventInsightPrompt({
      content: "I bought myself a hot drink on the way home.",
      reason: "It felt quietly comforting.",
      displayDate: "2026-03-24",
      personName: "Self",
    });

    expect(prompt).toContain("一律使用第二人称“你”");
    expect(prompt).toContain("不要使用“用户”");
    expect(prompt).toContain("不要使用“作者”");
  });

  it("embeds the richer literary and positive-psychology guidance without shrinking the requested depth", () => {
    const prompt = buildEventInsightPrompt({
      content: "I wrote down ten good things today.",
      reason: "It made me feel steadier.",
      displayDate: "2026-03-24",
      personName: "Self",
    });

    expect(prompt).toContain("治愈系文学评论家");
    expect(prompt).toContain("积极心理学专家");
    expect(prompt).toContain("微米级");
    expect(prompt).toContain("隐微之光");
    expect(prompt).toContain("核心高光");
    expect(prompt).toContain("线索标签");
    expect(prompt).toContain("必须以“你可能还没意识到……”开头");
    expect(prompt).toContain("动作 + 意义");
    expect(prompt).toContain("杜绝空话");
    expect(prompt).toContain("去工具化");
    expect(prompt).toContain("JSON 约束");
  });
});

describe("normalizeEventInsightResult", () => {
  it("normalizes a valid single-record insight payload", () => {
    expect(
      normalizeEventInsightResult({
        unseen_joy: {
          title: "A kindness you did not name",
          content: "Buying the drink also quietly protected your energy before going home.",
        },
        highlight: {
          title: "A warm pause",
          content: "The drink turned an ordinary commute into a moment of care.",
        },
        gentle_reflection:
          "You only wrote down a small purchase, but it still shows self-kindness.",
        emotion_signal: {
          title: "Emotion softens",
          content: "This choice suggests a wish to let the day land more gently.",
        },
        relationship_signal: {
          title: "Care returns to self",
          content: "No one else appears here, but the record still contains care.",
        },
        value_signal: {
          title: "Everyday steadiness matters",
          content: "You seem to value small forms of real comfort over spectacle.",
        },
      }),
    ).toEqual({
      unseen_joy: {
        title: "A kindness you did not name",
        content: "Buying the drink also quietly protected your energy before going home.",
      },
      highlight: {
        title: "A warm pause",
        content: "The drink turned an ordinary commute into a moment of care.",
      },
      gentle_reflection:
        "You only wrote down a small purchase, but it still shows self-kindness.",
      emotion_signal: {
        title: "Emotion softens",
        content: "This choice suggests a wish to let the day land more gently.",
      },
      relationship_signal: {
        title: "Care returns to self",
        content: "No one else appears here, but the record still contains care.",
      },
      value_signal: {
        title: "Everyday steadiness matters",
        content: "You seem to value small forms of real comfort over spectacle.",
      },
    });
  });

  it("upgrades a legacy single-record insight payload by deriving unseen joy from existing fields", () => {
    expect(
      normalizeEventInsightResult({
        highlight: {
          title: "A warm pause",
          content: "The drink turned an ordinary commute into a moment of care.",
        },
        gentle_reflection:
          "You only wrote down a small purchase, but it still shows self-kindness.",
        emotion_signal: {
          title: "Emotion softens",
          content: "This choice suggests a wish to let the day land more gently.",
        },
        relationship_signal: {
          title: "Care returns to self",
          content: "No one else appears here, but the record still contains care.",
        },
        value_signal: {
          title: "Everyday steadiness matters",
          content: "You seem to value small forms of real comfort over spectacle.",
        },
      }),
    ).toMatchObject({
      unseen_joy: {
        title: "You may not have noticed this small joy yet",
      },
      highlight: {
        title: "A warm pause",
      },
    });
  });

  it("rewrites third-person references like user and author into second-person wording", () => {
    expect(
      normalizeEventInsightResult({
        unseen_joy: {
          title: "用户没写出来的小幸福",
          content: "作者在记录里其实已经表现出对自己的照顾，只是用户还没有意识到。",
        },
        highlight: {
          title: "用户的亮点",
          content: "记录里，用户没有只写事实，作者其实也写下了自己的触动。",
        },
        gentle_reflection:
          "用户没有把这件事写得很大，但作者已经在认真接住自己的感受。",
        emotion_signal: {
          title: "用户的情绪变清楚了",
          content: "记录里，用户从烦乱转向清晰。",
        },
        relationship_signal: {
          title: "作者和世界重新靠近",
          content: "作者开始重新感受到外界的支持。",
        },
        value_signal: {
          title: "用户更看重真实感受",
          content: "用户开始把真实的舒展放在前面。",
        },
      }),
    ).toEqual({
      unseen_joy: {
        title: "你没写出来的小幸福",
        content: "你在记录里其实已经表现出对自己的照顾，只是你还没有意识到。",
      },
      highlight: {
        title: "你的亮点",
        content: "记录里，你没有只写事实，你其实也写下了自己的触动。",
      },
      gentle_reflection:
        "你没有把这件事写得很大，但你已经在认真接住自己的感受。",
      emotion_signal: {
        title: "你的情绪变清楚了",
        content: "记录里，你从烦乱转向清晰。",
      },
      relationship_signal: {
        title: "你和世界重新靠近",
        content: "你开始重新感受到外界的支持。",
      },
      value_signal: {
        title: "你更看重真实感受",
        content: "你开始把真实的舒展放在前面。",
      },
    });
  });

  it("accepts the richer clues array format and maps it into the detail-page signal fields", () => {
    expect(
      normalizeEventInsightResult({
        unseen_joy: {
          title: "你没意识到的小幸福",
          content:
            "你可能还没意识到……你愿意反复记录这些小事，本身就说明你还保留着和生活相认的能力。",
        },
        highlight: {
          title: "习惯成为捕捉幸福的日常滤镜",
          content:
            "你把写下日常这件事，慢慢练成了一种重新看见生活的方式，那些原本会被略过的片刻，也因此重新发亮。",
        },
        gentle_reflection:
          "你把写下日常这件事，慢慢练成了一种重新看见生活的方式，那些原本会被略过的片刻，也因此重新发亮。",
        clues: [
          {
            type: "情绪线索",
            title: "静谧里的回稳",
            content: "你在记录时呈现出一种慢慢沉回自己的安定感。",
          },
          {
            type: "关系线索",
            title: "与你自己重新靠近",
            content: "你在反复书写和回望里，和自己的感受建立了更稳的连接。",
          },
          {
            type: "价值观线索",
            title: "珍视平凡细节",
            content: "你很在意那些不喧闹但真实发生过的微小幸福。",
          },
        ],
      }),
    ).toEqual({
      unseen_joy: {
        title: "你没意识到的小幸福",
        content:
          "你可能还没意识到……你愿意反复记录这些小事，本身就说明你还保留着和生活相认的能力。",
      },
      highlight: {
        title: "习惯成为捕捉幸福的日常滤镜",
        content:
          "你把写下日常这件事，慢慢练成了一种重新看见生活的方式，那些原本会被略过的片刻，也因此重新发亮。",
      },
      gentle_reflection:
        "你把写下日常这件事，慢慢练成了一种重新看见生活的方式，那些原本会被略过的片刻，也因此重新发亮。",
      emotion_signal: {
        title: "静谧里的回稳",
        content: "你在记录时呈现出一种慢慢沉回自己的安定感。",
      },
      relationship_signal: {
        title: "与你自己重新靠近",
        content: "你在反复书写和回望里，和自己的感受建立了更稳的连接。",
      },
      value_signal: {
        title: "珍视平凡细节",
        content: "你很在意那些不喧闹但真实发生过的微小幸福。",
      },
    });
  });
});

describe("normalizeSummaryResult", () => {
  it("normalizes a valid AI summary payload", () => {
    expect(
      normalizeSummaryResult({
        mood_weather: {
          title: "Warm light",
          icon: "Sun",
          description: "Lately you seem more open to gentle moments.",
        },
        keywords: ["breeze", "walk", "sunset", "cocoa", "hug"],
        personality: {
          title: "Detail collector",
          description: "You notice small moments of warmth and keep them carefully.",
        },
        suggestions: [
          {
            title: "Evening walk",
            content: "Let the breeze soften your mood again.",
            icon: "TreePine",
          },
          {
            title: "Warm drink time",
            content: "Save a small warm pause for yourself.",
            icon: "Coffee",
          },
        ],
      }),
    ).toEqual({
      mood_weather: {
        title: "Warm light",
        icon: "Sun",
        score: 68,
        description: "Lately you seem more open to gentle moments.",
      },
      keywords: ["breeze", "walk", "sunset", "cocoa", "hug"],
      personality: {
        title: "Detail collector",
        description: "You notice small moments of warmth and keep them carefully.",
      },
      suggestions: [
        {
          title: "Evening walk",
          content: "Let the breeze soften your mood again.",
          icon: "TreePine",
        },
        {
          title: "Warm drink time",
          content: "Save a small warm pause for yourself.",
          icon: "Coffee",
        },
      ],
    });
  });

  it("extracts and normalizes JSON embedded in a model response", () => {
    expect(
      normalizeSummaryResult(`Here is the summary: {
  "mood_weather": {
    "title": "Warm light",
    "icon": "Sunrise",
    "description": "Lately you seem more open to gentle moments."
  },
  "keywords": ["sunset", "walk", "hug", "cocoa", "light"],
  "personality": {
    "title": "Micro-glow collector",
    "description": "You notice small echoes in daily life and stay with them."
  },
  "suggestions": [
    { "title": "Watch the sunset", "content": "Give tomorrow evening a soft appointment.", "icon": "Sunset" },
    { "title": "Sip something warm", "content": "Leave your heart a moment of care.", "icon": "Coffee" }
  ]
}`),
    ).toEqual({
      mood_weather: {
        title: "Warm light",
        icon: "Sunrise",
        score: 68,
        description: "Lately you seem more open to gentle moments.",
      },
      keywords: ["sunset", "walk", "hug", "cocoa", "light"],
      personality: {
        title: "Micro-glow collector",
        description: "You notice small echoes in daily life and stay with them.",
      },
      suggestions: [
        {
          title: "Watch the sunset",
          content: "Give tomorrow evening a soft appointment.",
          icon: "Sunset",
        },
        {
          title: "Sip something warm",
          content: "Leave your heart a moment of care.",
          icon: "Coffee",
        },
      ],
    });
  });
});

describe("normalizeSummaryResult score handling", () => {
  it("keeps an explicit mood weather score returned by the AI payload", () => {
    expect(
      normalizeSummaryResult({
        mood_weather: {
          title: "Warm light",
          icon: "Sun",
          score: 78,
          description: "Lately you seem more open to gentle moments and self-care.",
        },
        keywords: ["breeze", "walk", "sunset", "cocoa", "hug"],
        personality: {
          title: "Detail collector",
          description: "You keep noticing micro-glows in ordinary life.",
        },
        suggestions: [
          {
            title: "Evening walk",
            content: "Let the breeze soften your mood again.",
            icon: "TreePine",
          },
          {
            title: "Warm drink time",
            content: "Save a small warm pause for yourself.",
            icon: "Coffee",
          },
        ],
      }),
    ).toMatchObject({
      mood_weather: {
        title: "Warm light",
        icon: "Sun",
        score: 78,
      },
    });
  });
});
