import { render, waitFor } from "@testing-library/react";
import { PwaRegistrar } from "./PwaRegistrar";

describe("PwaRegistrar", () => {
  const originalEnv = process.env.NODE_ENV;
  const originalFetch = global.fetch;
  const originalServiceWorker = navigator.serviceWorker;
  const originalCaches = globalThis.caches;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    global.fetch = originalFetch;
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: originalServiceWorker,
    });
    if (originalCaches) {
      vi.stubGlobal("caches", originalCaches);
    }
    vi.restoreAllMocks();
  });

  it("unregisters old service workers and clears app-shell caches in development", async () => {
    process.env.NODE_ENV = "development";
    const unregister = vi.fn().mockResolvedValue(undefined);
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }]);
    const register = vi.fn();
    const deleteCache = vi.fn().mockResolvedValue(true);
    const getCacheKeys = vi
      .fn()
      .mockResolvedValue(["little-joy-tracker-shell-v2", "unrelated-cache"]);

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register,
        getRegistrations,
      },
    });
    vi.stubGlobal("caches", {
      keys: getCacheKeys,
      delete: deleteCache,
    });

    render(<PwaRegistrar />);

    await waitFor(() => {
      expect(getRegistrations).toHaveBeenCalled();
      expect(unregister).toHaveBeenCalled();
      expect(deleteCache).toHaveBeenCalledWith("little-joy-tracker-shell-v2");
    });

    expect(register).not.toHaveBeenCalled();
    expect(deleteCache).not.toHaveBeenCalledWith("unrelated-cache");
  });

  it("registers the service worker in production", async () => {
    process.env.NODE_ENV = "production";
    const register = vi.fn().mockResolvedValue(undefined);
    const getRegistrations = vi.fn();

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register,
        getRegistrations,
      },
    });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "build-2",
    } as Response);

    render(<PwaRegistrar />);

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith("/sw.js");
    });

    expect(getRegistrations).not.toHaveBeenCalled();
  });
});
