import { POST } from "./route";

describe("cloudy analysis route", () => {
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

  it("sends the complaint text to DeepSeek and returns the normalized reply", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hug: "我听见你在人群里悄悄绷紧了肩膀，那种委屈没有地方落下。",
                analysis: "这未必是你不够好，更像是今天的风太硬，让心先起了褶皱。",
                light: "去洗手台用冷水拍拍脸，让皮肤先替你把乌云撕开一点。",
              }),
            },
          },
        ],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    const request = new Request("http://localhost/api/cloudy-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "今天开会又被当众否定，我一路回家都觉得胸口发闷。",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestInit?.body)).toContain("今天开会又被当众否定");
    expect(String(requestInit?.body)).toContain("小王子");
    expect(payload.hug).toContain("肩膀");
    expect(payload.analysis).toContain("风太硬");
    expect(payload.light).toContain("冷水");
  });

  it("returns 502 when DeepSeek omits required fields", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                hug: "我在这里。",
                analysis: "先坐下来。",
              }),
            },
          },
        ],
      }),
    }) as typeof fetch;

    const request = new Request("http://localhost/api/cloudy-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "今天真的有点撑不住。",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).toBe("Cloudy analysis format is incomplete");
  });

  it("returns 502 when DeepSeek responds without a usable message body", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [],
      }),
    }) as typeof fetch;

    const request = new Request("http://localhost/api/cloudy-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "今天脑子里像堵着一团潮湿的云。",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(502);
    expect(payload.error).toBe("DeepSeek returned an empty response");
  });
});
