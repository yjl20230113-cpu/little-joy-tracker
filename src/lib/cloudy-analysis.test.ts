import { describe, expect, it } from "vitest";

import {
  normalizeCloudyAnalysisResult,
  type CloudyAnalysisResult,
} from "./cloudy-analysis";

describe("normalizeCloudyAnalysisResult", () => {
  it("parses a valid stringified JSON reply", () => {
    expect(
      normalizeCloudyAnalysisResult(
        JSON.stringify({
          hug: "我听见你在安静地撑着，那股酸涩已经压了你好一会儿。",
          analysis: "这阵阴天并不是你做错了什么，更像身体在提醒你该慢一点。",
          light: "先把窗帘拉开一道缝，看一分钟外面的光，让呼吸有个出口。",
        }),
      ),
    ).toEqual<CloudyAnalysisResult>({
      hug: "我听见你在安静地撑着，那股酸涩已经压了你好一会儿。",
      analysis: "这阵阴天并不是你做错了什么，更像身体在提醒你该慢一点。",
      light: "先把窗帘拉开一道缝，看一分钟外面的光，让呼吸有个出口。",
    });
  });

  it("rejects replies when any required field is missing", () => {
    expect(() =>
      normalizeCloudyAnalysisResult({
        hug: "我知道你已经很累了。",
        analysis: "先让肩膀落下来一点。",
      }),
    ).toThrow("Cloudy analysis format is incomplete");
  });
});
