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
      <div className="grid w-full grid-cols-4 gap-1">
        {navItems.map(({ tab, icon: Icon, labelKey }) => {
          const active = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              data-active={active}
              onClick={() => onTabChange(tab)}
              className={`mx-auto flex h-[4.05rem] w-[92%] flex-col items-center justify-center gap-0.5 rounded-[1.55rem] px-1.5 text-[0.74rem] font-medium leading-tight tracking-[0.01em] transition-all duration-200 ${
                active
                  ? "bg-[rgba(255,219,201,0.88)] text-[var(--primary)] shadow-[0_8px_14px_-14px_rgba(155,69,0,0.18)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <Icon className={active ? "size-[1.28rem]" : "size-[1.22rem]"} />
              <span className="text-center">{labels[labelKey]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
