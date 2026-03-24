import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Cloud,
  Coffee,
  Flower2,
  HeartHandshake,
  Moon,
  Share2,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  TreePine,
  Wind,
} from "lucide-react";
import type { SummaryReport, TimelineRange } from "../lib/app-logic";
import type { HomeTab } from "./QuickEntry";
import { TimelineFilters, type TimelineFilterOption } from "./TimelineFilters";
import { AppBottomNav } from "./AppBottomNav";
import { AppToast } from "./AppToast";
import { AppTopBar } from "./AppTopBar";

type InsightViewProps = {
  activeTab: HomeTab;
  peopleFilters: TimelineFilterOption[];
  selectedPersonId: string;
  selectedRange: TimelineRange;
  customStartDate: string;
  customEndDate: string;
  message: string;
  onMessageClear?: () => void;
  emptyHint: string;
  generateDisabled: boolean;
  loading: boolean;
  report: SummaryReport | null;
  onPersonChange: (personId: string) => void;
  onRangeChange: (range: TimelineRange) => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onGenerate: () => void;
  onShare: () => void;
  onTabChange: (tab: HomeTab) => void;
};

const copy = {
  title: "小美好 AI 洞察",
  subtitle: "把你们最近的回忆，慢慢织成一封有光亮的情书。",
  generate: "生成总结",
  loading: "AI 正在翻看你们的回忆...",
  weather: "情绪天气",
  keywords: "核心关键词",
  portrait: "性格画像",
  suggestions: "行动建议",
  share: "保存/分享报告",
};

const keywordColors = [
  "bg-orange-100 text-orange-600",
  "bg-green-100 text-green-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
  "bg-sky-100 text-sky-600",
];

function extractMoodPercent(description: string) {
  const match = description.match(/(\d+)%/);
  return match ? Number(match[1]) : 0;
}

export function InsightView({
  activeTab,
  peopleFilters,
  selectedPersonId,
  selectedRange,
  customStartDate,
  customEndDate,
  message,
  onMessageClear,
  emptyHint,
  generateDisabled,
  loading,
  report,
  onPersonChange,
  onRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onGenerate,
  onShare,
  onTabChange,
}: InsightViewProps) {
  const moodPercentTarget = useMemo(
    () => (report ? extractMoodPercent(report.mood_weather.description) : 0),
    [report],
  );

  return (
    <section className="joy-app-shell w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.2),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%)]" />

      <AppTopBar title="Little Joy Tracker" leadingIcon={Sparkles} trailingIcon={BookOpen} />

      <div className="joy-app-content joy-scroll-hidden relative px-3 pb-4.5 pt-2.5 sm:px-4.5">
        <div className="space-y-3.5 pb-7">
          <section className="joy-card rounded-[1.15rem] px-3 py-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/62">
                {copy.title}
              </p>
              <p className="mt-1.5 text-[0.9rem] leading-6 text-[var(--muted)]">
                {copy.subtitle}
              </p>
            </div>

            <div className="mt-3">
              <TimelineFilters
                peopleFilters={peopleFilters}
                selectedPersonId={selectedPersonId}
                selectedRange={selectedRange}
                customStartDate={customStartDate}
                customEndDate={customEndDate}
                onPersonChange={onPersonChange}
                onRangeChange={onRangeChange}
                onCustomStartDateChange={onCustomStartDateChange}
                onCustomEndDateChange={onCustomEndDateChange}
                showSummaryButton={false}
              />
            </div>

            <div className="joy-soft-panel mt-3 rounded-[0.95rem] p-1.5">
              <button
                type="button"
                onClick={onGenerate}
                disabled={generateDisabled || loading}
                className="joy-topbar-button joy-topbar-button--primary w-full justify-center"
              >
                {generateDisabled ? emptyHint : copy.generate}
              </button>
            </div>
          </section>

          {report ? (
            <div className="space-y-3">
              <article className="joy-card overflow-hidden rounded-[1.15rem] px-3 py-4 shadow-[0_10px_18px_-18px_rgba(29,29,3,0.16)]">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/55">
                  {copy.weather}
                </p>
                <div className="mt-2.5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[1.5rem] font-black tracking-[-0.045em] text-[var(--primary)]">
                      {report.mood_weather.title}
                    </h3>
                    <p className="mt-2.5 max-w-md text-[0.9rem] leading-6.5 text-[var(--muted)]">
                      {report.mood_weather.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-center rounded-[0.9rem] bg-[rgba(255,219,201,0.56)] px-3 py-2.5 text-[var(--primary)]">
                    <InsightIcon iconName={report.mood_weather.icon} className="size-6" />
                    <AnimatedPercentage key={moodPercentTarget} target={moodPercentTarget} />
                  </div>
                </div>
              </article>

              <article className="joy-soft-panel rounded-[1rem] px-3 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/55">
                  {copy.keywords}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {report.keywords.map((keyword, index) => (
                    <span
                      key={`${keyword}-${index}`}
                      className={`rounded-full px-2.5 py-1.5 text-[0.78rem] font-bold ${keywordColors[index % keywordColors.length]}`}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </article>

              <article className="joy-card rounded-[1.15rem] px-3 py-4 shadow-[0_10px_18px_-18px_rgba(29,29,3,0.16)]">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/55">
                  {copy.portrait}
                </p>
                <h3 className="mt-2 text-[1.4rem] font-black tracking-[-0.04em] text-[var(--primary)]">
                  {report.personality.title}
                </h3>
                <p className="mt-2.5 text-[0.9rem] leading-6.5 text-[var(--muted)]">
                  {report.personality.description}
                </p>
              </article>

              <article className="joy-soft-panel rounded-[1rem] px-3 py-3">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--tertiary)]/70">
                  {copy.suggestions}
                </p>
                <div className="mt-2.5 space-y-2">
                  {report.suggestions.map((suggestion, index) => (
                    <div
                      key={`${suggestion.title}-${index}`}
                      className="rounded-[0.95rem] bg-[linear-gradient(180deg,rgba(255,249,235,0.95),rgba(255,255,255,0.96))] px-3 py-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 flex size-8.5 shrink-0 items-center justify-center rounded-full bg-[rgba(255,140,66,0.16)] text-[var(--primary)]">
                          <InsightIcon iconName={suggestion.icon} className="size-4" />
                        </div>
                        <div>
                          <p className="text-[0.94rem] font-black tracking-[-0.02em] text-[var(--foreground)]">
                            {suggestion.title}
                          </p>
                          <p className="mt-1 text-[0.82rem] leading-6 text-[var(--muted)]">
                            {suggestion.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <button
                type="button"
                onClick={onShare}
                className="joy-topbar-button w-full justify-center"
              >
                <Share2 className="size-4" />
                {copy.share}
              </button>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div
            data-testid="insight-loading-overlay"
            className="absolute inset-x-3 top-2.5 bottom-4.5 z-20 flex items-center justify-center rounded-[1.35rem] bg-[rgba(255,252,207,0.68)] backdrop-blur-[2px] sm:inset-x-4.5"
          >
            <div className="rounded-full bg-[rgba(255,253,190,0.92)] px-4.5 py-2.5 text-center shadow-[0_10px_18px_-18px_rgba(29,29,3,0.18)]">
              <p className="text-[0.94rem] font-black tracking-[-0.03em] text-[var(--primary)]">
                {copy.loading}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <AppToast message={message} onClear={onMessageClear} />
    </section>
  );
}

function InsightIcon({
  iconName,
  className,
}: {
  iconName: string;
  className?: string;
}) {
  switch (iconName) {
    case "Sun":
      return <Sun className={className} />;
    case "Cloud":
      return <Cloud className={className} />;
    case "Moon":
      return <Moon className={className} />;
    case "Wind":
      return <Wind className={className} />;
    case "Sunrise":
      return <Sunrise className={className} />;
    case "Sunset":
      return <Sunset className={className} />;
    case "Tree":
    case "TreePine":
      return <TreePine className={className} />;
    case "Coffee":
      return <Coffee className={className} />;
    case "Flower2":
      return <Flower2 className={className} />;
    case "HeartHandshake":
      return <HeartHandshake className={className} />;
    default:
      return <Sparkles className={className} />;
  }
}

function AnimatedPercentage({ target }: { target: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      return;
    }

    const duration = 900;
    const step = Math.max(1, Math.round(target / 24));
    const interval = window.setInterval(() => {
      setValue((current) => {
        const next = current + step;
        if (next >= target) {
          window.clearInterval(interval);
          return target;
        }

        return next;
      });
    }, Math.max(24, Math.floor(duration / Math.max(target, 1))));

    return () => window.clearInterval(interval);
  }, [target]);

  return (
    <span className="mt-2 text-[1.45rem] font-black tracking-[-0.05em] [animation:joy-bounce_0.9s_ease-out]">
      {value}%
    </span>
  );
}
