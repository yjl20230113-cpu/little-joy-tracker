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
    tone === "warm"
      ? "border-[rgba(143,133,149,0.12)] bg-[rgba(244,239,243,0.96)] shadow-[0_-16px_28px_-30px_rgba(95,82,102,0.18)] backdrop-blur-[20px]"
      : "border-[rgba(75,53,45,0.08)] bg-[rgba(249,244,240,0.96)] shadow-[0_-16px_28px_-30px_rgba(75,53,45,0.16)] backdrop-blur-[20px]";

  return (
    <nav
      data-ui="app-bottom-nav"
      data-tone={tone}
      className={`joy-safe-bottom relative z-10 mt-1 flex shrink-0 items-start rounded-none border-x-0 border-b-0 border-t px-2 pb-1 pt-1 sm:mt-0 sm:h-[5.8rem] sm:items-center sm:rounded-t-[1.55rem] sm:border-x sm:border-b sm:px-3 sm:pb-2.5 sm:pt-2.5 ${navToneClass} ${surfaceClassName ?? ""}`}
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
                  ? `${activeItemClassName ?? "bg-[rgba(75,53,45,0.08)]"} font-semibold text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_0_0_1px_rgba(75,53,45,0.04),0_12px_18px_-18px_rgba(75,53,45,0.2)]`
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
