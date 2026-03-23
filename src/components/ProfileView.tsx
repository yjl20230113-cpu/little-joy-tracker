import { LogOut, Mail, Sparkles, UserRound } from "lucide-react";
import { AppBottomNav } from "./AppBottomNav";
import { AppTopBar } from "./AppTopBar";
import type { HomeTab } from "./QuickEntry";

type ProfileViewProps = {
  email: string;
  activeTab: HomeTab;
  message: string;
  onLogout: () => void;
  onTabChange: (tab: HomeTab) => void;
};

const copy = {
  title: "个人",
  subtitle: "把账号和给自己的照顾，都安静地放在这里。",
  emailLabel: "当前邮箱",
  logout: "退出登录",
  hintTitle: "小小的你",
  hintBody:
    "以后这里可以继续放头像、昵称、偏好设置和导出入口。现在先把最重要的账号信息安顿好。",
  record: "记录",
  timeline: "时间线",
  insight: "洞察",
  profile: "个人",
};

export function ProfileView({
  email,
  activeTab,
  message,
  onLogout,
  onTabChange,
}: ProfileViewProps) {
  return (
    <section className="joy-app-shell w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%)]" />

      <AppTopBar title="Little Joy Tracker" leadingIcon={UserRound} trailingIcon={Sparkles} />

      <div className="joy-app-content joy-scroll-hidden px-4 pb-6 pt-4 sm:px-6">
        <div className="space-y-5 pb-8">
          <section className="joy-card rounded-[2rem] px-5 py-6 sm:px-6">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--primary)]/62">
              {copy.title}
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {copy.subtitle}
            </p>
          </section>

          <section className="joy-soft-panel rounded-[2rem] px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--muted)]">
                  {copy.emailLabel}
                </p>
                <div className="mt-4 inline-flex max-w-full items-center gap-3 rounded-[1.4rem] bg-white/92 px-4 py-3 text-[var(--primary)] shadow-[0_16px_28px_-24px_rgba(29,29,3,0.28)]">
                  <Mail className="size-4 shrink-0" />
                  <span className="min-w-0 break-all text-sm font-semibold">{email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="joy-topbar-button shrink-0"
              >
                <LogOut className="size-4" />
                {copy.logout}
              </button>
            </div>
          </section>

          <section className="joy-card rounded-[2rem] px-5 py-6 sm:px-6">
            <div className="flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)]">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-black tracking-[-0.03em] text-[var(--primary)]">
                  {copy.hintTitle}
                </h2>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                  {copy.hintBody}
                </p>
              </div>
            </div>

            {message ? (
              <div className="mt-5 rounded-[1.4rem] bg-[linear-gradient(180deg,rgba(255,219,201,0.58),rgba(255,255,255,0.76))] px-4 py-3 text-sm font-semibold text-[var(--primary)]">
                {message}
              </div>
            ) : null}
          </section>
        </div>
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </section>
  );
}
