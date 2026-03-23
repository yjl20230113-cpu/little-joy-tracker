import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AppTopBarProps = {
  title: string;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

export function AppTopBar({
  title,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  leftSlot,
  rightSlot,
}: AppTopBarProps) {
  return (
    <header
      data-ui="app-topbar"
      className="relative z-10 flex min-h-[5rem] shrink-0 items-center justify-between border-b border-[rgba(155,69,0,0.06)] bg-[rgba(255,253,190,0.82)] px-5 py-3.5 shadow-[0_12px_28px_-24px_rgba(29,29,3,0.35)] sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        {leftSlot ? (
          <div data-ui="app-topbar-leading">{leftSlot}</div>
        ) : LeadingIcon ? (
          <div
            data-ui="app-topbar-leading"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)] shadow-[0_14px_28px_-24px_rgba(155,69,0,0.45)]"
          >
            <LeadingIcon className="size-5.5" />
          </div>
        ) : null}
        <h2
          data-ui="app-topbar-title"
          className="truncate text-[1.3rem] font-black tracking-[-0.045em] text-[var(--primary)] sm:text-[1.38rem]"
        >
          {title}
        </h2>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-[var(--primary)]">
        {rightSlot ? (
          <div data-ui="app-topbar-trailing" className="flex items-center gap-2">
            {rightSlot}
          </div>
        ) : TrailingIcon ? (
          <div
            data-ui="app-topbar-trailing"
            className="flex size-11 items-center justify-center rounded-full"
          >
            <TrailingIcon className="size-5.5 fill-current" />
          </div>
        ) : null}
      </div>
    </header>
  );
}
