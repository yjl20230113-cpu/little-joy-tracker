import { BookOpen, Heart, SunMedium, UserRound } from "lucide-react";
import type { HomeTab } from "./QuickEntry";
import { useUpdateAvailableBuildId } from "../lib/pwa-update-client";

type AppBottomNavProps = {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
  tone?: "default" | "warm";
  surfaceClassName?: string;
  activeItemClassName?: string;
  labels?: {
    record: string;
    timeline: string;
    insight: string;
    profile: string;
  };
};

const defaultLabels = {
  record: "每日悦点",
  timeline: "心绪日志",
  insight: "治愈社区",
  profile: "个人中心",
};

const navItems = [
  { tab: "quick-entry" as const, icon: SunMedium, labelKey: "record" as const },
  { tab: "timeline" as const, icon: BookOpen, labelKey: "timeline" as const },
  { tab: "insight" as const, icon: Heart, labelKey: "insight" as const },
  { tab: "profile" as const, icon: UserRound, labelKey: "profile" as const },
];

export function AppBottomNav({
  activeTab,
  onTabChange,
  tone = "default",
  surfaceClassName,
  activeItemClassName,
  labels = defaultLabels,
}: AppBottomNavProps) {
  const updateAvailableBuildId = useUpdateAvailableBuildId();
  const showProfileUpdateBadge = Boolean(updateAvailableBuildId);
  const navToneClass =
    "border-[rgba(205,162,101,0.14)] bg-[rgba(255,251,231,0.96)] shadow-[0_-12px_24px_-28px_rgba(155,69,0,0.14)] backdrop-blur-[18px]";

  return (
    <nav
      data-ui="app-bottom-nav"
      data-tone={tone}
      className={`joy-safe-bottom relative z-10 mt-1 flex shrink-0 items-start rounded-none border-x-0 border-b-0 border-t px-2 pb-1 pt-1 sm:mt-0 sm:h-[5.8rem] sm:items-center sm:rounded-t-[1.55rem] sm:border-x sm:border-b sm:px-3.5 sm:pb-2.5 sm:pt-2.5 ${navToneClass} ${surfaceClassName ?? ""}`}
    >
      <div className="grid w-full grid-cols-4 gap-0.5">
        {navItems.map(({ tab, icon: Icon, labelKey }) => {
          const active = activeTab === tab;
          const showBadge = tab === "profile" && showProfileUpdateBadge;

          return (
            <button
              key={tab}
              type="button"
              data-active={active}
              onClick={() => onTabChange(tab)}
              className={`mx-auto flex h-[3.72rem] w-[90%] flex-col items-center justify-center gap-[0.18rem] rounded-[1.3rem] px-1 text-[0.62rem] leading-[1.05] tracking-[0.005em] transition-all duration-200 ${
                active
                  ? `${activeItemClassName ?? "bg-[rgba(255,219,201,0.82)]"} font-medium text-[var(--primary)] shadow-[0_8px_14px_-16px_rgba(155,69,0,0.16)]`
                  : "font-normal text-[var(--muted)]"
              }`}
            >
              <span className="relative">
                <Icon className={active ? "size-[1.12rem]" : "size-[1.06rem]"} />
                {showBadge ? (
                  <span
                    aria-hidden="true"
                    className="absolute -right-1 -top-0.5 inline-flex size-2 rounded-full bg-[#ff3b30] ring-2 ring-white/90"
                  />
                ) : null}
              </span>
              <span className="max-w-[4.2rem] whitespace-normal text-center break-keep">
                {labels[labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
