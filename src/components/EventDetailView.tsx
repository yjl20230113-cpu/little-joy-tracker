import type { ReactNode } from "react";
import { ArrowLeft, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import { AppBottomNav } from "./AppBottomNav";
import { AppToast } from "./AppToast";
import { AppTopBar } from "./AppTopBar";
import type { HomeTab } from "./QuickEntry";

type EventDetailViewProps = {
  title: string;
  backLabel: string;
  activeTab: HomeTab;
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  message: string;
  onMessageClear?: () => void;
  createdAtText: string;
  personName: string;
  displayDate: string;
  content: string;
  reason: string;
  children?: ReactNode;
  onBack: () => void;
  onEditToggle: () => void;
  onDelete: () => void;
  onTabChange: (tab: HomeTab) => void;
};

const copy = {
  edit: "编辑",
  delete: "删除",
  deleting: "删除中...",
  record: "记录",
  timeline: "时间线",
  insight: "洞察",
  profile: "个人",
  moment: "那个瞬间",
  reason: "此时感悟",
};

export function EventDetailView({
  title,
  backLabel,
  activeTab,
  editing,
  saving,
  deleting,
  message,
  onMessageClear,
  createdAtText,
  personName,
  displayDate,
  content,
  reason,
  children,
  onBack,
  onEditToggle,
  onDelete,
  onTabChange,
}: EventDetailViewProps) {
  return (
    <section className="joy-app-shell w-full">
      <AppTopBar
        title={title}
        leftSlot={
          <button
            type="button"
            onClick={onBack}
            className="joy-topbar-button"
          >
            <ArrowLeft className="size-4" />
            {backLabel}
          </button>
        }
        rightSlot={
          <>
            <button
              type="button"
              onClick={onEditToggle}
              disabled={saving || deleting}
              aria-pressed={editing}
              className={`joy-topbar-button ${editing ? "joy-topbar-button--primary" : ""}`}
            >
              {saving ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Pencil className="size-4" />
              )}
              {copy.edit}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting || saving}
              className="joy-topbar-button joy-topbar-button--danger"
            >
              {deleting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? copy.deleting : copy.delete}
            </button>
          </>
        }
      />

      <div className="joy-app-content joy-scroll-hidden px-5 pb-7 pt-4 sm:px-6">
        <div className="space-y-6 pb-10">
          {children ?? (
            <section className="joy-card rounded-[2rem] px-6 py-7">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                <span className="rounded-full bg-[var(--surface-soft)] px-3 py-1 text-[var(--primary)]">
                  {personName}
                </span>
                <span className="rounded-full bg-white/84 px-3 py-1">{displayDate}</span>
              </div>
              <div className="mt-6 space-y-6">
                <section className="joy-soft-panel rounded-[1.7rem] px-5 py-5">
                  <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--primary)]/55">
                    {copy.moment}
                  </p>
                  <p className="text-[1.08rem] leading-8 text-[var(--foreground)]">{content}</p>
                </section>
                <section className="joy-soft-panel rounded-[1.7rem] px-5 py-5">
                  <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.28em] text-[var(--tertiary)]/70">
                    {copy.reason}
                  </p>
                  <p className="text-[1rem] leading-8 text-[var(--muted)] italic">{reason}</p>
                </section>
                <p className="border-t border-[rgba(155,69,0,0.08)] pt-6 text-sm text-[var(--muted)]">
                  {createdAtText}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>

      <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      <AppToast message={message} onClear={onMessageClear} />
    </section>
  );
}
