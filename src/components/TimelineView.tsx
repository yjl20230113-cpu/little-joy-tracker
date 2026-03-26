import Image from "next/image";
import { BookOpen, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import {
  autoImagePlaceholderSrc,
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
import { AppToast } from "./AppToast";
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
  onMessageClear?: () => void;
  detailContent?: ReactNode;
  topBarTitle?: string;
  topBarLeftSlot?: ReactNode;
  topBarRightSlot?: ReactNode;
  onPersonChange: (personId: string) => void;
  onRangeChange: (range: TimelineRange) => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onSummaryClick: () => void;
  onCloudyArchiveOpen?: () => void;
  onTabChange: (tab: HomeTab) => void;
  onEventOpen: (eventId: string) => void;
};

const copy = {
  title: "Little Joy Tracker",
  empty: "这里空空的，快去记录一件小美好吧~",
  emptyHint: "再往下翻，都是值得回味的小美好",
  archive: "解忧档案袋",
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
  onMessageClear,
  detailContent,
  topBarTitle,
  topBarLeftSlot,
  topBarRightSlot,
  onPersonChange,
  onRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onSummaryClick,
  onCloudyArchiveOpen,
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

      <div className="joy-app-content joy-scroll-hidden px-3 pb-5 pt-2 sm:px-4.5">
        {detailContent ? (
          detailContent
        ) : (
          <div data-ui="timeline-list-stack" className="space-y-2.5">
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

            {onCloudyArchiveOpen ? (
              <div data-ui="cloudy-archive-entry-wrap" className="px-2.5">
                <button
                  type="button"
                  onClick={onCloudyArchiveOpen}
                  className="inline-flex w-full items-center justify-center rounded-[0.95rem] border border-[rgba(135,101,173,0.18)] bg-[rgba(245,239,255,0.92)] px-3.5 py-2 text-[0.74rem] font-semibold text-[#6d578f] shadow-[0_10px_20px_-20px_rgba(77,51,122,0.5)]"
                >
                  {copy.archive}
                </button>
              </div>
            ) : null}

            <div className="space-y-4.5 pb-7">
              {groups.length === 0 ? (
                <div className="joy-card flex flex-col items-center justify-center gap-3.5 rounded-[1.25rem] px-4.5 py-10 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[rgba(120,111,66,0.18)] text-[rgba(120,111,66,0.7)]">
                    <Sparkles className="size-6" />
                  </div>
                  <p className="text-[0.94rem] font-semibold text-[var(--muted)]">
                    {copy.empty}
                  </p>
                  <p className="text-[0.8rem] italic text-[var(--outline-strong)]">
                    {copy.emptyHint}
                  </p>
                </div>
              ) : (
                groups.map((group) => (
                  <section key={group.date} className="space-y-3">
                    <div className="flex items-center gap-2 pt-0.5">
                      <h3 className="shrink-0 text-[1.32rem] font-black tracking-[-0.04em] text-[var(--foreground)]">
                        {formatTimelineHeading(group.date)}
                      </h3>
                      <div className="h-px flex-1 bg-[rgba(225,205,110,0.55)]" />
                    </div>

                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const hasRealImage = Boolean(item.imageUrl?.trim());
                        const imageSrc = hasRealImage
                          ? item.imageUrl!
                          : autoImagePlaceholderSrc;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onEventOpen(item.id)}
                            className="flex w-full items-start gap-2.5 rounded-[1rem] bg-white/94 px-2.5 py-2.5 text-left shadow-[0_8px_14px_-18px_rgba(29,29,3,0.12)] transition-transform hover:-translate-y-0.5 sm:gap-3 sm:px-3"
                          >
                            <div className="relative mt-0.5 size-[3.5rem] shrink-0 overflow-hidden rounded-[0.82rem] bg-[var(--surface-soft)] sm:size-[3.75rem]">
                              <Image
                                src={imageSrc}
                                alt={item.content}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
                              <div className="space-y-0.5">
                                <span className="inline-flex rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[0.64rem] font-bold tracking-[0.05em] text-[var(--primary)]">
                                  {item.personName}
                                </span>
                                {hasRealImage && item.autoImageAttribution ? (
                                  <span className="ml-1 inline-flex rounded-full bg-[rgba(14,14,4,0.06)] px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.08em] text-[var(--outline-strong)]">
                                    Unsplash
                                  </span>
                                ) : null}
                                <p className="line-clamp-2 text-[0.88rem] font-black leading-5 tracking-[-0.03em] text-[var(--foreground)]">
                                  {item.title?.trim() ||
                                    fallbackMemoryTitle(item.content)}
                                </p>
                                <p className="line-clamp-2 text-[0.78rem] leading-5 text-[var(--muted)]">
                                  {item.content}
                                </p>
                                {item.reason ? (
                                  <p className="line-clamp-1 text-[0.72rem] italic leading-4.5 text-[var(--outline-strong)]">
                                    {item.reason}
                                  </p>
                                ) : null}
                              </div>

                              <span className="text-right text-[0.7rem] font-medium text-[var(--outline-strong)]">
                                {formatTimelineTime(item.createdAt)}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <AppToast message={message} onClear={onMessageClear} />
    </section>
  );
}
