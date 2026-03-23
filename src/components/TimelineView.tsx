import Image from "next/image";
import { BookOpen, CalendarDays, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import {
  formatTimelineHeading,
  formatTimelineTime,
  type TimelineGroup,
  type TimelineRange,
} from "../lib/app-logic";
import { fallbackMemoryTitle } from "../lib/memory-title";
import type { HomeTab } from "./QuickEntry";
import {
  TimelineFilters,
  type TimelineFilterOption,
} from "./TimelineFilters";
import { AppBottomNav } from "./AppBottomNav";
import { AppTopBar } from "./AppTopBar";

type TimelineViewProps = {
  activeTab: HomeTab;
  groups: TimelineGroup[];
  peopleFilters: TimelineFilterOption[];
  selectedPersonId: string;
  selectedRange: TimelineRange;
  customStartDate: string;
  customEndDate: string;
  message: string;
  detailContent?: ReactNode;
  topBarTitle?: string;
  topBarLeftSlot?: ReactNode;
  topBarRightSlot?: ReactNode;
  onPersonChange: (personId: string) => void;
  onRangeChange: (range: TimelineRange) => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onSummaryClick: () => void;
  onTabChange: (tab: HomeTab) => void;
  onEventOpen: (eventId: string) => void;
};

const copy = {
  title: "Little Joy Tracker",
  empty: "\u8fd9\u91cc\u7a7a\u7a7a\u7684\uff0c\u5feb\u53bb\u8bb0\u5f55\u4e00\u4ef6\u5c0f\u7f8e\u597d\u5427~",
  emptyHint: "\u518d\u5f80\u4e0b\u7ffb\uff0c\u90fd\u662f\u503c\u5f97\u56de\u5473\u7684\u5c0f\u7f8e\u597d",
  record: "\u8bb0\u5f55",
  timeline: "\u65f6\u95f4\u7ebf",
  insight: "\u6d1e\u5bdf",
  profile: "\u4e2a\u4eba",
};

export function TimelineView({
  activeTab,
  groups,
  peopleFilters,
  selectedPersonId,
  selectedRange,
  customStartDate,
  customEndDate,
  message,
  detailContent,
  topBarTitle,
  topBarLeftSlot,
  topBarRightSlot,
  onPersonChange,
  onRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onSummaryClick,
  onTabChange,
  onEventOpen,
}: TimelineViewProps) {
  return (
    <section className="joy-app-shell w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%)]" />
      <AppTopBar
        title={topBarTitle ?? copy.title}
        leadingIcon={topBarLeftSlot ? undefined : BookOpen}
        trailingIcon={topBarRightSlot ? undefined : Sparkles}
        leftSlot={topBarLeftSlot}
        rightSlot={topBarRightSlot}
      />

      <div className="joy-app-content joy-scroll-hidden px-4 pb-7 pt-4 sm:px-6">
        {detailContent ? (
          detailContent
        ) : (
          <div className="space-y-5">
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
              onSummaryClick={onSummaryClick}
            />

            {message ? (
              <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,219,201,0.72),rgba(255,255,255,0.82))] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
                {message}
              </div>
            ) : null}

            <div className="space-y-8 pb-10">
              {groups.length === 0 ? (
                <div className="joy-card flex flex-col items-center justify-center gap-4 rounded-[2rem] px-5 py-16 text-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-[rgba(120,111,66,0.18)] text-[rgba(120,111,66,0.7)]">
                    <Sparkles className="size-7" />
                  </div>
                  <p className="text-base font-semibold text-[var(--muted)]">{copy.empty}</p>
                  <p className="text-sm italic text-[var(--outline-strong)]">{copy.emptyHint}</p>
                </div>
              ) : (
                groups.map((group) => (
                  <section key={group.date} className="space-y-5">
                    <div className="flex items-center gap-4 pt-1">
                      <h3 className="shrink-0 text-[1.65rem] font-black tracking-[-0.045em] text-[var(--foreground)]">
                        {formatTimelineHeading(group.date)}
                      </h3>
                      <div className="h-px flex-1 bg-[rgba(225,205,110,0.55)]" />
                    </div>

                    <div className="space-y-4">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onEventOpen(item.id)}
                          className="flex w-full items-center gap-3 rounded-[1.6rem] bg-white/94 px-4 py-4 text-left shadow-[0_10px_22px_-20px_rgba(29,29,3,0.18)] transition-transform hover:-translate-y-0.5 sm:gap-4 sm:px-5"
                        >
                          <div className="relative size-20 shrink-0 overflow-hidden rounded-[1.5rem] bg-[var(--surface-soft)] sm:size-22">
                            {item.imageUrl ? (
                              <Image
                                src={item.imageUrl}
                                alt={item.content}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[var(--primary)]/50">
                                <CalendarDays className="size-8 sm:size-9" />
                              </div>
                            )}
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                            <div className="space-y-2">
                              <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-3 py-1 text-xs font-bold tracking-[0.08em] text-[var(--primary)]">
                                {item.personName}
                              </span>
                              <p className="line-clamp-2 text-[1.06rem] font-black leading-7 tracking-[-0.04em] text-[var(--foreground)] sm:text-[1.15rem]">
                                {item.title?.trim() ||
                                  fallbackMemoryTitle(item.content)}
                              </p>
                              <p className="line-clamp-2 text-sm leading-6 text-[var(--muted)]">
                                {item.content}
                              </p>
                              {item.reason ? (
                                <p className="line-clamp-1 text-sm italic leading-6 text-[var(--outline-strong)]">
                                  {item.reason}
                                </p>
                              ) : null}
                            </div>

                            <span className="text-right text-sm font-semibold text-[var(--outline-strong)]">
                              {formatTimelineTime(item.createdAt)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </section>
  );
}
