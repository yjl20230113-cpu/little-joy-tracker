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
      ? "border-[rgba(143,133,149,0.14)] bg-[rgba(245,241,245,0.84)] shadow-[0_18px_30px_-28px_rgba(95,82,102,0.28)] backdrop-blur-[18px]"
      : "border-[rgba(75,53,45,0.08)] bg-[rgba(250,246,242,0.72)] shadow-[0_18px_28px_-28px_rgba(75,53,45,0.32)] backdrop-blur-[18px]";

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
            className="flex size-[1.95rem] shrink-0 items-center justify-center rounded-full border border-[rgba(75,53,45,0.08)] bg-[rgba(255,249,244,0.9)] text-[var(--primary)] shadow-[0_12px_18px_-18px_rgba(75,53,45,0.18)]"
          >
            <LeadingIcon className="size-[0.96rem]" />
          </div>
        ) : null}
        <h2
          data-ui="app-topbar-title"
          className="truncate text-[0.98rem] font-black tracking-[-0.045em] text-[var(--primary)] sm:text-[1.04rem]"
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
            className="flex size-[1.95rem] items-center justify-center rounded-full border border-[rgba(75,53,45,0.08)] bg-[rgba(255,249,244,0.82)] shadow-[inset_0_1px_0_rgba(255,255,255,0.62)]"
          >
            <TrailingIcon className="size-[0.94rem] fill-current" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
