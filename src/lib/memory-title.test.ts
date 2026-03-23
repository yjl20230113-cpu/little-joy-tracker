import {
  fallbackMemoryTitle,
  isValidMemoryTitle,
  normalizeMemoryTitleItems,
} from "./memory-title";

describe("memory title helpers", () => {
  it("accepts only four to six Chinese characters", () => {
    expect(isValidMemoryTitle("晨光")).toBe(false);
    expect(isValidMemoryTitle("晨光散步")).toBe(true);
    expect(isValidMemoryTitle("晨光散步时")).toBe(true);
    expect(isValidMemoryTitle("晨光散步时刻")).toBe(true);
    expect(isValidMemoryTitle("晨光散步时刻啊")).toBe(false);
    expect(isValidMemoryTitle("Morning")).toBe(false);
  });

  it("falls back to a short Chinese title from the content", () => {
    expect(fallbackMemoryTitle("今天和爸爸一起去散步，晚风很舒服。")).toBe("今天和爸爸一");
    expect(fallbackMemoryTitle("hi")).toBe("今日记录");
  });

  it("normalizes valid JSON title items", () => {
    expect(
      normalizeMemoryTitleItems({
        items: [
          { index: 0, title: "晨光散步" },
          { index: 1, title: "晚风轻语" },
        ],
      }),
    ).toEqual([
      { index: 0, title: "晨光散步" },
      { index: 1, title: "晚风轻语" },
    ]);
  });
});
