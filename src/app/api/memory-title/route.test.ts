import { POST } from "./route";

describe("memory title route", () => {
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

  it("sends the title prompt and returns normalized items", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                items: [
                  { index: 0, title: "晨光散步" },
                  { index: 1, title: "晚风轻语" },
                ],
              }),
            },
          },
        ],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    const request = new Request("http://localhost/api/memory-title", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          {
            content: "今天去散步",
            reason: "很舒服",
            time: "2026-03-22 21:10:45",
          },
          {
            content: "晚上吹风",
            reason: "很安静",
            time: "2026-03-22 22:10:45",
          },
        ],
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestInit?.body)).toContain("四到六字标题");
    expect(payload.items).toEqual([
      { index: 0, title: "晨光散步" },
      { index: 1, title: "晚风轻语" },
    ]);
  });
});
