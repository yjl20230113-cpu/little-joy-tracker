import { Sparkles } from "lucide-react";
import type { TimelineRange } from "../lib/app-logic";
import { AppDatePicker } from "./AppDatePicker";

export type TimelineFilterOption = {
  id: string;
  label: string;
};

type TimelineFiltersProps = {
  peopleFilters: TimelineFilterOption[];
  selectedPersonId: string;
  selectedRange: TimelineRange;
  customStartDate: string;
  customEndDate: string;
  onPersonChange: (personId: string) => void;
  onRangeChange: (range: TimelineRange) => void;
  onCustomStartDateChange: (value: string) => void;
  onCustomEndDateChange: (value: string) => void;
  onSummaryClick?: () => void;
  showSummaryButton?: boolean;
  showPresetRangeButtons?: boolean;
};

const copy = {
  week: "\u4e00\u5468",
  month: "\u4e00\u4e2a\u6708",
  threeMonths: "\u4e09\u4e2a\u6708",
  startDate: "\u5f00\u59cb\u65e5\u671f",
  endDate: "\u7ed3\u675f\u65e5\u671f",
  summary: "AI \u603b\u7ed3\u62a5\u544a",
};

const presetRangeOptions: Array<{ id: TimelineRange; label: string }> = [
  { id: "week", label: copy.week },
  { id: "month", label: copy.month },
  { id: "threeMonths", label: copy.threeMonths },
];

export function TimelineFilters({
  peopleFilters,
  selectedPersonId,
  selectedRange,
  customStartDate,
  customEndDate,
  onPersonChange,
  onRangeChange,
  onCustomStartDateChange,
  onCustomEndDateChange,
  onSummaryClick,
  showSummaryButton = true,
  showPresetRangeButtons = false,
}: TimelineFiltersProps) {
  return (
    <div
      data-ui="timeline-filters"
      className="mt-3 space-y-2.5 rounded-[1.2rem] border border-[rgba(75,53,45,0.09)] bg-[rgba(255,248,243,0.88)] px-2.5 py-2.5 shadow-[0_18px_30px_-28px_rgba(75,53,45,0.22)] backdrop-blur-sm"
    >
      <div
        data-ui="timeline-filters-people-row"
        className="joy-scroll-hidden flex gap-1.5 overflow-x-auto pb-0.5"
      >
        {peopleFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onPersonChange(filter.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[0.74rem] font-semibold transition-all ${
              filter.id === selectedPersonId
                ? "bg-[var(--primary)] text-white shadow-[0_12px_18px_-16px_rgba(75,53,45,0.4)]"
                : "bg-[rgba(255,249,244,0.94)] text-[var(--muted)] shadow-[inset_0_0_0_1px_rgba(75,53,45,0.1)]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {showPresetRangeButtons ? (
        <div
          data-ui="timeline-filters-presets-row"
          className="grid grid-cols-3 gap-2"
        >
          {presetRangeOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onRangeChange(option.id)}
              className={`min-w-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-[0.74rem] font-medium transition-all ${
                option.id === selectedRange
                  ? "border-transparent bg-[rgba(75,53,45,0.08)] text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(75,53,45,0.04),0_10px_16px_-14px_rgba(75,53,45,0.18)]"
                  : "border-[rgba(75,53,45,0.12)] bg-[rgba(255,249,244,0.92)] text-[var(--muted)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      <div
        data-ui="timeline-filters-range-row"
        className="grid grid-cols-2 gap-2"
      >
        <AppDatePicker
          value={customStartDate}
          onChange={onCustomStartDateChange}
          buttonLabel={copy.startDate}
          buttonLabelMode="empty-only"
          placement="bottom"
          centerPanelOnViewport
          allowClear
          compact
          compactDisplayStyle="short-year"
          showTodayPrefix={false}
          buttonClassName="border-[rgba(75,53,45,0.1)] bg-[rgba(255,249,244,0.94)] text-[var(--muted)]"
        />
        <AppDatePicker
          value={customEndDate}
          onChange={onCustomEndDateChange}
          buttonLabel={copy.endDate}
          buttonLabelMode="empty-only"
          placement="bottom"
          centerPanelOnViewport
          allowClear
          compact
          compactDisplayStyle="short-year"
          showTodayPrefix={false}
          buttonClassName="border-[rgba(75,53,45,0.1)] bg-[rgba(255,249,244,0.94)] text-[var(--muted)]"
        />
      </div>

      {showSummaryButton ? (
        <button
          type="button"
          data-testid="timeline-summary-button"
          onClick={onSummaryClick}
          className="joy-topbar-button joy-topbar-button--primary w-full justify-center gap-1.5 rounded-[1rem] bg-[var(--primary)] px-3.5 py-2 text-[0.74rem]"
        >
          <Sparkles className="size-[0.88rem] fill-current" />
          {copy.summary}
        </button>
      ) : null}
    </div>
  );
}
