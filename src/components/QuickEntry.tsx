import type { ChangeEventHandler, FormEventHandler } from "react";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  LoaderCircle,
  Plus,
  PlusCircle,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AppDatePicker } from "./AppDatePicker";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { AppBottomNav } from "./AppBottomNav";
import { AppTopBar } from "./AppTopBar";
import { normalizePersonName } from "../lib/app-logic";

export type QuickEntryPerson = {
  id: string;
  name: string;
  is_default: boolean;
};

export type HomeTab = "quick-entry" | "timeline" | "insight" | "profile";

type QuickEntryProps = {
  people: QuickEntryPerson[];
  selectedPersonId: string;
  content: string;
  reason: string;
  displayDate: string;
  saving: boolean;
  uploading: boolean;
  message: string;
  selectedImageName: string;
  imagePreviewUrl: string | null;
  activeTab: HomeTab;
  onPersonChange: (value: string) => void;
  onTabChange: (tab: HomeTab) => void;
  onCreatePerson: (name: string) => Promise<boolean>;
  onDeletePerson: (
    personId: string,
    forceDelete?: boolean,
  ) => Promise<{
    ok: boolean;
    requiresConfirmation?: boolean;
    recordCount?: number;
    personName?: string;
  }>;
  onContentChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onImageChange: ChangeEventHandler<HTMLInputElement>;
  onRemoveImage: () => void;
  onSave: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
};

const copy = {
  badge: "\u8f7b\u5feb\u901f\u8bb0",
  brand: "Little Joy Tracker",
  recordFor: "\u8bb0\u5f55\u7ed9\uff1a",
  upload: "\u6dfb\u52a0\u7167\u7247\u6216\u89c6\u9891",
  uploading: "\u6b63\u5728\u5904\u7406\u56fe\u7247...",
  actionSheetTitle: "\u9009\u62e9\u4e00\u79cd\u65b9\u5f0f",
  capture: "\u62cd\u7167",
  pick: "\u4ece\u624b\u673a\u76f8\u518c\u9009\u62e9",
  remove: "\u79fb\u9664\u5f53\u524d\u7167\u7247",
  dismissSheet: "\u53d6\u6d88",
  mediaHint:
    "\u624b\u673a\u4e0a\u53ef\u4ee5\u76f4\u63a5\u62cd\u7167\uff0c\u4e5f\u53ef\u4ee5\u4ece\u76f8\u518c\u6311\u9009\u3002",
  momentLabel: "\u90a3\u4e2a\u77ac\u95f4",
  momentPlaceholder: "\u53d1\u751f\u4e86\u4ec0\u4e48\uff1f",
  reasonLabel: "\u6b64\u65f6\u611f\u609f",
  reasonPlaceholder: "\u4e3a\u4ec0\u4e48\u89c9\u5f97\u7f8e\u597d\uff1f",
  today: "\u4eca\u5929",
  cancel: "\u53d6\u6d88",
  publish: "\u4fdd\u5b58\u5230\u5c0f\u7f8e\u597d",
  publishing: "\u53d1\u9001\u4e2d...",
  record: "\u8bb0\u5f55",
  timeline: "\u65f6\u95f4\u8f74",
  insight: "\u6d1e\u5bdf",
  profile: "\u4e2a\u4eba",
  createPerson: "\u65b0\u5efa\u4eba\u5458",
  createPlaceholder: "\u6bd4\u5982\uff1a\u81ea\u5df1\u3001\u7238\u7238\u3001\u5c0f\u732b",
  createConfirm: "\u521b\u5efa",
  duplicatePerson: "\u8fd9\u4e2a\u540d\u5b57\u5df2\u7ecf\u5b58\u5728\uff0c\u6362\u4e00\u4e2a\u5427\u3002",
  deletePerson: "\u5220\u9664",
  deleteConfirmTitle: "\u786e\u8ba4\u5220\u9664\u4eba\u5458",
  deleteConfirmBodyPrefix:
    "\u5f53\u524d\u8be5\u4eba\u5458\u5df2\u6709 ",
  deleteConfirmBodySuffix:
    " \u6761\u8bb0\u5f55\uff0c\u662f\u5426\u8981\u5220\u9664\u8be5\u4eba\u5458\u53ca\u8bb0\u5f55\uff1f",
  keepPerson: "\u5148\u4e0d\u5220",
  confirmDelete: "\u5220\u9664\u4eba\u5458\u53ca\u8bb0\u5f55",
  dateLabel: "\u4eca\u5929",
};

export function QuickEntry({
  people,
  selectedPersonId,
  content,
  reason,
  displayDate,
  saving,
  uploading,
  message,
  selectedImageName,
  imagePreviewUrl,
  activeTab,
  onPersonChange,
  onTabChange,
  onCreatePerson,
  onDeletePerson,
  onContentChange,
  onReasonChange,
  onDateChange,
  onImageChange,
  onRemoveImage,
  onSave,
  onCancel,
}: QuickEntryProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState(false);
  const [isMediaSheetOpen, setIsMediaSheetOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [creatingPerson, setCreatingPerson] = useState(false);
  const [deletingPersonId, setDeletingPersonId] = useState("");
  const [personFormMessage, setPersonFormMessage] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{
    personId: string;
    personName: string;
    recordCount: number;
  } | null>(null);

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === selectedPersonId) ?? people[0],
    [people, selectedPersonId],
  );
  const hasComposerContent = Boolean(
    content.trim() || reason.trim() || imagePreviewUrl || selectedImageName,
  );
  const hasImage = Boolean(imagePreviewUrl || selectedImageName);

  async function handleCreatePerson() {
    const trimmedName = newPersonName.trim();
    if (!trimmedName) {
      return;
    }

    const normalizedName = normalizePersonName(trimmedName);
    const hasDuplicate = people.some(
      (person) => normalizePersonName(person.name) === normalizedName,
    );

    if (hasDuplicate) {
      setPersonFormMessage(copy.duplicatePerson);
      return;
    }

    setPersonFormMessage("");
    setCreatingPerson(true);
    const created = await onCreatePerson(trimmedName);
    setCreatingPerson(false);

    if (created) {
      setNewPersonName("");
      setIsPersonMenuOpen(false);
    }
  }

  async function handleDeletePerson(personId: string) {
    setDeletingPersonId(personId);
    const result = await onDeletePerson(personId);
    setDeletingPersonId("");

    if (result.requiresConfirmation && result.recordCount && result.personName) {
      setPendingDelete({
        personId,
        personName: result.personName,
        recordCount: result.recordCount,
      });
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeletingPersonId(pendingDelete.personId);
    await onDeletePerson(pendingDelete.personId, true);
    setDeletingPersonId("");
    setPendingDelete(null);
  }

  return (
    <section className="joy-app-shell w-full">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,66,0.2),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.18),transparent_36%)]" />

      <AppTopBar title={copy.brand} leadingIcon={PlusCircle} trailingIcon={Sparkles} />

      <form
        onSubmit={onSave}
        className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto_auto]"
      >
        <div
          data-ui="quick-entry-scroll"
          className={`joy-app-content joy-scroll-hidden px-4 pb-6 pt-4 sm:px-6 ${
            hasComposerContent ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
        >
          <div className="joy-card flex min-h-full flex-col gap-5 overflow-hidden rounded-[2rem] border-[rgba(221,193,179,0.45)] p-4 sm:p-5">
            <div
              data-ui="quick-entry-media"
              className="relative flex h-[13.5rem] flex-col justify-end overflow-hidden rounded-[1.85rem] border border-[rgba(155,69,0,0.05)] bg-[linear-gradient(180deg,rgba(248,246,201,0.96),rgba(242,240,196,0.96))] sm:h-[15rem]"
            >
              {imagePreviewUrl ? (
                <Image
                  src={imagePreviewUrl}
                  alt="Selected memory preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
              <button
                type="button"
                data-ui="quick-entry-media-trigger"
                onClick={() => setIsMediaSheetOpen(true)}
                disabled={uploading}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center disabled:cursor-not-allowed"
              >
                {!hasImage ? (
                  <>
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/92 text-[var(--primary)] shadow-[0_10px_26px_-18px_rgba(29,29,3,0.24)]">
                    {uploading ? (
                      <LoaderCircle className="size-7 animate-spin" />
                    ) : (
                      <Camera className="size-7" />
                    )}
                  </span>
                  <span className="mt-4 text-sm font-medium text-[var(--muted)]/90">
                    {uploading ? copy.uploading : copy.upload}
                  </span>
                  <p className="mt-2 max-w-xs text-xs leading-6 text-[var(--muted)]/72">
                    {copy.mediaHint}
                  </p>
                  </>
                ) : (
                  <span className="rounded-full bg-white/88 px-4 py-2 text-xs font-semibold text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.25)]">
                    {uploading ? copy.uploading : copy.upload}
                  </span>
                )}
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={onImageChange}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageChange}
              />
              {selectedImageName ? (
                <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/88 px-3 py-1 text-xs font-semibold text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.25)]">
                  {selectedImageName}
                </span>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-5 px-1 pb-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPersonMenuOpen((current) => !current)}
                    className="joy-control-pill bg-[var(--surface-soft)] px-4 text-[var(--muted)] shadow-[0_14px_28px_-24px_rgba(29,29,3,0.22)]"
                  >
                    <span>
                      {copy.recordFor}
                      {selectedPerson?.name ?? ""}
                    </span>
                    <ChevronDown className="size-4" />
                  </button>

                  {isPersonMenuOpen ? (
                    <div className="absolute left-0 top-full z-20 mt-3 w-72 rounded-[1.25rem] border border-[rgba(155,69,0,0.08)] bg-white/95 p-3 shadow-[0_24px_40px_-26px_rgba(29,29,3,0.45)] backdrop-blur">
                      <div className="space-y-2">
                        {people.map((person) => (
                          <div
                            key={person.id}
                            className={`flex items-center gap-2 rounded-2xl px-3 py-3 transition-colors ${
                              person.id === selectedPersonId
                                ? "bg-[var(--primary-wash)] text-[var(--primary)]"
                                : "bg-[var(--surface-soft)] text-[var(--muted)]"
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onPersonChange(person.id);
                                setIsPersonMenuOpen(false);
                              }}
                              className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left text-sm font-semibold"
                            >
                              <span className="truncate">{person.name}</span>
                              {person.is_default ? (
                                <span className="text-[10px] uppercase tracking-[0.2em]">
                                  Default
                                </span>
                              ) : null}
                            </button>
                            {!person.is_default ? (
                              <button
                                type="button"
                                onClick={() => handleDeletePerson(person.id)}
                                disabled={deletingPersonId === person.id}
                                className="flex size-9 items-center justify-center rounded-full bg-white/80 text-[var(--primary)] transition-colors hover:bg-white disabled:opacity-60"
                                aria-label={`${copy.deletePerson}${person.name}`}
                              >
                                {deletingPersonId === person.id ? (
                                  <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                  <Trash2 className="size-4" />
                                )}
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 rounded-[1.25rem] bg-[var(--surface-soft)] p-3">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--muted)]">
                          {copy.createPerson}
                        </p>
                        <div className="flex gap-2">
                          <input
                            value={newPersonName}
                            onChange={(event) => {
                              setNewPersonName(event.target.value);
                              setPersonFormMessage("");
                            }}
                            placeholder={copy.createPlaceholder}
                            className="min-w-0 flex-1 rounded-full bg-white px-4 py-2 text-sm text-[var(--foreground)] outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleCreatePerson}
                            disabled={creatingPerson}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70"
                          >
                            {creatingPerson ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <Plus className="size-4" />
                            )}
                            {copy.createConfirm}
                          </button>
                        </div>
                        {personFormMessage ? (
                          <p className="mt-2 text-xs font-semibold text-[#d1603d]">
                            {personFormMessage}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <label className="joy-soft-panel block rounded-[1.7rem] px-5 py-5">
                <span className="mb-3 block text-[10px] font-extrabold uppercase tracking-[0.3em] text-[var(--primary)]/58">
                  {copy.momentLabel}
                </span>
                <AutoGrowTextarea
                  value={content}
                  onChange={(event) => onContentChange(event.target.value)}
                  placeholder={copy.momentPlaceholder}
                  className="min-h-28 w-full resize-none border-none bg-transparent p-0 text-[1.7rem] font-black leading-[1.45] tracking-[-0.04em] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/28"
                />
              </label>

              <label className="joy-soft-panel block rounded-[1.7rem] px-5 py-5">
                <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-[var(--tertiary)]/70">
                  <Lightbulb className="size-3.5" />
                  {copy.reasonLabel}
                </span>
                <AutoGrowTextarea
                  value={reason}
                  onChange={(event) => onReasonChange(event.target.value)}
                  placeholder={copy.reasonPlaceholder}
                  className="min-h-32 w-full resize-none border-none bg-transparent p-0 text-[1rem] leading-8 text-[var(--muted)] outline-none placeholder:text-[var(--muted)]/24"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="joy-blur-panel relative z-10 flex min-h-20 flex-wrap items-center justify-between gap-3 border-y border-[rgba(29,29,3,0.04)] px-5 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="joy-control-pill bg-white/60 px-4 text-[var(--muted)]">
              <CalendarDays className="size-4" />
              {copy.dateLabel}
            </span>
            <AppDatePicker
              value={displayDate}
              onChange={onDateChange}
              buttonLabel=""
              buttonClassName="px-4 py-3 text-sm font-semibold shadow-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="joy-control-pill bg-transparent px-4 text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="joy-topbar-button joy-topbar-button--primary"
            >
              {saving || uploading ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {saving || uploading ? copy.publishing : copy.publish}
            </button>
          </div>
        </div>

        <div className="px-5 py-3 text-sm text-[var(--muted)] sm:px-8">
          {message}
        </div>

        <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
      </form>

      {pendingDelete ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(29,29,3,0.24)] px-6">
          <div className="joy-card w-full max-w-sm rounded-[2rem] p-6">
            <h3 className="text-xl font-black tracking-[-0.04em] text-[var(--primary)]">
              {copy.deleteConfirmTitle}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {pendingDelete.personName}
              {copy.deleteConfirmBodyPrefix}
              {pendingDelete.recordCount}
              {copy.deleteConfirmBodySuffix}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[var(--muted)]"
              >
                {copy.keepPerson}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingPersonId === pendingDelete.personId}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-5 py-3 text-sm font-bold text-white disabled:opacity-70"
              >
                {deletingPersonId === pendingDelete.personId ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                {copy.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isMediaSheetOpen ? (
        <div
          className="absolute inset-0 z-50 flex items-end bg-[rgba(29,29,3,0.28)]"
          onClick={() => setIsMediaSheetOpen(false)}
        >
          <div className="w-full px-3 pb-4 sm:px-4 sm:pb-5">
            <div
              className="overflow-hidden rounded-[2rem] bg-[rgba(255,255,255,0.96)] shadow-[0_28px_56px_-28px_rgba(29,29,3,0.35)] backdrop-blur"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[rgba(155,69,0,0.08)] px-5 py-4 text-center text-sm font-semibold text-[var(--outline-strong)]">
                {copy.actionSheetTitle}
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setIsMediaSheetOpen(false);
                  cameraInputRef.current?.click();
                }}
                className="flex min-h-16 w-full items-center justify-center border-b border-[rgba(155,69,0,0.08)] px-5 text-lg font-medium text-[var(--foreground)] disabled:opacity-60"
              >
                {copy.capture}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setIsMediaSheetOpen(false);
                  galleryInputRef.current?.click();
                }}
                className={`flex min-h-16 w-full items-center justify-center px-5 text-lg font-medium text-[var(--foreground)] disabled:opacity-60 ${
                  hasImage ? "border-b border-[rgba(155,69,0,0.08)]" : ""
                }`}
              >
                {copy.pick}
              </button>
              {hasImage ? (
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    onRemoveImage();
                    setIsMediaSheetOpen(false);
                  }}
                  className="flex min-h-16 w-full items-center justify-center px-5 text-lg font-medium text-[#ba1a1a] disabled:opacity-60"
                >
                  {copy.remove}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setIsMediaSheetOpen(false)}
              className="mt-3 flex min-h-15 w-full items-center justify-center rounded-[1.6rem] bg-[rgba(255,255,255,0.96)] text-lg font-medium text-[var(--foreground)] shadow-[0_20px_40px_-24px_rgba(29,29,3,0.28)] disabled:opacity-60"
            >
              {copy.dismissSheet}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
