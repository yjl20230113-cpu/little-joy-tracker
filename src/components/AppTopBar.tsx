import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AppTopBarProps = {
  title: string;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  leftSlot?: ReactNode;
  titleAccessory?: ReactNode;
  rightSlot?: ReactNode;
};

export function AppTopBar({
  title,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  leftSlot,
  titleAccessory,
  rightSlot,
}: AppTopBarProps) {
  return (
    <header
      data-ui="app-topbar"
      className="joy-safe-top relative z-10 flex min-h-[4rem] shrink-0 items-center justify-between border-b border-[rgba(155,69,0,0.06)] bg-[rgba(255,253,190,0.82)] px-3.5 py-1.5 shadow-[0_10px_22px_-24px_rgba(29,29,3,0.22)] sm:px-5"
    >
      <div className="flex min-w-0 items-center gap-2">
        {leftSlot ? (
          <div data-ui="app-topbar-leading">{leftSlot}</div>
        ) : LeadingIcon ? (
          <div
            data-ui="app-topbar-leading"
            className="flex size-[2.15rem] shrink-0 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)] shadow-[0_10px_18px_-18px_rgba(155,69,0,0.24)]"
          >
            <LeadingIcon className="size-[1.05rem]" />
          </div>
        ) : null}
        <h2
          data-ui="app-topbar-title"
          className="truncate text-[1rem] font-black tracking-[-0.04em] text-[var(--primary)] sm:text-[1.125rem]"
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
            className="flex size-[2.15rem] items-center justify-center rounded-full"
          >
            <TrailingIcon className="size-[1.05rem] fill-current" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
