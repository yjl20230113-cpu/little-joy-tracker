import { Sparkles } from "lucide-react";
import type { TimelineRange } from "../lib/app-logic";

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
};

const copy = {
  week: "过去一周",
  month: "过去一个月",
  threeMonths: "过去三个月",
  summary: "AI 总结报告",
};

const timeRangeOptions: Array<{ id: TimelineRange; label: string }> = [
  { id: "week", label: copy.week },
  { id: "month", label: copy.month },
  { id: "threeMonths", label: copy.threeMonths },
];

export function TimelineFilters({
  peopleFilters,
  selectedPersonId,
  selectedRange,
  onPersonChange,
  onRangeChange,
  onSummaryClick,
  showSummaryButton = true,
}: TimelineFiltersProps) {
  return (
    <div
      data-ui="timeline-filters"
      className="mt-3 space-y-2 rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,249,181,0.82),rgba(255,252,215,0.95))] px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
    >
      <div className="joy-scroll-hidden flex gap-1.5 overflow-x-auto pb-0.5">
        {peopleFilters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onPersonChange(filter.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[0.74rem] font-semibold transition-all ${
              filter.id === selectedPersonId
                ? "bg-[var(--primary)] text-white shadow-[0_10px_16px_-14px_rgba(155,69,0,0.36)]"
                : "bg-[rgba(255,251,210,0.9)] text-[var(--muted)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div
        data-ui="timeline-filters-range-row"
        className="grid grid-cols-3 gap-2"
      >
        {timeRangeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onRangeChange(option.id)}
            className={`rounded-full border px-3 py-1.5 text-[0.74rem] font-medium transition-all ${
              option.id === selectedRange
                ? "border-transparent bg-white text-[var(--primary)] shadow-[0_10px_16px_-14px_rgba(29,29,3,0.18)]"
                : "border-[rgba(155,69,0,0.12)] bg-white/78 text-[var(--muted)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {showSummaryButton ? (
        <button
          type="button"
          data-testid="timeline-summary-button"
          onClick={onSummaryClick}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-[0.95rem] bg-[#ffd4e5] px-3.5 py-2 text-[0.74rem] font-semibold text-[#4f2030] shadow-[0_8px_14px_-14px_rgba(79,32,48,0.24)]"
        >
          <Sparkles className="size-[0.88rem] fill-current" />
          {copy.summary}
        </button>
      ) : null}
    </div>
  );
}
