import { describe, expect, it } from "vitest";

import {
  buildEventPayload,
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
          title: "测试标题",
          content: "一起散步",
          reason: "晚风很轻",
          imageUrl: "https://example.com/a.jpg",
          displayDate: "2026-03-22",
          createdAt: "2026-03-22T21:10:45+08:00",
          personName: "自己",
          personId: "person-self",
        },
      ]),
    ).toEqual([
      {
        content: "一起散步",
        reason: "晚风很轻",
        time: "2026-03-22 21:10:45",
      },
    ]);
  });
});

describe("pickInitialPerson", () => {
  it("prefers the default person", () => {
    expect(
      pickInitialPerson([
        { id: "1", name: "妈妈", is_default: false },
        { id: "2", name: "你", is_default: true },
      ]),
    ).toEqual({ id: "2", name: "你", is_default: true });
  });

  it("falls back to the first person", () => {
    expect(
      pickInitialPerson([
        { id: "1", name: "妈妈", is_default: false },
        { id: "2", name: "你", is_default: false },
      ]),
    ).toEqual({ id: "1", name: "妈妈", is_default: false });
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
        content: "  一起看晚霞  ",
        reason: "  很安静 ",
        displayDate: "2026-03-22",
      }),
    ).toEqual({
      user_id: "user-1",
      person_id: "person-1",
      content: "一起看晚霞",
      reason: "很安静",
      image_urls: null,
      display_date: "2026-03-22",
    });
  });

  it("drops an empty reason", () => {
    expect(
      buildEventPayload({
        userId: "user-1",
        personId: "person-1",
        content: "买到喜欢的花",
        reason: "   ",
        displayDate: "2026-03-22",
      }),
    ).toEqual({
      user_id: "user-1",
      person_id: "person-1",
      content: "买到喜欢的花",
      reason: null,
      image_urls: null,
      display_date: "2026-03-22",
    });
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
    expect(normalizePersonName("  爸爸 ")).toBe("爸爸");
    expect(normalizePersonName("  我   自己 ")).toBe("我 自己");
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
      personName: "自己",
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
      personName: "爸爸",
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
          personName: "自己",
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
          personName: "自己",
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
          personName: "爸爸",
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
      "1. content: 一起看晚霞\nreason: 天空很软\ntime: 2026-03-22 21:10:45",
      "2. content: 晚饭后的散步\nreason: 风很舒服\ntime: 2026-03-20 20:00:00",
    ]);

    expect(prompt).toContain("治愈系生活观察家");
    expect(prompt).toContain("一起看晚霞");
    expect(prompt).toContain("time: 2026-03-22 21:10:45");
  });
});

describe("normalizeSummaryResult", () => {
  it("normalizes a valid AI summary payload", () => {
    expect(
      normalizeSummaryResult({
        mood_weather: {
          title: "暖阳",
          icon: "Sun",
          description: "最近的你，更容易被温柔支撑着。",
        },
        keywords: ["晚风", "散步", "晚霞", "可可", "拥抱"],
        personality: {
          title: "细节捕捉大师",
          description: "你总能从平凡里发现温柔，也愿意把它们认真收好。",
        },
        suggestions: [
          {
            title: "傍晚散步",
            content: "让晚风再一次把你的情绪轻轻放松下来。",
            icon: "TreePine",
          },
          {
            title: "热可可时间",
            content: "给自己留一个热饮时刻，让温柔慢慢回到身体里。",
            icon: "Coffee",
          },
        ],
      }),
    ).toEqual({
      mood_weather: {
        title: "暖阳",
        icon: "Sun",
        description: "最近的你，更容易被温柔支撑着。",
      },
      keywords: ["晚风", "散步", "晚霞", "可可", "拥抱"],
      personality: {
        title: "细节捕捉大师",
        description: "你总能从平凡里发现温柔，也愿意把它们认真收好。",
      },
      suggestions: [
        {
          title: "傍晚散步",
          content: "让晚风再一次把你的情绪轻轻放松下来。",
          icon: "TreePine",
        },
        {
          title: "热可可时间",
          content: "给自己留一个热饮时刻，让温柔慢慢回到身体里。",
          icon: "Coffee",
        },
      ],
    });
  });

  it("extracts and normalizes JSON embedded in a model response", () => {
    expect(
      normalizeSummaryResult(`这里是总结：
{
  "mood_weather": {
    "title": "暖阳",
    "icon": "Sunrise",
    "description": "最近的你，更容易被温柔支撑着。"
  },
  "keywords": ["晚霞", "散步", "拥抱", "可可", "灯光"],
  "personality": {
    "title": "微光收藏家",
    "description": "你很会留意生活的细小回响，也愿意为它们停留。"
  },
  "suggestions": [
    { "title": "去看日落", "content": "让傍晚成为你下个星期最柔软的约定。", "icon": "Sunset" },
    { "title": "慢慢喝杯热饮", "content": "给心留一点被照顾的时间。", "icon": "Coffee" }
  ]
}`),
    ).toEqual({
      mood_weather: {
        title: "暖阳",
        icon: "Sunrise",
        description: "最近的你，更容易被温柔支撑着。",
      },
      keywords: ["晚霞", "散步", "拥抱", "可可", "灯光"],
      personality: {
        title: "微光收藏家",
        description: "你很会留意生活的细小回响，也愿意为它们停留。",
      },
      suggestions: [
        {
          title: "去看日落",
          content: "让傍晚成为你下个星期最柔软的约定。",
          icon: "Sunset",
        },
        {
          title: "慢慢喝杯热饮",
          content: "给心留一点被照顾的时间。",
          icon: "Coffee",
        },
      ],
    });
  });
});

