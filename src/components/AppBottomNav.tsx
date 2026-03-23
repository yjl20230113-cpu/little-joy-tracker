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
      className="joy-blur-panel joy-safe-bottom relative z-10 flex h-[7rem] shrink-0 items-center rounded-t-[2.7rem] px-4 pb-4 pt-3 sm:px-5"
    >
      <div className="grid w-full grid-cols-4 gap-2.5">
        {navItems.map(({ tab, icon: Icon, labelKey }) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              data-active={active}
              onClick={() => onTabChange(tab)}
              className={`flex h-[5.35rem] w-full flex-col items-center justify-center gap-1.5 rounded-[2.3rem] px-2 text-[0.82rem] font-medium tracking-[0.03em] transition-all duration-200 ${
                active
                  ? "translate-y-[-4px] bg-[var(--primary-wash)] text-[var(--primary)] shadow-[0_12px_24px_-18px_rgba(155,69,0,0.22)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <Icon className={`${active ? "size-6" : "size-5.5"}`} />
              <span className="leading-none">{labels[labelKey]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
