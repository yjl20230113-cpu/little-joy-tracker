describe("generate auto image route", () => {
  const originalFetch = global.fetch;
  const originalDeepSeekApiKey = process.env.DEEPSEEK_API_KEY;
  const originalUnsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

  beforeEach(() => {
    process.env.DEEPSEEK_API_KEY = "test-deepseek-key";
    process.env.UNSPLASH_ACCESS_KEY = "test-unsplash-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.DEEPSEEK_API_KEY = originalDeepSeekApiKey;
    process.env.UNSPLASH_ACCESS_KEY = originalUnsplashAccessKey;
    vi.restoreAllMocks();
  });

  it("returns the first Unsplash image plus attribution metadata and triggers download tracking", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  keywords: [
                    "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
                    "foggy lake, high quality photography, soft tones, minimalist, aesthetic",
                    "muted horizon, high quality photography, soft tones, minimalist, aesthetic",
                  ],
                }),
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: "photo-1",
              urls: {
                regular: "https://images.unsplash.com/photo-1",
              },
              links: {
                html: "https://unsplash.com/photos/photo-1",
                download_location: "https://api.unsplash.com/photos/photo-1/download",
              },
              user: {
                name: "A Photographer",
                links: {
                  html: "https://unsplash.com/@photographer",
                },
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    global.fetch = fetchMock as typeof fetch;

    const routeModule = await import("./route");
    expect(routeModule.POST).toBeTypeOf("function");

    const request = new Request("http://localhost/api/generate-auto-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "雨后的傍晚很安静",
        reason: "像把一天慢慢放下来了",
      }),
    });

    const response = await routeModule.POST(request);
    const payload = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const [deepSeekUrl, deepSeekInit] = fetchMock.mock.calls[0];
    expect(String(deepSeekUrl)).toContain("api.deepseek.com/chat/completions");
    expect(String(deepSeekInit?.body)).toContain("雨后的傍晚很安静");
    expect(String(deepSeekInit?.body)).toContain("像把一天慢慢放下来了");

    const [unsplashUrl] = fetchMock.mock.calls[1];
    expect(String(unsplashUrl)).toContain("api.unsplash.com/search/photos");
    expect(String(unsplashUrl)).toContain("per_page=1");
    expect(String(unsplashUrl)).toContain("content_filter=high");
    expect(String(unsplashUrl)).toContain("orientation=squarish");

    expect(payload).toEqual({
      imageUrl: "https://images.unsplash.com/photo-1",
      keywords: [
        "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
        "foggy lake, high quality photography, soft tones, minimalist, aesthetic",
        "muted horizon, high quality photography, soft tones, minimalist, aesthetic",
      ],
      query:
        "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
      photoId: "photo-1",
      photoPageUrl: "https://unsplash.com/photos/photo-1",
      photographerName: "A Photographer",
      photographerProfileUrl: "https://unsplash.com/@photographer",
      downloadLocation: "https://api.unsplash.com/photos/photo-1/download",
    });

    const [downloadUrl] = fetchMock.mock.calls[2];
    expect(downloadUrl).toBe("https://api.unsplash.com/photos/photo-1/download");
  });

  it("returns 400 when no event text is provided", async () => {
    const routeModule = await import("./route");
    expect(routeModule.POST).toBeTypeOf("function");

    const request = new Request("http://localhost/api/generate-auto-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "   ",
        reason: " ",
      }),
    });

    const response = await routeModule.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("No event text provided");
  });

  it("returns 500 when the Unsplash key is missing", async () => {
    process.env.UNSPLASH_ACCESS_KEY = "";

    const routeModule = await import("./route");
    expect(routeModule.POST).toBeTypeOf("function");

    const request = new Request("http://localhost/api/generate-auto-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "想记下这阵晚风",
      }),
    });

    const response = await routeModule.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("UNSPLASH_ACCESS_KEY is missing");
  });

  it("returns 404 when Unsplash finds no matching image", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  keywords: [
                    "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
                    "foggy lake, high quality photography, soft tones, minimalist, aesthetic",
                    "muted horizon, high quality photography, soft tones, minimalist, aesthetic",
                  ],
                }),
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      });

    global.fetch = fetchMock as typeof fetch;

    const routeModule = await import("./route");
    expect(routeModule.POST).toBeTypeOf("function");

    const request = new Request("http://localhost/api/generate-auto-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "今天的云层像安静的海",
      }),
    });

    const response = await routeModule.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toBe("Unsplash returned no matching image");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("falls back to the next keyword when the first Unsplash query has no results", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  keywords: [
                    "rare still life, high quality photography, soft tones, minimalist, aesthetic",
                    "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
                    "foggy lake, high quality photography, soft tones, minimalist, aesthetic",
                  ],
                }),
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [
            {
              id: "photo-2",
              urls: {
                regular: "https://images.unsplash.com/photo-2",
              },
              links: {
                html: "https://unsplash.com/photos/photo-2",
                download_location: "https://api.unsplash.com/photos/photo-2/download",
              },
              user: {
                name: "B Photographer",
                links: {
                  html: "https://unsplash.com/@bphotographer",
                },
              },
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

    global.fetch = fetchMock as typeof fetch;

    const routeModule = await import("./route");
    expect(routeModule.POST).toBeTypeOf("function");

    const request = new Request("http://localhost/api/generate-auto-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: "A quiet morning by the water",
        reason: "It felt like the day finally slowed down",
      }),
    });

    const response = await routeModule.POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    const firstUnsplashUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    const secondUnsplashUrl = new URL(String(fetchMock.mock.calls[2]?.[0]));
    expect(firstUnsplashUrl.searchParams.get("query")).toBe(
      "rare still life, high quality photography, soft tones, minimalist, aesthetic",
    );
    expect(secondUnsplashUrl.searchParams.get("query")).toBe(
      "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
    );
    expect(payload.query).toBe(
      "calm water ripples, high quality photography, soft tones, minimalist, aesthetic",
    );
    expect(payload.imageUrl).toBe("https://images.unsplash.com/photo-2");
  });
});
