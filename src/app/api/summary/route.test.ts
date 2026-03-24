import { POST } from "./route";

describe("summary route", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.DEEPSEEK_API_KEY;

  beforeEach(() => {
    process.env.DEEPSEEK_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.DEEPSEEK_API_KEY = originalApiKey;
    vi.restoreAllMocks();
  });

  it("sends content, reason, and time to DeepSeek and returns the normalized report with a score", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                mood_weather: {
                  title: "暖阳",
                  icon: "Sun",
                  score: 82,
                  description: "这段时间你大多处在温柔舒展的状态里，成长的关键词是安定。",
                },
                keywords: ["散步", "晚风", "灯光", "拥抱", "热饮"],
                personality: {
                  title: "微光收藏家",
                  description: "你总能在细节里捧起温柔，再轻轻收进心里。",
                },
                suggestions: [
                  {
                    title: "黄昏散步",
                    content: "让傍晚的风继续陪你把情绪慢慢放松下来。",
                    icon: "TreePine",
                  },
                  {
                    title: "热饮时刻",
                    content: "给自己留一个热可可的空档，重新抱一抱自己。",
                    icon: "Coffee",
                  },
                ],
              }),
            },
          },
        ],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    const request = new Request("http://localhost/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          {
            content: "一起散步回家",
            reason: "晚风把一天的疲惫吹轻了",
            time: "2026-03-22 21:10:45",
          },
        ],
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestInit?.body)).toContain("time: 2026-03-22 21:10:45");
    expect(payload.mood_weather.title).toBe("暖阳");
    expect(payload.mood_weather.score).toBe(82);
    expect(payload.suggestions).toHaveLength(2);
  });
});
