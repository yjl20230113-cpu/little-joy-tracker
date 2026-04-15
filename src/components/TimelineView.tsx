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
  overlayContent?: ReactNode;
  topBarTitle?: string;
  topBarLeftSlot?: ReactNode;
  topBarRightSlot?: ReactNode;
  shellTone?: "warm" | "cloudy";
  topBarTone?: "warm" | "cloudy";
  navTone?: "default" | "warm";
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
  overlayContent,
  topBarTitle,
  topBarLeftSlot,
  topBarRightSlot,
  shellTone = "warm",
  topBarTone = shellTone,
  navTone = "default",
  onPersonChange,
  onRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onSummaryClick,
  onCloudyArchiveOpen,
  onTabChange,
  onEventOpen,
}: TimelineViewProps) {
  const shellBackdrop =
    shellTone === "cloudy"
      ? "bg-[linear-gradient(180deg,#f6f2f5_0%,#eee7ec_54%,#e6dde4_100%)]"
      : "bg-[linear-gradient(180deg,#fcf8f5_0%,#f7efe9_52%,#f1e6df_100%)]";
  const shellGlow =
    shellTone === "cloudy"
      ? "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.28),transparent_40%)]"
      : "bg-[radial-gradient(circle_at_top,rgba(193,127,102,0.14),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.34),transparent_42%)]";

  return (
    <section
      data-ui="timeline-view-shell"
      data-shell-tone={shellTone}
      className="joy-app-shell w-full"
    >
      <div className={`absolute inset-0 ${shellBackdrop}`} />
      <div className={`absolute inset-0 ${shellGlow}`} />
      <AppTopBar
        title={topBarTitle ?? copy.title}
        leadingIcon={topBarLeftSlot ? undefined : BookOpen}
        trailingIcon={topBarRightSlot ? undefined : Sparkles}
        leftSlot={topBarLeftSlot}
        rightSlot={topBarRightSlot}
        tone={topBarTone}
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
                  className="joy-topbar-button joy-topbar-button--tonal w-full justify-center rounded-[1rem] border-[rgba(143,133,149,0.18)] bg-[rgba(95,82,102,0.08)] px-3.5 py-2 text-[0.74rem] text-[#5f5568]"
                >
                  {copy.archive}
                </button>
              </div>
            ) : null}

            <div className="space-y-4.5 pb-7">
              {groups.length === 0 ? (
                <div className="joy-card flex flex-col items-center justify-center gap-3.5 rounded-[1.4rem] border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.92)] px-4.5 py-10 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-[rgba(193,127,102,0.16)] text-[rgba(75,53,45,0.7)]">
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
                      <h3 className="shrink-0 text-[1.2rem] font-black tracking-[-0.04em] text-[var(--foreground)]">
                        {formatTimelineHeading(group.date)}
                      </h3>
                      <div className="h-px flex-1 bg-[rgba(193,127,102,0.24)]" />
                    </div>

                    <div className="space-y-2.5">
                      {group.items.map((item) => {
                        const hasRealImage = Boolean(item.imageUrl?.trim());
                        const imageSrc = hasRealImage
                          ? item.imageUrl!
                          : autoImagePlaceholderSrc;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            data-ui="timeline-event-card"
                            onClick={() => onEventOpen(item.id)}
                            className="flex w-full items-start gap-2.5 rounded-[1.15rem] border border-[rgba(75,53,45,0.08)] bg-[rgba(255,251,247,0.96)] px-2.75 py-2.75 text-left shadow-[0_14px_22px_-24px_rgba(75,53,45,0.16)] transition-transform hover:-translate-y-0.5 sm:gap-3 sm:px-3.25"
                          >
                            <div className="relative mt-0.5 size-[3.5rem] shrink-0 overflow-hidden rounded-[0.95rem] bg-[rgba(241,233,226,0.88)] sm:size-[3.7rem]">
                              <Image
                                src={imageSrc}
                                alt={item.content}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-1">
                              <div className="space-y-0.75">
                                <span className="inline-flex rounded-full bg-[rgba(241,216,208,0.68)] px-2 py-0.5 text-[0.64rem] font-bold tracking-[0.05em] text-[var(--primary)]">
                                  {item.personName}
                                </span>
                                {hasRealImage && item.autoImageAttribution ? (
                                  <span className="ml-1 inline-flex rounded-full bg-[rgba(75,53,45,0.06)] px-2 py-0.5 text-[0.58rem] font-semibold tracking-[0.08em] text-[var(--outline-strong)]">
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

                              <span className="text-right text-[0.68rem] font-medium text-[var(--outline-strong)]">
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

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} tone={navTone} />
      {overlayContent ? (
        <div
          data-ui="timeline-shell-overlay"
          className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(75,53,45,0.16)] px-5"
        >
          {overlayContent}
        </div>
      ) : null}
      <AppToast message={message} onClear={onMessageClear} />
    </section>
  );
}
