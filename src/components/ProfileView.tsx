import { LogOut, Mail, Sparkles, UserRound } from "lucide-react";
import { AppBottomNav } from "./AppBottomNav";
import { AppToast } from "./AppToast";
import { AppTopBar } from "./AppTopBar";
import type { HomeTab } from "./QuickEntry";

type ProfileViewProps = {
  email: string;
  activeTab: HomeTab;
  message: string;
  onMessageClear?: () => void;
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
};

export function ProfileView({
  email,
  activeTab,
  message,
  onMessageClear,
  onLogout,
  onTabChange,
}: ProfileViewProps) {
  return (
    <section className="joy-app-shell w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%)]" />

      <AppTopBar title="Little Joy Tracker" leadingIcon={UserRound} trailingIcon={Sparkles} />

      <div className="joy-app-content joy-scroll-hidden px-3 pb-4.5 pt-2.5 sm:px-4.5">
        <div className="space-y-3.5 pb-6">
          <section className="joy-card rounded-[1.25rem] px-3.5 py-3.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/62">
              {copy.title}
            </p>
            <p className="mt-1.5 text-[0.9rem] leading-6 text-[var(--muted)]">
              {copy.subtitle}
            </p>
          </section>

          <section className="joy-soft-panel rounded-[1.25rem] px-3.5 py-3.5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {copy.emailLabel}
                </p>
                <div className="mt-2.5 inline-flex max-w-full items-center gap-2.5 rounded-[0.82rem] bg-white/92 px-2.5 py-2 text-[var(--primary)] shadow-[0_10px_18px_-18px_rgba(29,29,3,0.2)]">
                  <Mail className="size-4 shrink-0" />
                  <span className="min-w-0 break-all text-[0.88rem] font-semibold">
                    {email}
                  </span>
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

          <section className="joy-card rounded-[1.25rem] px-3.5 py-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-10.5 shrink-0 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)]">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h2 className="text-[1rem] font-black tracking-[-0.02em] text-[var(--primary)]">
                  {copy.hintTitle}
                </h2>
                <p className="mt-1.5 text-[0.88rem] leading-6.5 text-[var(--muted)]">
                  {copy.hintBody}
                </p>
              </div>
            </div>

          </section>
        </div>
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <AppToast message={message} onClear={onMessageClear} />
    </section>
  );
}
