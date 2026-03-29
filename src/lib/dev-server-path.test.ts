const {
  isExtendedLengthWindowsPath,
  normalizeWindowsWorkingDirectory,
} = require("./dev-server-path.js") as {
  isExtendedLengthWindowsPath: (value: string) => boolean;
  normalizeWindowsWorkingDirectory: (value: string) => string;
};

describe("dev server path helpers", () => {
  it("detects Windows extended-length paths", () => {
    expect(isExtendedLengthWindowsPath("\\\\?\\E:\\projects\\little-joy-tracker")).toBe(true);
    expect(isExtendedLengthWindowsPath("E:\\projects\\little-joy-tracker")).toBe(false);
  });

  it("normalizes a Windows extended-length cwd before spawning the dev server", () => {
    expect(
      normalizeWindowsWorkingDirectory("\\\\?\\E:\\projects\\little-joy-tracker"),
    ).toBe("E:\\projects\\little-joy-tracker");
  });

  it("keeps normal working directories unchanged", () => {
    expect(normalizeWindowsWorkingDirectory("E:\\projects\\little-joy-tracker")).toBe(
      "E:\\projects\\little-joy-tracker",
    );
  });
});
