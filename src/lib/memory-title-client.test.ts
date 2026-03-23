import {
  generateMemoryTitles,
} from "./memory-title-client";

describe("generateMemoryTitles", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("returns generated titles when the API responds with valid items", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          { index: 0, title: "晨光散步" },
          { index: 1, title: "晚风轻语" },
        ],
      }),
    });

    global.fetch = fetchMock as typeof fetch;

    await expect(
      generateMemoryTitles([
        { content: "今天去散步", reason: "很舒服" },
        { content: "晚上吹风", reason: "很安静" },
      ]),
    ).resolves.toEqual(["晨光散步", "晚风轻语"]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("retries once and then falls back locally", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ index: 0, title: "太短" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [{ index: 0, title: "太短了" }] }),
      });

    global.fetch = fetchMock as typeof fetch;

    await expect(
      generateMemoryTitles([{ content: "今天和爸爸一起去散步，晚风很舒服。", reason: "" }]),
    ).resolves.toEqual(["今天和爸爸一"]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
