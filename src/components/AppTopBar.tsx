import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AppTopBarProps = {
  title: string;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  leftSlot?: ReactNode;
  titleAccessory?: ReactNode;
  rightSlot?: ReactNode;
  tone?: "warm" | "cloudy";
};

export function AppTopBar({
  title,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  leftSlot,
  titleAccessory,
  rightSlot,
  tone = "warm",
}: AppTopBarProps) {
  const barToneClass =
    tone === "cloudy"
      ? "border-[rgba(143,133,149,0.1)] bg-[rgba(247,243,246,0.88)] shadow-[0_16px_28px_-28px_rgba(95,82,102,0.24)]"
      : "border-[rgba(75,53,45,0.08)] bg-[rgba(252,248,245,0.82)] shadow-[0_16px_28px_-28px_rgba(75,53,45,0.22)]";

  return (
    <header
      data-ui="app-topbar"
      data-tone={tone}
      className={`joy-safe-top relative z-10 flex min-h-[3.6rem] shrink-0 items-center justify-between border-b px-3 py-1.5 sm:px-4.5 ${barToneClass}`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {leftSlot ? (
          <div data-ui="app-topbar-leading">{leftSlot}</div>
        ) : LeadingIcon ? (
          <div
            data-ui="app-topbar-leading"
            className="flex size-[1.95rem] shrink-0 items-center justify-center rounded-full border border-[rgba(75,53,45,0.08)] bg-[rgba(255,250,247,0.88)] text-[var(--primary)] shadow-[0_12px_20px_-20px_rgba(75,53,45,0.2)]"
          >
            <LeadingIcon className="size-[0.96rem]" />
          </div>
        ) : null}
        <h2
          data-ui="app-topbar-title"
          className="truncate text-[0.96rem] font-black tracking-[-0.055em] text-[var(--primary)] sm:text-[1.04rem]"
        >
          {title}
        </h2>
        {titleAccessory ? (
          <div data-ui="app-topbar-title-accessory" className="shrink-0">
            {titleAccessory}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1 text-[var(--primary)]">
        {rightSlot ? (
          <div data-ui="app-topbar-trailing" className="flex items-center gap-1.5">
            {rightSlot}
          </div>
        ) : TrailingIcon ? (
          <div
            data-ui="app-topbar-trailing"
            className="flex size-[1.95rem] items-center justify-center rounded-full border border-[rgba(75,53,45,0.06)] bg-[rgba(255,250,247,0.72)]"
          >
            <TrailingIcon className="size-[0.94rem] fill-current" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
