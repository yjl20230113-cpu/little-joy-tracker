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
    <div className="mt-4 space-y-4 rounded-[1.9rem] bg-[linear-gradient(180deg,rgba(255,249,181,0.82),rgba(255,252,215,0.95))] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
      <div className="flex flex-wrap items-center gap-3">
        <div className="joy-scroll-hidden flex flex-1 gap-3 overflow-x-auto pb-1">
          {peopleFilters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => onPersonChange(filter.id)}
              className={`whitespace-nowrap rounded-full px-5 py-3 text-[0.98rem] font-bold transition-all ${
                filter.id === selectedPersonId
                  ? "bg-[var(--primary)] text-white shadow-[0_16px_28px_-18px_rgba(155,69,0,0.82)]"
                  : "bg-[rgba(255,251,210,0.9)] text-[var(--muted)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {showSummaryButton ? (
          <button
            type="button"
            onClick={onSummaryClick}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ffd4e5] px-4 py-3 text-[0.95rem] font-bold text-[#4f2030] shadow-[0_14px_26px_-20px_rgba(79,32,48,0.45)]"
          >
            <Sparkles className="size-4 fill-current" />
            {copy.summary}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        {timeRangeOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onRangeChange(option.id)}
            className={`rounded-full border px-5 py-3 text-[0.98rem] font-semibold transition-all ${
              option.id === selectedRange
                ? "border-transparent bg-white text-[var(--primary)] shadow-[0_16px_26px_-20px_rgba(29,29,3,0.55)]"
                : "border-[rgba(155,69,0,0.12)] bg-white/78 text-[var(--muted)]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
