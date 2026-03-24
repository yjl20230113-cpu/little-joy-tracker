"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

type AppDatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  align?: "left" | "center" | "right";
  placement?: "top" | "bottom";
  allowClear?: boolean;
  buttonLabel?: string;
  className?: string;
  buttonClassName?: string;
  compact?: boolean;
  centerPanelOnViewport?: boolean;
};

type CalendarCell = {
  value: string;
  label: number;
  isCurrentMonth: boolean;
};

const weekdayLabels = [
  "\u4e00",
  "\u4e8c",
  "\u4e09",
  "\u56db",
  "\u4e94",
  "\u516d",
  "\u65e5",
];

const copy = {
  today: "\u4eca\u5929",
  chooseDate: "\u8bf7\u9009\u62e9\u65e5\u671f",
  choosePrefix: "\u9009\u62e9",
  previousMonth: "\u4e0a\u4e00\u4e2a\u6708",
  nextMonth: "\u4e0b\u4e00\u4e2a\u6708",
  clear: "\u6e05\u9664",
};

function parseDateParts(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
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
  return `${year}\u5e74${String(month).padStart(2, "0")}\u6708`;
}

function formatDateValue(value: string) {
  const parts = parseDateParts(value);

  if (!parts) {
    return copy.chooseDate;
  }

  return `${parts.year}/${String(parts.month).padStart(2, "0")}/${String(parts.day).padStart(2, "0")}`;
}

function formatCompactDateValue(value: string, todayValue: string) {
  const parts = parseDateParts(value);

  if (!parts) {
    return copy.chooseDate;
  }

  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  const shortDate = `${month}-${day}`;
  return value === todayValue ? `${copy.today}-${shortDate}` : shortDate;
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
  compact = false,
  centerPanelOnViewport = false,
}: AppDatePickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const today = new Date();
  const todayValue = createDateString(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );
  const selectedParts = parseDateParts(value) ?? parseDateParts(todayValue)!;
  const [isOpen, setIsOpen] = useState(false);
  const [viewportTop, setViewportTop] = useState<number | null>(null);
  const [viewportBottom, setViewportBottom] = useState<number | null>(null);
  const [visibleMonth, setVisibleMonth] = useState({
    year: selectedParts.year,
    month: selectedParts.month,
  });

  useLayoutEffect(() => {
    if (!isOpen || !centerPanelOnViewport) {
      setViewportTop(null);
      setViewportBottom(null);
      return;
    }

    function syncViewportPosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const offset = 10;
      if (placement === "bottom") {
        setViewportTop(Math.round(rect.bottom + offset));
        setViewportBottom(null);
        return;
      }

      setViewportBottom(Math.round(window.innerHeight - rect.top + offset));
      setViewportTop(null);
    }

    syncViewportPosition();
    window.addEventListener("scroll", syncViewportPosition, true);
    window.addEventListener("resize", syncViewportPosition);

    return () => {
      window.removeEventListener("scroll", syncViewportPosition, true);
      window.removeEventListener("resize", syncViewportPosition);
    };
  }, [centerPanelOnViewport, isOpen, placement]);

  useEffect(() => {
    if (!isOpen) {
      // No-op: panel state resets via visibleMonth sync.
    }
  }, [isOpen, todayValue, value]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node | null;

      if (!target) {
        return;
      }

      // When the panel is rendered in a portal, it won't be inside containerRef.
      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      if (!containerRef.current?.contains(target)) {
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

  const triggerLabel = compact
    ? formatCompactDateValue(value, todayValue)
    : formatDateValue(value);
  const panelWidthClass = compact
    ? "w-[min(13.5rem,calc(100vw-1.5rem))]"
    : "w-[min(16rem,calc(100vw-2rem))]";

  const panel = (
    <div
      ref={panelRef}
      data-testid="app-date-picker-panel"
      data-side={placement}
      style={
        centerPanelOnViewport
          ? {
              top: viewportTop ?? undefined,
              bottom: viewportBottom ?? undefined,
            }
          : undefined
      }
      className={`${centerPanelOnViewport ? "fixed left-1/2 -translate-x-1/2" : "absolute"} z-30 ${panelWidthClass} rounded-[1rem] border border-[rgba(155,69,0,0.1)] bg-white/96 p-2.5 shadow-[0_24px_40px_-28px_rgba(29,29,3,0.28)] backdrop-blur ${
        centerPanelOnViewport
          ? ""
          : placement === "bottom"
            ? "top-[calc(100%+0.45rem)]"
            : "bottom-[calc(100%+0.45rem)]"
      } ${
        centerPanelOnViewport
          ? ""
          : align === "right"
            ? "right-0"
            : align === "center"
              ? "left-1/2 -translate-x-1/2"
              : "left-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[0.84rem] font-bold tracking-[-0.03em] text-[var(--foreground)]">
          {formatMonthHeading(visibleMonth.year, visibleMonth.month)}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setVisibleMonth((current) => addMonths(current.year, current.month, -1))
            }
            className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]"
            aria-label={copy.previousMonth}
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              setVisibleMonth((current) => addMonths(current.year, current.month, 1))
            }
            className="flex size-7 items-center justify-center rounded-full bg-[var(--surface-soft)] text-[var(--primary)]"
            aria-label={copy.nextMonth}
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-[var(--muted)]">
        {weekdayLabels.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {calendarCells.map((cell) => {
          const isSelected = cell.value === value;

          return (
            <button
              key={cell.value}
              type="button"
              aria-label={`${copy.choosePrefix} ${cell.value}`}
              onClick={() => {
                onChange(cell.value);
                setIsOpen(false);
              }}
              className={`flex aspect-square items-center justify-center rounded-[0.72rem] text-[0.8rem] font-medium transition-colors ${
                isSelected
                  ? "bg-[var(--outline-strong)] text-white shadow-[0_10px_16px_-16px_rgba(29,29,3,0.48)]"
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

      <div className="mt-2.5 flex items-center justify-between text-[0.76rem] font-semibold">
        {allowClear ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setIsOpen(false);
            }}
            className="text-[#0d66d0]"
          >
            {copy.clear}
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
          {copy.today}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        data-testid="app-date-picker-trigger"
        onClick={() => {
          const nextParts = parseDateParts(value) ?? parseDateParts(todayValue)!;

          setVisibleMonth({
            year: nextParts.year,
            month: nextParts.month,
          });

          if (centerPanelOnViewport) {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) {
              const offset = 10;
              if (placement === "bottom") {
                setViewportTop(Math.round(rect.bottom + offset));
                setViewportBottom(null);
              } else {
                setViewportBottom(Math.round(window.innerHeight - rect.top + offset));
                setViewportTop(null);
              }
            }
          }

          setIsOpen((current) => !current);
        }}
        className={`inline-flex w-full items-center justify-between gap-2 rounded-full bg-white px-3 py-2 text-[0.78rem] font-medium text-[var(--primary)] shadow-[0_10px_18px_-18px_rgba(29,29,3,0.22)] ${buttonClassName}`}
      >
        <span className="inline-flex min-w-0 items-center gap-2">
          <CalendarDays className={`${compact ? "size-[0.88rem]" : "size-[0.95rem]"} shrink-0`} />
          <span className={compact ? "whitespace-nowrap" : "truncate"}>
            {buttonLabel ? `${buttonLabel} ${triggerLabel}` : triggerLabel}
          </span>
        </span>
        <ChevronDown
          className={`size-[0.95rem] shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen
        ? centerPanelOnViewport && typeof document !== "undefined"
          ? createPortal(panel, document.body)
          : panel
        : null}
    </div>
  );
}
