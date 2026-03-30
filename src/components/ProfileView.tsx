import type { ChangeEventHandler } from "react";
import { useMemo, useRef, useState } from "react";
import {
  Camera,
  LoaderCircle,
  LogOut,
  Mail,
  PencilLine,
  RotateCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AppBottomNav } from "./AppBottomNav";
import { AppToast } from "./AppToast";
import { AppTopBar } from "./AppTopBar";
import type { HomeTab } from "./QuickEntry";
import { getSubmitActionState } from "../lib/image-upload";
import { useUpdateAvailableBuildId } from "../lib/pwa-update-client";

type ProfileViewProps = {
  email: string;
  displayName: string;
  avatarUrl: string | null;
  selectedImageName: string;
  activeTab: HomeTab;
  message: string;
  editing: boolean;
  saving: boolean;
  uploading: boolean;
  onMessageClear?: () => void;
  onRefreshApp: () => Promise<void> | void;
  onLogout: () => void;
  onTabChange: (tab: HomeTab) => void;
  onEditProfile: () => void;
  onDisplayNameChange: (value: string) => void;
  onAvatarSelect: ChangeEventHandler<HTMLInputElement>;
  onAvatarRemove: () => void;
  onSaveProfile: () => void;
};

const copy = {
  title: "个人",
  subtitle: "把账号和给自己的照顾，都安静地放在这里。",
  profileTitle: "你的资料",
  unnamed: "未设置名称",
  nameLabel: "名称",
  namePlaceholder: "给自己一个称呼",
  emailLabel: "当前邮箱",
  uploadAvatar: "更换头像",
  logout: "退出登录",
  edit: "编辑",
  save: "保存",
  saving: "保存中...",
  uploading: "正在上传头像...",
  refreshApp: "更新",
  refreshHint: "网站更新后如果你还是看到旧版本，点一下会清理缓存并重新加载最新资源。",
};

function getAvatarFallback(displayName: string, email: string) {
  const candidate = displayName.trim() || email.trim();
  return candidate.slice(0, 1).toUpperCase() || "J";
}

export function ProfileView({
  email,
  displayName,
  avatarUrl,
  selectedImageName,
  activeTab,
  message,
  editing,
  saving,
  uploading,
  onMessageClear,
  onRefreshApp,
  onLogout,
  onTabChange,
  onEditProfile,
  onDisplayNameChange,
  onAvatarSelect,
  onAvatarRemove: _onAvatarRemove,
  onSaveProfile,
}: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const updateAvailableBuildId = useUpdateAvailableBuildId();
  const avatarFallback = useMemo(
    () => getAvatarFallback(displayName, email),
    [displayName, email],
  );
  const submitAction = getSubmitActionState({
    saving,
    uploading,
    idleLabel: copy.save,
    savingLabel: copy.saving,
    uploadingLabel: copy.uploading,
  });
  const refreshDisabled = submitAction.disabled || refreshing;
  const showUpdateBadge = Boolean(updateAvailableBuildId);
  const actionLabel = editing ? submitAction.label : copy.edit;

  return (
    <section className="joy-app-shell w-full">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fcf8f5_0%,#f7efe9_52%,#f1e6df_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(193,127,102,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.34),transparent_42%)]" />

      <AppTopBar
        title="Little Joy Tracker"
        leadingIcon={UserRound}
        trailingIcon={undefined}
        rightSlot={
          <button
            type="button"
            onClick={editing ? onSaveProfile : onEditProfile}
            disabled={
              editing
                ? submitAction.disabled || !displayName.trim()
                : submitAction.disabled
            }
            className="joy-topbar-button border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.9)]"
          >
            {editing && submitAction.disabled ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : editing ? (
              <Sparkles className="size-4" />
            ) : (
              <PencilLine className="size-4" />
            )}
            {actionLabel}
          </button>
        }
      />

      <div className="joy-app-content joy-scroll-hidden px-3 pb-4.5 pt-2.5 sm:px-4.5">
        <div className="space-y-3.5 pb-6">
          <section
            data-ui="profile-editorial-intro"
            className="joy-card rounded-[1.35rem] border-[rgba(75,53,45,0.08)] bg-[rgba(255,250,247,0.92)] px-3.5 py-3.5 shadow-[0_24px_42px_-34px_rgba(75,53,45,0.2)]"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/62">
              {copy.title}
            </p>
            <p className="mt-1.5 text-[0.9rem] leading-6 text-[var(--muted)]">
              {copy.subtitle}
            </p>
          </section>

          <section
            data-ui="profile-identity-card"
            className="joy-soft-panel rounded-[1.35rem] border border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.94)] px-3.5 py-3.5 shadow-[0_22px_38px_-34px_rgba(75,53,45,0.18)]"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!editing || submitAction.disabled}
                    className="relative flex size-[5.2rem] items-center justify-center rounded-full text-[1.35rem] font-black tracking-[-0.04em] text-[var(--primary)] transition disabled:cursor-default"
                    aria-label={copy.uploadAvatar}
                  >
                    <span className="flex size-[5.2rem] items-center justify-center overflow-hidden rounded-full bg-[rgba(241,216,208,0.72)] shadow-[0_14px_26px_-22px_rgba(75,53,45,0.22)]">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={displayName.trim() || email}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarFallback
                      )}
                    </span>
                    {editing ? (
                      <span
                        data-testid="profile-avatar-camera-badge"
                        className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full bg-[var(--primary-soft)] text-white shadow-[0_10px_18px_-16px_rgba(75,53,45,0.3)]"
                      >
                        {uploading ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Camera className="size-4" />
                        )}
                      </span>
                    ) : null}
                  </button>
                  <input
                    ref={fileInputRef}
                    aria-label="上传头像"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onAvatarSelect}
                  />
                </div>

                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                  <h2 className="text-[1rem] font-black tracking-[-0.02em] text-[var(--primary)]">
                    {copy.profileTitle}
                  </h2>
                  {editing ? (
                    <div className="mt-2.5">
                      <input
                        data-testid="profile-name-input"
                        aria-label={copy.nameLabel}
                        value={displayName}
                        onChange={(event) => onDisplayNameChange(event.target.value)}
                        placeholder={copy.namePlaceholder}
                        className="w-full rounded-[1rem] border border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.94)] px-3.5 py-3 text-[0.95rem] font-semibold text-[var(--foreground)] outline-none shadow-[0_10px_18px_-18px_rgba(75,53,45,0.16)] placeholder:text-[var(--muted)]/40"
                      />
                    </div>
                  ) : (
                    <p
                      data-testid="profile-display-name"
                      className="mt-1.5 text-[1rem] font-semibold leading-6 text-[var(--foreground)]"
                    >
                      {displayName.trim() || copy.unnamed}
                    </p>
                  )}
                  {editing && selectedImageName ? (
                    <p className="mt-2 text-[0.78rem] font-semibold text-[var(--primary)]">
                      {selectedImageName}
                    </p>
                  ) : null}
                  </div>
                </div>
              </div>

              <div data-testid="profile-email-field" className="min-w-0 w-full">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
                  {copy.emailLabel}
                </p>
                <div
                  data-ui="profile-email-chip"
                  data-testid="profile-email-chip"
                  className="mt-2.5 flex w-full items-center gap-2.5 rounded-[1rem] border border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.94)] px-3.5 py-3 text-[var(--primary)] shadow-[0_10px_18px_-18px_rgba(75,53,45,0.16)]"
                >
                  <Mail className="size-4 shrink-0" />
                  <span className="min-w-0 break-all text-[0.88rem] font-semibold">
                    {email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  data-testid="profile-refresh-action"
                  onClick={async () => {
                    if (refreshDisabled) {
                      return;
                    }

                    setRefreshing(true);

                    try {
                      await onRefreshApp();
                    } finally {
                      setRefreshing(false);
                    }
                  }}
                  disabled={refreshDisabled}
                  className="joy-topbar-button w-full justify-center border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.9)]"
                >
                  {refreshing ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <RotateCw className="size-4" />
                  )}
                  {copy.refreshApp}
                  {showUpdateBadge ? (
                    <span
                      aria-hidden="true"
                      className="ml-1.5 inline-flex size-2 rounded-full bg-[#ff3b30]"
                    />
                  ) : null}
                </button>
                <p className="px-1 text-[0.78rem] leading-6 text-[var(--muted)]">
                  {copy.refreshHint}
                </p>
              </div>
            </div>
          </section>

          <div data-testid="profile-logout-slot" className="mt-8 pb-1">
            <button
              type="button"
              data-testid="profile-logout-action"
              onClick={onLogout}
              disabled={submitAction.disabled}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.9)] px-4 py-3 text-[0.92rem] font-bold text-[var(--primary)] shadow-[0_16px_26px_-22px_rgba(75,53,45,0.16)] transition disabled:opacity-70"
            >
              <LogOut className="size-4" />
              {copy.logout}
            </button>
          </div>
        </div>
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <AppToast message={message} onClear={onMessageClear} />
    </section>
  );
}
