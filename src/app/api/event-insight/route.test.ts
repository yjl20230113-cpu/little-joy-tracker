import { POST } from "./route";

describe("event insight route", () => {
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

  it("sends single-record context to DeepSeek and returns the normalized insight payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
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
            },
          },
        ],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    const request = new Request("http://localhost/api/event-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "I bought myself a hot drink on the way home.",
        reason: "",
        displayDate: "2026-03-24",
        personName: "Self",
      }),
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, requestInit] = fetchMock.mock.calls[0];
    expect(String(requestInit?.body)).toContain("I bought myself a hot drink on the way home.");
    expect(String(requestInit?.body)).toContain("2026-03-24");
    expect(payload.unseen_joy.title).toBe("A kindness you did not name");
    expect(payload.highlight.title).toBe("A warm pause");
    expect(payload.relationship_signal.title).toBe("Care returns to self");
  });
});
