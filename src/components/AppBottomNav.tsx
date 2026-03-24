import { BookOpen, Heart, SunMedium, UserRound } from "lucide-react";
import type { HomeTab } from "./QuickEntry";

type AppBottomNavProps = {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
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
  labels = defaultLabels,
}: AppBottomNavProps) {
  return (
    <nav
      data-ui="app-bottom-nav"
      className="joy-blur-panel joy-safe-bottom relative z-10 flex shrink-0 items-start rounded-none border-x-0 border-b-0 border-t border-[rgba(155,69,0,0.06)] px-2 pb-1 pt-1 sm:h-[5.8rem] sm:items-center sm:rounded-t-[1.8rem] sm:border-x sm:border-b sm:px-3.5 sm:pb-2.5 sm:pt-2"
    >
      <div className="grid w-full grid-cols-4 gap-0.5">
        {navItems.map(({ tab, icon: Icon, labelKey }) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              data-active={active}
              onClick={() => onTabChange(tab)}
              className={`mx-auto flex h-[3.72rem] w-[90%] flex-col items-center justify-center gap-[0.18rem] rounded-[1.3rem] px-1 text-[0.62rem] leading-[1.05] tracking-[0.005em] transition-all duration-200 ${
                active
                  ? "bg-[rgba(255,219,201,0.82)] font-medium text-[var(--primary)] shadow-[0_8px_14px_-16px_rgba(155,69,0,0.16)]"
                  : "font-normal text-[var(--muted)]"
              }`}
            >
              <Icon className={active ? "size-[1.12rem]" : "size-[1.06rem]"} />
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
