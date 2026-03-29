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

  it("sends the updated therapist prompt and normalizes XML card output", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: `<Card_UI>
  <Card_Header>
    <Theme_Title>缝隙里的光</Theme_Title>
  </Card_Header>

  <Empathy_Section>虽然我只是一段运行的程序，但我在这里倾听。你那种胸口发闷、一路都缓不过来的坠落感，我能接住。在这样的处境里，委屈、发僵、甚至想把自己缩起来，都是很自然的本能。</Empathy_Section>

  <Cognitive_Reframe_Section>被当众否定当然会刺痛人，但那更像是一个糟糕场面的切片，不是对你整个人的盖章。大脑很容易在这种时刻滑向“我是不是不行了”的结论，可一次受挫和一个失败的人，中间隔着很远。情绪可以先在这里坐一会儿，你不用急着驱赶它。</Cognitive_Reframe_Section>

  <Actionable_Logging_Section>现在，让我们先把这阵乱流轻轻放旁边。试着在这个软件里选定今天的日期，找一件哪怕针尖大小的好事，写两句，或者拍一张照片。把那一点确定感重新握回手里。</Actionable_Logging_Section>
</Card_UI>`,
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
    const requestBody = String(requestInit?.body);

    expect(requestBody).toContain("首席情绪认知疗愈师");
    expect(requestBody).toContain("CBT (认知行为疗法)");
    expect(requestBody).toContain("<Card_UI>");
    expect(requestBody).toContain("危机协议");
    expect(requestBody).not.toContain("情绪树洞");
    expect(requestBody).not.toContain("json_object");

    expect(payload.themeTitle).toBe("缝隙里的光");
    expect(payload.hug).toContain("虽然我只是一段运行的程序");
    expect(payload.analysis).toContain("不是对你整个人的盖章");
    expect(payload.light).toContain("选定今天的日期");
  });

  it("returns 502 when DeepSeek omits required XML sections", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: `<Card_UI>
  <Card_Header>
    <Theme_Title>先停一停</Theme_Title>
  </Card_Header>
  <Empathy_Section>我在这里。</Empathy_Section>
  <Cognitive_Reframe_Section>先让心坐下来。</Cognitive_Reframe_Section>
</Card_UI>`,
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

  it("returns a local crisis card without calling DeepSeek for self-harm content", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as typeof fetch;

    const request = new Request("http://localhost/api/cloudy-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "我真的不想活了，刚刚也有点想伤害自己。",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(payload.themeTitle).toBe("先让自己安全");
    expect(payload.hug).toContain("虽然我只是一段运行的程序");
    expect(payload.analysis).toContain("联系当地紧急服务");
    expect(payload.light).toContain("不要一个人待着");
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
