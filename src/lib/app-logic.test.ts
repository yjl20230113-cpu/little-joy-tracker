import {
  buildEventPayload,
  buildSummaryRequestEvents,
  buildSummaryPrompt,
  createDefaultPersonPayload,
  filterTimelineItems,
  formatDetailTimestamp,
  formatTimelineHeading,
  formatTimelineTime,
  getPostSignupWelcomeMessage,
  getRetryAfterSeconds,
  groupTimelineItemsByDate,
  isRateLimitError,
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

describe("buildSummaryRequestEvents", () => {
  it("keeps content, reason, and time for summary requests", () => {
    expect(
      buildSummaryRequestEvents([
        {
          id: "event-1",
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
        { id: "2", name: "男朋友", is_default: true },
      ]),
    ).toEqual({ id: "2", name: "男朋友", is_default: true });
  });

  it("falls back to the first person", () => {
    expect(
      pickInitialPerson([
        { id: "1", name: "妈妈", is_default: false },
        { id: "2", name: "男朋友", is_default: false },
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
        reason: "  很安静  ",
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
        content: "买到了喜欢的花",
        reason: "   ",
        displayDate: "2026-03-22",
      }),
    ).toEqual({
      user_id: "user-1",
      person_id: "person-1",
      content: "买到了喜欢的花",
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

describe("createDefaultPersonPayload", () => {
  it("creates the default self person payload", () => {
    expect(createDefaultPersonPayload("user-1")).toEqual({
      user_id: "user-1",
      name: "自己",
      is_default: true,
    });
  });
});

describe("normalizePersonName", () => {
  it("trims spaces and normalizes casing for duplicate checks", () => {
    expect(normalizePersonName("  SELF  ")).toBe("self");
    expect(normalizePersonName("  爸爸 ")).toBe("爸爸");
  });
});

describe("getPostSignupWelcomeMessage", () => {
  it("returns a clear welcome message for new users", () => {
    expect(getPostSignupWelcomeMessage()).toBe(
      "欢迎来到小美好记录器，已经为你准备好默认记录对象“自己”，现在就开始记录吧。",
    );
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
      content: "A",
      reason: null,
      imageUrl: null,
      displayDate: "2026-03-22",
      createdAt: "2026-03-22T13:10:45.000Z",
      personName: "自己",
      personId: "person-self",
    },
    {
      id: "event-2",
      content: "B",
      reason: null,
      imageUrl: null,
      displayDate: "2026-03-18",
      createdAt: "2026-03-18T05:00:00.000Z",
      personName: "男朋友",
      personId: "person-bf",
    },
    {
      id: "event-3",
      content: "C",
      reason: null,
      imageUrl: null,
      displayDate: "2026-02-10",
      createdAt: "2026-02-10T05:00:00.000Z",
      personName: "自己",
      personId: "person-self",
    },
  ];

  it("filters by selected person", () => {
    expect(
      filterTimelineItems(items, {
        personId: "person-bf",
        range: "month",
        customStartDate: "",
        customEndDate: "",
        today: "2026-03-22",
      }).map((item) => item.id),
    ).toEqual(["event-2"]);
  });

  it("filters by the past week range", () => {
    expect(
      filterTimelineItems(items, {
        personId: "all",
        range: "week",
        customStartDate: "",
        customEndDate: "",
        today: "2026-03-22",
      }).map((item) => item.id),
    ).toEqual(["event-1", "event-2"]);
  });

  it("filters by the past three months range", () => {
    expect(
      filterTimelineItems(items, {
        personId: "all",
        range: "threeMonths",
        customStartDate: "",
        customEndDate: "",
        today: "2026-03-22",
      }).map((item) => item.id),
    ).toEqual(["event-1", "event-2", "event-3"]);
  });
});

describe("groupTimelineItemsByDate", () => {
  it("groups timeline items by display date", () => {
    const groups = groupTimelineItemsByDate([
      {
        id: "event-1",
        content: "A",
        reason: null,
        imageUrl: null,
        displayDate: "2026-03-22",
        createdAt: "2026-03-22T13:10:45.000Z",
        personName: "自己",
        personId: "person-self",
      },
      {
        id: "event-2",
        content: "B",
        reason: null,
        imageUrl: null,
        displayDate: "2026-03-22",
        createdAt: "2026-03-22T05:00:00.000Z",
        personName: "男朋友",
        personId: "person-bf",
      },
      {
        id: "event-3",
        content: "C",
        reason: null,
        imageUrl: null,
        displayDate: "2026-03-20",
        createdAt: "2026-03-20T05:00:00.000Z",
        personName: "自己",
        personId: "person-self",
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0]?.date).toBe("2026-03-22");
    expect(groups[0]?.items.map((item) => item.id)).toEqual([
      "event-1",
      "event-2",
    ]);
    expect(groups[1]?.date).toBe("2026-03-20");
  });
});

describe("timeline formatting", () => {
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
          title: "灿烂",
          icon: "Sun",
          description:
            "本阶段 85% 的时间，你处于被暖光轻轻托住的状态。你的成长表现为韧性。",
        },
        keywords: ["晚风", "散步", "晚霞", "热可可", "拥抱"],
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
        title: "灿烂",
        icon: "Sun",
        description:
          "本阶段 85% 的时间，你处于被暖光轻轻托住的状态。你的成长表现为韧性。",
      },
      keywords: ["晚风", "散步", "晚霞", "热可可", "拥抱"],
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
      normalizeSummaryResult(`这里是总结：{
  "mood_weather": {
    "title": "暖阳",
    "icon": "Sunrise",
    "description": "本阶段 78% 的时间，你处于缓慢发亮的状态。你的成长表现为安定。"
  },
  "keywords": ["晚霞", "散步", "抱抱", "可可", "灯光"],
  "personality": {
    "title": "微光收藏家",
    "description": "你很会留意生活的细小回响，也愿意为它们停留。"
  },
  "suggestions": [
    { "title": "去看日落", "content": "让傍晚成为你下个月最柔软的约定。", "icon": "Sunset" },
    { "title": "慢慢喝杯热饮", "content": "给心留一点被照顾的时间。", "icon": "Coffee" }
  ]
}`),
    ).toEqual({
      mood_weather: {
        title: "暖阳",
        icon: "Sunrise",
        description: "本阶段 78% 的时间，你处于缓慢发亮的状态。你的成长表现为安定。",
      },
      keywords: ["晚霞", "散步", "抱抱", "可可", "灯光"],
      personality: {
        title: "微光收藏家",
        description: "你很会留意生活的细小回响，也愿意为它们停留。",
      },
      suggestions: [
        { title: "去看日落", content: "让傍晚成为你下个月最柔软的约定。", icon: "Sunset" },
        { title: "慢慢喝杯热饮", content: "给心留一点被照顾的时间。", icon: "Coffee" },
      ],
    });
  });
});
