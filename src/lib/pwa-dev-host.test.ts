import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

function evaluateIsLocalDevHost(hostname: string) {
  const source = fs.readFileSync(
    path.join(process.cwd(), "public", "sw.js"),
    "utf8",
  );

  const context = {
    URL,
    Response,
    caches: {
      delete: () => Promise.resolve(true),
      keys: () => Promise.resolve([]),
      match: () => Promise.resolve(undefined),
      open: () =>
        Promise.resolve({
          addAll: () => Promise.resolve(),
          put: () => Promise.resolve(),
        }),
    },
    fetch: () => Promise.resolve(new Response(null, { status: 200 })),
    self: {
      addEventListener: () => undefined,
      clients: {
        claim: () => undefined,
      },
      location: {
        hostname,
        origin: `http://${hostname}:3000`,
      },
      skipWaiting: () => undefined,
    },
  };

  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__isLocalDevHost = isLocalDevHost;`, context);

  return (context as typeof context & { __isLocalDevHost: () => boolean })
    .__isLocalDevHost();
}

describe("service worker dev-host detection", () => {
  it("treats localhost as a development host", () => {
    expect(evaluateIsLocalDevHost("localhost")).toBe(true);
  });

  it("treats the desktop preview bridge host as development too", () => {
    expect(evaluateIsLocalDevHost("198.18.0.1")).toBe(true);
  });

  it("keeps production domains on the cached-app-shell path", () => {
    expect(evaluateIsLocalDevHost("littlejoy.app")).toBe(false);
  });
});
