import { readFileSync } from "node:fs";
import { join } from "node:path";

function readSource(...segments: string[]) {
  return readFileSync(join(process.cwd(), ...segments), "utf8");
}

describe("mobile app shell contract", () => {
  it("keeps the home page full-bleed on mobile and restores the preview shell on desktop", () => {
    const source = readSource("src", "app", "page.tsx");

    expect(source).toContain('className="joy-grid h-dvh overflow-hidden sm:px-6 sm:py-6"');
    expect(source).not.toContain('className="joy-grid h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6"');
    expect(source).toContain('className="flex h-full min-h-0 w-full sm:max-w-[38rem] sm:min-w-[20rem]"');
  });

  it("keeps the detail page full-bleed on mobile and restores the preview shell on desktop", () => {
    const source = readSource("src", "app", "events", "[id]", "page.tsx");

    expect(source).toContain('className="joy-grid h-dvh overflow-hidden sm:px-6 sm:py-6"');
    expect(source).not.toContain('className="joy-grid h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6"');
    expect(source).toContain('className="flex h-full min-h-0 w-full sm:max-w-[38rem] sm:min-w-[20rem]"');
  });

  it("defines mobile-first shell and safe-area styles in global css", () => {
    const source = readSource("src", "app", "globals.css");

    expect(source).toContain(".joy-safe-top");
    expect(source).toContain("padding-top: env(safe-area-inset-top);");
    expect(source).toContain("@media (min-width: 640px)");
  });
});
