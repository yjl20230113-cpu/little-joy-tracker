"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type AppDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  align?: "left" | "right";
  placement?: "top" | "bottom";
  allowClear?: boolean;
  buttonLabel?: string;
  className?: string;
  buttonClassName?: string;
};

type CalendarCell = {
  value: string;
  label: number;
  isCurrentMonth: boolean;
};

const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

function parseDateParts(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return { year, month, day };
}

function createDateString(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addMonths(year: number, month: number, offset: number) {
  const nextDate = new Date(year, month - 1 + offset, 1);
  return {
    year: nextDate.getFullYear(),
    month: nextDate.getMonth() + 1,
  };
}

function formatMonthHeading(year: number, month: number) {
  return `${year}年${String(month).padStart(2, "0")}月`;
}

function formatDateValue(value: string) {
  const parts = parseDateParts(value);

  if (!parts) {
    return "请选择日期";
  }

  return `${parts.year}/${String(parts.month).padStart(2, "0")}/${String(parts.day).padStart(2, "0")}`;
}

function buildCalendarCells(year: number, month: number) {
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const monthStartOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month - 1, 1 - monthStartOffset);

  return Array.from({ length: 42 }, (_, index): CalendarCell => {
    const current = new Date(gridStart);
    current.setDate(gridStart.getDate() + index);

    return {
      value: createDateString(
        current.getFullYear(),
        current.getMonth() + 1,
        current.getDate(),
      ),
      label: current.getDate(),
      isCurrentMonth: current.getMonth() === month - 1,
    };
  });
}

export function AppDatePicker({
  value,
  onChange,
  align = "left",
  placement = "top",
  allowClear = false,
  buttonLabel,
  className = "",
  buttonClassName = "",
}: AppDatePickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const today = new Date();
  const todayValue = createDateString(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );
  const selectedParts = parseDateParts(value) ?? parseDateParts(todayValue)!;
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState({
    year: selectedParts.year,
    month: selectedParts.month,
  });

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const calendarCells = useMemo(
    () => buildCalendarCells(visibleMonth.year, visibleMonth.month),
    [visibleMonth.month, visibleMonth.year],
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => {
          const nextParts = parseDateParts(value) ?? parseDateParts(todayValue)!;

          setVisibleMonth({
            year: nextParts.year,
            month: nextParts.month,
          });
          setIsOpen((current) => !current);
        }}
        className={`inline-flex w-full items-center justify-between gap-3 rounded-full bg-white px-4 py-3 text-sm font-bold text-[var(--primary)] shadow-[0_14px_28px_-24px_rgba(29,29,3,0.4)] ${buttonClassName}`}
      >
        <span className="inline-flex items-center gap-3">
          <CalendarDays className="size-4" />
          <span>{buttonLabel ? `${buttonLabel} ${formatDateValue(value)}` : formatDateValue(value)}</span>
        </span>
        <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div
          data-testid="app-date-picker-panel"
          data-side={placement}
          className={`absolute z-30 w-[min(20rem,calc(100vw-2rem))] rounded-[1.75rem] border border-[rgba(155,69,0,0.1)] bg-white/96 p-4 shadow-[0_32px_60px_-36px_rgba(29,29,3,0.42)] backdrop-blur ${
            placement === "bottom"
              ? "top-[calc(100%+0.75rem)]"
              : "bottom-[calc(100%+0.75rem)]"
          } ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-lg font-black tracking-[-0.03em] text-[var(--foreground)]">
              {formatMonthHeading(visibleMonth.year, visibleMonth.month)}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setVisibleMonth((current) => addMonths(current.year, current.month, -1))}
                className="flex size-9 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]"
                aria-label="上个月"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setVisibleMonth((current) => addMonths(current.year, current.month, 1))}
                className="flex size-9 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]"
                aria-label="下个月"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--muted)]">
            {weekdayLabels.map((label) => (
              <span key={label} className="py-2">
                {label}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-2">
            {calendarCells.map((cell) => {
              const isSelected = cell.value === value;

              return (
                <button
                  key={cell.value}
                  type="button"
                  onClick={() => {
                    onChange(cell.value);
                    setIsOpen(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-[1rem] text-sm font-semibold transition-colors ${
                    isSelected
                      ? "bg-[var(--outline-strong)] text-white shadow-[0_12px_20px_-16px_rgba(29,29,3,0.65)]"
                      : cell.isCurrentMonth
                        ? "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                        : "text-[var(--outline-strong)]/55 hover:bg-[var(--surface-soft)]"
                  }`}
                >
                  {cell.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm font-bold">
            {allowClear ? (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setIsOpen(false);
                }}
                className="text-[#0d66d0]"
              >
                清除
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => {
                onChange(todayValue);
                setIsOpen(false);
              }}
              className="text-[#0d66d0]"
            >
              今天
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
