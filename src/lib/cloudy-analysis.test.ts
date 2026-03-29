import { describe, expect, it } from "vitest";

import {
  normalizeCloudyAnalysisResult,
  type CloudyAnalysisResult,
} from "./cloudy-analysis";

describe("normalizeCloudyAnalysisResult", () => {
  it("parses the new Card_UI XML reply into the app shape", () => {
    expect(
      normalizeCloudyAnalysisResult(`<Card_UI>
  <Card_Header>
    <Theme_Title>允许一切发生</Theme_Title>
  </Card_Header>
  <Empathy_Section>虽然我只是一段运行的程序，但我在这里倾听。你现在的发沉和委屈，都很真实。</Empathy_Section>
  <Cognitive_Reframe_Section>这一刻的受挫只是生活的一个切片，不是你整个人的定论。</Cognitive_Reframe_Section>
  <Actionable_Logging_Section>选定今天的日期，记下一件针尖大小的好事，哪怕只是一杯温度刚好的水。</Actionable_Logging_Section>
</Card_UI>`),
    ).toEqual<CloudyAnalysisResult>({
      themeTitle: "允许一切发生",
      hug: "虽然我只是一段运行的程序，但我在这里倾听。你现在的发沉和委屈，都很真实。",
      analysis: "这一刻的受挫只是生活的一个切片，不是你整个人的定论。",
      light: "选定今天的日期，记下一件针尖大小的好事，哪怕只是一杯温度刚好的水。",
    });
  });

  it("keeps backward compatibility with stored JSON replies that have no title", () => {
    expect(
      normalizeCloudyAnalysisResult(
        JSON.stringify({
          hug: "我听见你在安静地撑着。",
          analysis: "这阵阴天并不等于你做错了什么。",
          light: "先把窗帘拉开一道缝，让呼吸有个出口。",
        }),
      ),
    ).toEqual<CloudyAnalysisResult>({
      themeTitle: "今晚先把心放在这里",
      hug: "我听见你在安静地撑着。",
      analysis: "这阵阴天并不等于你做错了什么。",
      light: "先把窗帘拉开一道缝，让呼吸有个出口。",
    });
  });

  it("rejects replies when any required field is missing", () => {
    expect(() =>
      normalizeCloudyAnalysisResult({
        themeTitle: "先停一停",
        hug: "我知道你已经很累了。",
        analysis: "先让肩膀落下来一点。",
      }),
    ).toThrow("Cloudy analysis format is incomplete");
  });
});
