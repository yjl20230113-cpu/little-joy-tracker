import { useEffect } from "react";
import { motion } from "framer-motion";

import {
  defaultCloudyThemeTitle,
  type CloudyAnalysisResult,
} from "../lib/cloudy-analysis";

type CloudyLetterCardProps = {
  letter: CloudyAnalysisResult;
  footerActionLabel?: string;
  emphasisStyle?: CloudyLetterEmphasisStyle;
  onFooterAction: () => void;
};

type SectionKey = "hug" | "analysis" | "light";

type StructuredBlock =
  | { type: "paragraphs"; items: string[] }
  | { type: "list"; items: string[]; ordered: boolean };

type RichSegment = {
  text: string;
  strong: boolean;
};

type EmphasisPattern = {
  expression: RegExp;
  captureGroup?: number;
};

type TextRange = {
  start: number;
  end: number;
};

export type CloudyLetterEmphasisStyle = "subtle" | "editorial" | "auto";

type AutoEmphasisDecision = {
  requestedStyle: "auto";
  resolvedStyle: Exclude<CloudyLetterEmphasisStyle, "auto">;
  subtleScore: number;
  editorialExclusiveScore: number;
  reasons: string[];
};

const sectionOrder: Array<{ key: SectionKey; title: string }> = [
  { key: "hug", title: "情绪镜像" },
  { key: "analysis", title: "温和重构" },
  { key: "light", title: "好事记录" },
];

const legacySectionTitles: Record<SectionKey, string> = {
  hug: "抱抱",
  analysis: "拆解",
  light: "光亮",
};

function buildPhrasePattern(phrases: string[]) {
  return new RegExp(`(${phrases.join("|")})`, "g");
}

const emotionalWeatherPhrases = buildPhrasePattern([
  "需要自己摸索的迷雾",
  "像潮水一样涌来",
  "被比较这阵风吹得太久",
  "选择的重量",
  "内心风暴",
  "人生的天气",
  "情绪的潮汐",
  "被生活背刺的感觉",
]);

const reframeAnchorPhrases = buildPhrasePattern([
  "认知模式",
  "失败的事件",
  "不是失败的人",
  "尚未走完的切片",
  "尚未展开完的阶段",
  "预设了终点的单行线",
  "需要你亲自探索的旷野",
  "重新开始的能力",
  "调整方向的能力",
  "安全锚点",
  "允许一切发生",
  "在行动中被逐渐确认和丰富",
  "审判“选择”本身",
]);

const loggingAnchorPhrases = buildPhrasePattern([
  "选定今天的日期",
  "写下几句简单的文字",
  "拍下一张照片上传",
  "针尖大小的好事",
  "一件好事",
  "微小的当下",
  "一张照片上传",
  "生活慢慢重新回到你的掌控之中",
  "为内心的旷野点亮一盏盏灯",
]);

const subtleReframePhrases = buildPhrasePattern([
  "认知模式",
  "不是失败的人",
  "尚未走完的切片",
  "尚未展开完的阶段",
]);

const subtleSemanticEmphasisPatterns: Record<SectionKey, EmphasisPattern[]> = {
  hug: [
    { expression: /“([^”]{2,20})”/g, captureGroup: 1 },
    { expression: /「([^」]{2,20})」/g, captureGroup: 1 },
    {
      expression:
        /((?:失去掌控感|失控感|不确定感|无力感|羞耻感|挫败感|愧疚感|焦虑感|失落感|恍惚感|坠落感|被落下))/g,
    },
    { expression: /(不是[^，。；：:、\s]{2,14})/g },
  ],
  analysis: [
    { expression: /“([^”]{2,24})”/g, captureGroup: 1 },
    { expression: /「([^」]{2,24})」/g, captureGroup: 1 },
    { expression: /(不是[^，。；：:、\s]{2,16})/g },
    { expression: /(而是[^，。；：:、\s]{2,18})/g },
    { expression: subtleReframePhrases },
  ],
  light: [
    { expression: loggingAnchorPhrases },
    { expression: /“([^”]{2,20})”/g, captureGroup: 1 },
    { expression: /「([^」]{2,20})」/g, captureGroup: 1 },
  ],
};

const editorialSemanticEmphasisPatterns: Record<SectionKey, EmphasisPattern[]> = {
  hug: [
    ...subtleSemanticEmphasisPatterns.hug,
    { expression: /((?:像[^，。；]{3,18}|如同[^，。；]{3,18}))(?=[，。；])/g },
    { expression: emotionalWeatherPhrases },
  ],
  analysis: [
    ...subtleSemanticEmphasisPatterns.analysis,
    { expression: /((?:每一步都像[^，。；]{4,20}))(?=[，。；])/g },
    { expression: reframeAnchorPhrases },
  ],
  light: [
    ...subtleSemanticEmphasisPatterns.light,
    { expression: /((?:窗外一缕[^，。；]{3,20}|一杯[^，。；]{2,18}|一个[^，。；]{2,18}的顺畅感))(?=[，。；])/g },
  ],
};

const editorialExclusivePatterns = {
  hug: editorialSemanticEmphasisPatterns.hug.filter(
    (pattern) => !subtleSemanticEmphasisPatterns.hug.includes(pattern),
  ),
  analysis: editorialSemanticEmphasisPatterns.analysis.filter(
    (pattern) => !subtleSemanticEmphasisPatterns.analysis.includes(pattern),
  ),
  light: editorialSemanticEmphasisPatterns.light.filter(
    (pattern) => !subtleSemanticEmphasisPatterns.light.includes(pattern),
  ),
};

const editorialThemePatterns: EmphasisPattern[] = [
  {
    expression: buildPhrasePattern([
      "缝隙里的光",
      "允许一切发生",
      "此路，亦是风景",
      "光会慢慢亮起来",
    ]),
  },
];

function getSemanticEmphasisPatterns(style: CloudyLetterEmphasisStyle) {
  return style === "subtle"
    ? subtleSemanticEmphasisPatterns
    : editorialSemanticEmphasisPatterns;
}

function countPatternMatches(value: string, patterns: EmphasisPattern[]) {
  return patterns.reduce((total, pattern) => {
    const expression = new RegExp(pattern.expression.source, pattern.expression.flags);
    const matches = value.match(expression);

    return total + (matches?.length ?? 0);
  }, 0);
}

function analyzeAutoEmphasis(letter: CloudyAnalysisResult): AutoEmphasisDecision {
  const combinedText = [letter.themeTitle, letter.hug, letter.analysis, letter.light]
    .join(" ")
    .trim();

  const editorialSectionSignals = {
    hug: countPatternMatches(combinedText, editorialExclusivePatterns.hug),
    analysis: countPatternMatches(combinedText, editorialExclusivePatterns.analysis),
    light: countPatternMatches(combinedText, editorialExclusivePatterns.light),
    theme: countPatternMatches(letter.themeTitle, editorialThemePatterns),
  };

  const editorialExclusiveScore =
    editorialSectionSignals.hug +
    editorialSectionSignals.analysis +
    editorialSectionSignals.light +
    editorialSectionSignals.theme;

  const subtleScore =
    countPatternMatches(combinedText, subtleSemanticEmphasisPatterns.hug) +
    countPatternMatches(combinedText, subtleSemanticEmphasisPatterns.analysis) +
    countPatternMatches(combinedText, subtleSemanticEmphasisPatterns.light);

  const reasons: string[] = [];

  if (editorialSectionSignals.theme > 0) {
    reasons.push(`editorial-exclusive:theme(${editorialSectionSignals.theme})`);
  }

  if (editorialSectionSignals.hug > 0) {
    reasons.push(`editorial-exclusive:hug(${editorialSectionSignals.hug})`);
  }

  if (editorialSectionSignals.analysis > 0) {
    reasons.push(`editorial-exclusive:analysis(${editorialSectionSignals.analysis})`);
  }

  if (editorialSectionSignals.light > 0) {
    reasons.push(`editorial-exclusive:light(${editorialSectionSignals.light})`);
  }

  reasons.push(`subtle-score(${subtleScore})`);

  if (editorialExclusiveScore >= 3) {
    reasons.push("decision:editorial(strong-editorial-signal)");

    return {
      requestedStyle: "auto",
      resolvedStyle: "editorial",
      subtleScore,
      editorialExclusiveScore,
      reasons,
    };
  }

  if (editorialExclusiveScore >= 2 && subtleScore >= 3) {
    reasons.push("decision:editorial(mixed-but-poetic)");

    return {
      requestedStyle: "auto",
      resolvedStyle: "editorial",
      subtleScore,
      editorialExclusiveScore,
      reasons,
    };
  }

  reasons.push("decision:subtle(default-safe)");

  return {
    requestedStyle: "auto",
    resolvedStyle: "subtle",
    subtleScore,
    editorialExclusiveScore,
    reasons,
  };
}

function resolveEmphasisStyle(
  requestedStyle: CloudyLetterEmphasisStyle,
  letter: CloudyAnalysisResult,
): Exclude<CloudyLetterEmphasisStyle, "auto"> {
  if (requestedStyle === "auto") {
    return analyzeAutoEmphasis(letter).resolvedStyle;
  }

  return requestedStyle;
}

function splitSentences(value: string) {
  return (
    value
      .match(/[^。！？!?]+[。！？!?]?/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? []
  );
}

function groupSentences(sentences: string[], size: number) {
  const groups: string[] = [];

  for (let index = 0; index < sentences.length; index += size) {
    groups.push(sentences.slice(index, index + size).join(""));
  }

  return groups.filter(Boolean);
}

function isBulletLine(line: string) {
  return /^(?:[-*•·]\s+|\d+\.\s+|第[一二三四五六七八九十]+[、.]\s*)/.test(line);
}

function stripListMarker(value: string) {
  return value
    .replace(/^(?:[-*•·]\s+|\d+\.\s+|第[一二三四五六七八九十]+[、.]\s*)/, "")
    .trim();
}

function getListMarkerType(lines: string[]) {
  return lines.every((line) => /^(?:\d+\.\s+|第[一二三四五六七八九十]+[、.]\s*)/.test(line))
    ? "ordered"
    : "unordered";
}

function parseExplicitBlocks(normalized: string): StructuredBlock[] {
  const paragraphs = normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const blocks: StructuredBlock[] = [];

  for (const paragraph of paragraphs) {
    const lines = paragraph
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      continue;
    }

    const bulletLines = lines.filter(isBulletLine);

    if (bulletLines.length === 0) {
      blocks.push({ type: "paragraphs", items: [lines.join("")] });
      continue;
    }

    const intro = lines
      .filter((line) => !isBulletLine(line))
      .join("")
      .trim();

    if (intro) {
      blocks.push({ type: "paragraphs", items: [intro] });
    }

    blocks.push({
      type: "list",
      items: bulletLines.map(stripListMarker),
      ordered: getListMarkerType(bulletLines) === "ordered",
    });
  }

  return blocks;
}

function parseInlineOrderedList(normalized: string): StructuredBlock[] | null {
  if (!/\d+\.\s*/.test(normalized)) {
    return null;
  }

  const segments = normalized
    .split(/(?=\d+\.\s*)/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const listSegments = segments.filter((segment) => /^\d+\.\s*/.test(segment));

  if (listSegments.length < 2) {
    return null;
  }

  const intro = segments
    .filter((segment) => !/^\d+\.\s*/.test(segment))
    .join(" ")
    .trim();

  const items = listSegments
    .map((segment) => segment.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);

  if (items.length < 2) {
    return null;
  }

  const blocks: StructuredBlock[] = [];

  if (intro) {
    blocks.push({ type: "paragraphs", items: [intro] });
  }

  blocks.push({ type: "list", items, ordered: true });

  return blocks;
}

function buildStructuredBlocks(value: string, sectionKey: SectionKey): StructuredBlock[] {
  const normalized = value.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  if (normalized.includes("\n")) {
    const explicitBlocks = parseExplicitBlocks(normalized);
    if (explicitBlocks.length > 0) {
      return explicitBlocks;
    }
  }

  const inlineOrderedBlocks = parseInlineOrderedList(normalized);
  if (inlineOrderedBlocks) {
    return inlineOrderedBlocks;
  }

  const sentences = splitSentences(normalized);

  if (sentences.length <= 2) {
    return [{ type: "paragraphs", items: [normalized] }];
  }

  if (sectionKey === "light") {
    return [
      { type: "paragraphs", items: [sentences[0] ?? normalized] },
      { type: "list", items: sentences.slice(1), ordered: false },
    ];
  }

  return [{ type: "paragraphs", items: groupSentences(sentences, 2) }];
}

function collectSemanticRanges(
  value: string,
  sectionKey: SectionKey,
  emphasisStyle: CloudyLetterEmphasisStyle,
) {
  const ranges: TextRange[] = [];
  const semanticEmphasisPatterns = getSemanticEmphasisPatterns(emphasisStyle);

  for (const pattern of semanticEmphasisPatterns[sectionKey]) {
    const expression = new RegExp(pattern.expression.source, pattern.expression.flags);
    let match = expression.exec(value);

    while (match) {
      const fullMatch = match[0];
      const targetMatch = pattern.captureGroup ? match[pattern.captureGroup] : fullMatch;

      if (targetMatch) {
        const targetOffset = fullMatch.indexOf(targetMatch);

        if (targetOffset >= 0) {
          const start = match.index + targetOffset;
          const end = start + targetMatch.length;
          ranges.push({ start, end });
        }
      }

      match = expression.exec(value);
    }
  }

  if (ranges.length === 0) {
    return [];
  }

  const prunedRanges = ranges.filter((range, index, allRanges) => {
    const currentLength = range.end - range.start;

    return !allRanges.some((candidate, candidateIndex) => {
      if (candidateIndex === index) {
        return false;
      }

      const candidateLength = candidate.end - candidate.start;

      return (
        candidate.start >= range.start &&
        candidate.end <= range.end &&
        candidateLength < currentLength
      );
    });
  });

  const mergedRanges = prunedRanges
    .sort((left, right) => left.start - right.start || left.end - right.end)
    .reduce<TextRange[]>((accumulator, current) => {
      const previous = accumulator[accumulator.length - 1];

      if (!previous || current.start > previous.end) {
        accumulator.push({ ...current });
        return accumulator;
      }

      previous.end = Math.max(previous.end, current.end);
      return accumulator;
    }, []);

  return mergedRanges;
}

function splitSemanticSegments(
  value: string,
  sectionKey: SectionKey,
  emphasisStyle: CloudyLetterEmphasisStyle,
): RichSegment[] {
  const ranges = collectSemanticRanges(value, sectionKey, emphasisStyle);

  if (ranges.length === 0) {
    return [{ text: value, strong: false }];
  }

  const segments: RichSegment[] = [];
  let cursor = 0;

  for (const range of ranges) {
    if (range.start > cursor) {
      segments.push({ text: value.slice(cursor, range.start), strong: false });
    }

    segments.push({ text: value.slice(range.start, range.end), strong: true });
    cursor = range.end;
  }

  if (cursor < value.length) {
    segments.push({ text: value.slice(cursor), strong: false });
  }

  return segments.filter((segment) => segment.text);
}

function renderInlineRichText(
  value: string,
  sectionKey: SectionKey,
  emphasisStyle: CloudyLetterEmphasisStyle,
) {
  const markedPattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*)/g;
  const renderedSegments: RichSegment[] = [];
  let cursor = 0;

  for (const match of value.matchAll(markedPattern)) {
    const matchedText = match[0];
    const index = match.index ?? 0;

    if (index > cursor) {
      renderedSegments.push(
        ...splitSemanticSegments(value.slice(cursor, index), sectionKey, emphasisStyle),
      );
    }

    const content = matchedText.startsWith("**") || matchedText.startsWith("__")
      ? matchedText.slice(2, -2)
      : matchedText.slice(1, -1);

    renderedSegments.push({ text: content, strong: true });
    cursor = index + matchedText.length;
  }

  if (cursor < value.length) {
    renderedSegments.push(
      ...splitSemanticSegments(value.slice(cursor), sectionKey, emphasisStyle),
    );
  }

  return renderedSegments.map((segment, index) =>
    segment.strong ? (
      <strong key={`${segment.text}-${index}`} className="font-semibold text-[#53456c]">
        {segment.text}
      </strong>
    ) : (
      <span key={`${segment.text}-${index}`}>{segment.text}</span>
    ),
  );
}

function getListClassName(ordered: boolean) {
  return ordered
    ? "list-decimal space-y-3 pl-6 marker:font-semibold marker:text-[#8f81aa]"
    : "list-disc space-y-3 pl-6 marker:text-[#8f81aa]";
}

export function CloudyLetterCard({
  letter,
  footerActionLabel = "回到小美好",
  emphasisStyle = "auto",
  onFooterAction,
}: CloudyLetterCardProps) {
  const headerTitle = letter.themeTitle.trim() || defaultCloudyThemeTitle;
  const autoEmphasisDecision = emphasisStyle === "auto" ? analyzeAutoEmphasis(letter) : null;
  const resolvedEmphasisStyle = autoEmphasisDecision?.resolvedStyle ??
    resolveEmphasisStyle(emphasisStyle, letter);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !autoEmphasisDecision) {
      return;
    }

    console.info("[CloudyLetterCard] auto emphasis resolved", autoEmphasisDecision);
  }, [autoEmphasisDecision]);

  return (
    <motion.section
      data-ui="cloudy-letter-card"
      initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      className="joy-card relative overflow-hidden rounded-[1.8rem] border border-[rgba(124,111,147,0.16)] bg-[linear-gradient(180deg,rgba(248,242,255,0.96),rgba(239,229,255,0.98))] px-4 py-5 shadow-xl sm:px-5 sm:py-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_28%),repeating-linear-gradient(180deg,rgba(124,111,147,0.035)_0px,rgba(124,111,147,0.035)_1px,transparent_1px,transparent_22px)]" />
      <div className="relative space-y-4">
        <div className="border-b border-[rgba(124,111,147,0.12)] pb-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
            The Healing Letter
          </p>
          <h3 className="mt-2 font-serif text-[1.55rem] tracking-[-0.04em] text-[#53456c]">
            {headerTitle}
          </h3>
        </div>

        {sectionOrder.map(({ key, title }) => {
          const blocks = buildStructuredBlocks(letter[key], key);

          return (
            <section
              key={key}
              className="rounded-[1.2rem] border border-[rgba(124,111,147,0.08)] bg-white/62 px-3.5 py-3.5 backdrop-blur-sm"
            >
              <p className="text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
                {title}
                <span className="sr-only">{legacySectionTitles[key]}</span>
              </p>
              <div className="mt-3 space-y-3 text-[0.98rem] leading-7 text-[#4c4460]">
                {blocks.map((block, blockIndex) =>
                  block.type === "paragraphs" ? (
                    <div key={`${key}-paragraphs-${blockIndex}`} className="space-y-3">
                      {block.items.map((item, itemIndex) => (
                        <p key={`${key}-paragraph-${itemIndex}`}>
                          {renderInlineRichText(item, key, resolvedEmphasisStyle)}
                        </p>
                      ))}
                    </div>
                  ) : block.ordered ? (
                    <ol
                      key={`${key}-list-${blockIndex}`}
                      className={getListClassName(true)}
                    >
                      {block.items.map((item, itemIndex) => (
                        <li key={`${key}-list-item-${itemIndex}`}>
                          {renderInlineRichText(item, key, resolvedEmphasisStyle)}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <ul
                      key={`${key}-list-${blockIndex}`}
                      className={getListClassName(false)}
                    >
                      {block.items.map((item, itemIndex) => (
                        <li key={`${key}-list-item-${itemIndex}`}>
                          {renderInlineRichText(item, key, resolvedEmphasisStyle)}
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          );
        })}

        <button
          type="button"
          onClick={onFooterAction}
          className="joy-topbar-button joy-topbar-button--primary w-full justify-center bg-[linear-gradient(90deg,#8f7ac0,#b49ad8)] shadow-[0_18px_30px_-24px_rgba(93,62,149,0.55)]"
        >
          {footerActionLabel}
        </button>
      </div>
    </motion.section>
  );
}
