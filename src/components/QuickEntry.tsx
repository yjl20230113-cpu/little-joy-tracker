import type { ChangeEventHandler, FormEventHandler } from "react";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Lightbulb,
  LoaderCircle,
  Plus,
  PlusCircle,
  Sun,
  Trash2,
} from "lucide-react";

import { AppDatePicker } from "./AppDatePicker";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { AppBottomNav } from "./AppBottomNav";
import { AppToast } from "./AppToast";
import { AppTopBar } from "./AppTopBar";
import { CloudyLetterCard } from "./CloudyLetterCard";
import type { CloudyAnalysisResult } from "../lib/cloudy-analysis";
import { normalizePersonName } from "../lib/app-logic";
import { getSubmitActionState } from "../lib/image-upload";

export type QuickEntryPerson = {
  id: string;
  name: string;
  is_default: boolean;
};

export type HomeTab = "quick-entry" | "timeline" | "insight" | "profile";

type QuickEntryProps = {
  people: QuickEntryPerson[];
  mode: "JOY" | "CLOUDY";
  selectedPersonId: string;
  content: string;
  reason: string;
  displayDate: string;
  saving: boolean;
  uploading: boolean;
  cloudyLoading: boolean;
  cloudyLoadingMessage: string;
  cloudyLetter: CloudyAnalysisResult | null;
  message: string;
  onMessageClear?: () => void;
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
  onEnterCloudyMode: () => void;
  onExitCloudyMode: () => void;
  onCloudyLetterDismiss: () => void;
};

const copy = {
  brand: "Little Joy Tracker",
  cloudyPlaceholder: "说说吧，有什么不开心的？我在听...",
  cloudyPublish: "放入档案袋",
  cloudyPublishing: "正在放入档案袋...",
  cloudyReturn: "回到小美好",
  cloudyEntry: "进入小烦恼",
  cloudyIntro:
    "先别急着把自己整理好。把心里那团湿漉漉的话放下来，我会陪你把它慢慢摊开。",
  recordForEmpty: "请选择",
  upload: "添加照片或视频",
  uploading: "正在处理图片...",
  actionSheetTitle: "选择一种方式",
  capture: "拍照",
  pick: "从手机相册选择",
  remove: "移除当前照片",
  dismissSheet: "取消",
  mediaHint:
    "这一刻还没来得及拍照也没关系。先记下它，保存后小美好会悄悄配上一张刚刚好的画面。",
  momentLabel: "那个瞬间",
  momentPlaceholder: "发生了什么？",
  reasonLabel: "此时感悟",
  reasonPlaceholder: "为什么觉得美好？",
  publish: "保存到小美好",
  publishing: "发送中...",
  createPerson: "新建人员",
  createPlaceholder: "比如：自己、爸爸、小猫",
  createConfirm: "创建",
  duplicatePerson: "这个名字已经存在，换一个吧。",
  deletePerson: "删除",
  deleteConfirmTitle: "确认删除人员",
  deleteConfirmBodyPrefix: "当前该人员已有 ",
  deleteConfirmBodySuffix: " 条记录，是否要删除该人员及记录？",
  keepPerson: "先不删",
  confirmDelete: "删除人员及记录",
};

export function QuickEntry({
  people,
  mode,
  selectedPersonId,
  content,
  reason,
  displayDate,
  saving,
  uploading,
  cloudyLoading,
  cloudyLoadingMessage,
  cloudyLetter,
  message,
  onMessageClear,
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
  onEnterCloudyMode,
  onExitCloudyMode,
  onCloudyLetterDismiss,
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
  const isCloudyMode = mode === "CLOUDY";
  const hasImage = !isCloudyMode && Boolean(imagePreviewUrl || selectedImageName);
  const hasComposerContent = Boolean(
    content.trim() ||
      (!isCloudyMode && reason.trim()) ||
      (!isCloudyMode && hasImage),
  );
  const submitAction = getSubmitActionState({
    saving,
    uploading: isCloudyMode ? false : uploading,
    idleLabel: isCloudyMode ? copy.cloudyPublish : copy.publish,
    savingLabel: isCloudyMode ? copy.cloudyPublishing : copy.publishing,
    uploadingLabel: isCloudyMode ? copy.cloudyPublishing : copy.uploading,
  });

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
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#fcf8f5_0%,#f7efe9_52%,#f1e6df_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(193,127,102,0.16),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.42),transparent_42%)]" />

      <AppTopBar
        title={copy.brand}
        leadingIcon={PlusCircle}
        trailingIcon={undefined}
        rightSlot={
          isCloudyMode ? (
            <button
              type="button"
              onClick={onExitCloudyMode}
              className="joy-topbar-button border-[rgba(143,133,149,0.16)] bg-[rgba(245,241,245,0.88)] text-[#5f5568]"
            >
              <Sun className="size-4" />
              {copy.cloudyReturn}
            </button>
          ) : (
            <button
              type="button"
              onClick={onEnterCloudyMode}
              className="joy-topbar-button joy-topbar-button--tonal border-[rgba(193,127,102,0.16)] text-[#7a5548]"
              aria-label={copy.cloudyEntry}
            >
              <Cloud className="size-4" />
              {copy.cloudyEntry}
            </button>
          )
        }
      />

      <form
        onSubmit={onSave}
        className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto_auto]"
      >
        <div
          data-ui="quick-entry-scroll"
          className={`joy-app-content joy-scroll-hidden relative px-3 pb-4.5 pt-2.5 sm:px-4.5 ${
            isCloudyMode ? "bg-[linear-gradient(180deg,rgba(245,242,246,0.98),rgba(237,231,241,0.98))]" : ""
          } ${
            hasComposerContent ? "overflow-y-auto" : "overflow-y-hidden"
          }`}
        >
          {isCloudyMode ? (
            <>
              <motion.div
                aria-hidden="true"
                data-ui="cloudy-mode-surface"
                className="absolute inset-x-0 top-0 h-full overflow-hidden bg-[linear-gradient(180deg,rgba(245,242,246,0.98),rgba(237,231,241,0.98))]"
                initial={false}
                animate={{
                  height: isCloudyMode ? "100%" : "0%",
                  opacity: isCloudyMode ? 1 : 0,
                }}
                transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              />
              {cloudyLoading ? (
                <motion.div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),transparent_34%),linear-gradient(180deg,rgba(197,188,203,0.18),rgba(143,133,149,0.08))]"
                  animate={{ opacity: [0.45, 0.75, 0.45], scale: [1, 1.02, 1] }}
                  transition={{
                    duration: 2.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                />
              ) : null}
            </>
          ) : null}
          {isCloudyMode ? (
            <div className="relative space-y-4">
              <div data-ui="cloudy-date" className="flex justify-start px-1">
                <div className="min-h-9 w-[10.2rem]">
                  <AppDatePicker
                    value={displayDate}
                    onChange={onDateChange}
                    placement="bottom"
                    centerPanelOnViewport
                    align="center"
                    compact
                    className="min-h-9"
                    buttonClassName="min-h-9 rounded-[0.9rem] border-[rgba(143,133,149,0.12)] bg-[rgba(255,252,253,0.88)] px-3 py-2 text-[0.75rem] shadow-[0_10px_18px_-18px_rgba(75,53,45,0.16)]"
                  />
                </div>
              </div>

              <div className="joy-card rounded-[1.5rem] border-[rgba(143,133,149,0.18)] bg-[linear-gradient(180deg,rgba(252,249,252,0.96),rgba(244,239,246,0.98))] px-4 py-4 shadow-[0_24px_54px_-34px_rgba(75,53,45,0.22)]">
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[#8f8595]">
                  Rain Shelter
                </p>
                <p className="mt-2 text-[0.96rem] leading-7 text-[#4f4656]">
                  {copy.cloudyIntro}
                </p>
                <label className="mt-4 block rounded-[1.2rem] border border-[rgba(143,133,149,0.14)] bg-[rgba(255,252,253,0.76)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.52)]">
                  <AutoGrowTextarea
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder={copy.cloudyPlaceholder}
                    className="min-h-28 w-full border-none bg-transparent p-0 text-[1.02rem] leading-8 text-[#4f4656] outline-none placeholder:text-[#8d84a0]"
                  />
                </label>
              </div>

              {cloudyLoading && cloudyLoadingMessage ? (
                <motion.div
                  data-ui="cloudy-loading-overlay"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="joy-card rounded-[1.35rem] border-[rgba(143,133,149,0.14)] bg-[rgba(255,252,253,0.76)] px-4 py-4 text-center text-[0.96rem] leading-7 text-[#5b5171] backdrop-blur-md"
                >
                  {cloudyLoadingMessage}
                </motion.div>
              ) : null}

              {cloudyLetter ? (
                <CloudyLetterCard
                  letter={cloudyLetter}
                  onFooterAction={onCloudyLetterDismiss}
                />
              ) : null}
            </div>
          ) : (
            <div className="joy-card flex min-h-full flex-col gap-3 overflow-hidden rounded-[1.4rem] border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.92)] p-2.5 shadow-[0_24px_44px_-34px_rgba(75,53,45,0.22)] sm:p-3">
              <section
                data-ui="quick-entry-intro"
                className="rounded-[1rem] border border-[rgba(75,53,45,0.07)] bg-[rgba(251,245,240,0.94)] px-3.5 py-3"
              >
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--outline-strong)]">
                  Editorial Note
                </p>
                <p className="mt-1.5 text-[0.86rem] leading-6 text-[var(--muted)]">
                  {copy.mediaHint}
                </p>
              </section>
              <div
                data-ui="quick-entry-media"
                className="relative flex aspect-square w-full flex-col justify-end overflow-hidden rounded-[1.05rem] border border-[rgba(75,53,45,0.08)] bg-[linear-gradient(180deg,rgba(252,246,241,0.98),rgba(238,224,214,0.96))]"
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
                      <span className="flex size-[3rem] items-center justify-center rounded-full bg-white/92 text-[var(--primary)] shadow-[0_10px_20px_-18px_rgba(29,29,3,0.2)]">
                        {uploading ? (
                          <LoaderCircle className="size-6 animate-spin" />
                        ) : (
                          <Camera className="size-6" />
                        )}
                      </span>
                      <span className="mt-2 text-[0.84rem] font-semibold text-[var(--muted)]/90">
                        {uploading ? copy.uploading : copy.upload}
                      </span>
                    </>
                  ) : (
                    <span className="rounded-full bg-white/88 px-2.5 py-1 text-[0.68rem] font-semibold text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.22)]">
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
                  <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 rounded-full bg-white/88 px-2 py-1 text-[0.66rem] font-semibold text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.22)]">
                    {selectedImageName}
                  </span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col gap-3 px-0.5 pb-0.5">
                <div
                  data-ui="quick-entry-toolbar"
                  className="flex items-center justify-start gap-2 rounded-[1rem] border border-[rgba(75,53,45,0.06)] bg-[rgba(251,245,240,0.62)] px-2 py-2"
                >
                  <div className="relative min-w-0">
                    <button
                      type="button"
                      data-ui="quick-entry-person-trigger"
                      onClick={() => setIsPersonMenuOpen((current) => !current)}
                      className="joy-control-pill h-9 min-h-9 w-[9.6rem] justify-between rounded-full border border-[rgba(75,53,45,0.1)] bg-[rgba(255,249,244,0.94)] px-3 py-0 text-[0.75rem] font-semibold text-[var(--muted)] shadow-[0_10px_18px_-18px_rgba(75,53,45,0.16)]"
                    >
                      <span className="truncate">
                        {selectedPerson?.name ?? copy.recordForEmpty}
                      </span>
                      <ChevronDown className="size-3.5 shrink-0" />
                    </button>

                    {isPersonMenuOpen ? (
                      <div
                        data-ui="quick-entry-person-menu"
                        className="absolute left-0 top-full z-20 mt-2 w-[min(15rem,calc(100vw-3rem))] rounded-[1rem] border border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.96)] p-2.5 shadow-[0_16px_28px_-22px_rgba(75,53,45,0.22)] backdrop-blur"
                      >
                        <div className="space-y-1.5">
                          {people.map((person) => (
                            <div
                              key={person.id}
                              className={`flex items-center gap-1.5 rounded-[0.95rem] px-2.5 py-2 transition-colors ${
                                person.id === selectedPersonId
                                  ? "bg-[var(--primary-wash)] text-[var(--primary)]"
                                  : "bg-[rgba(255,248,244,0.9)] text-[var(--muted)]"
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  onPersonChange(person.id);
                                  setIsPersonMenuOpen(false);
                                }}
                                className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-[0.82rem] font-semibold"
                              >
                                <span className="truncate">{person.name}</span>
                                {person.is_default ? (
                                  <span className="text-[8px] uppercase tracking-[0.16em]">
                                    Default
                                  </span>
                                ) : null}
                              </button>
                              {!person.is_default ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeletePerson(person.id)}
                                  disabled={deletingPersonId === person.id}
                                  className="flex size-7 items-center justify-center rounded-full bg-white/80 text-[var(--primary)] transition-colors hover:bg-white disabled:opacity-60"
                                  aria-label={`${copy.deletePerson}${person.name}`}
                                >
                                  {deletingPersonId === person.id ? (
                                    <LoaderCircle className="size-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3.5" />
                                  )}
                                </button>
                              ) : null}
                            </div>
                          ))}
                        </div>

                        <div className="mt-2.5 rounded-[0.95rem] bg-[var(--surface-soft)] p-2.5">
                          <p className="mb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                            {copy.createPerson}
                          </p>
                          <div className="flex gap-1.5">
                            <input
                              value={newPersonName}
                              onChange={(event) => {
                                setNewPersonName(event.target.value);
                                setPersonFormMessage("");
                              }}
                              placeholder={copy.createPlaceholder}
                              className="min-w-0 flex-1 rounded-full border border-[rgba(75,53,45,0.08)] bg-[rgba(255,252,248,0.94)] px-3 py-2 text-[0.8rem] text-[var(--foreground)] outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleCreatePerson}
                              disabled={creatingPerson}
                              className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-3 py-2 text-[0.78rem] font-bold text-white disabled:opacity-70"
                            >
                              {creatingPerson ? (
                                <LoaderCircle className="size-3.5 animate-spin" />
                              ) : (
                                <Plus className="size-3.5" />
                              )}
                              {copy.createConfirm}
                            </button>
                          </div>
                          {personFormMessage ? (
                            <p className="mt-1.5 text-[0.72rem] font-semibold text-[#d1603d]">
                              {personFormMessage}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div data-ui="quick-entry-date" className="min-h-9 w-[10.2rem]">
                    <AppDatePicker
                      value={displayDate}
                      onChange={onDateChange}
                      placement="bottom"
                      centerPanelOnViewport
                      align="center"
                      compact
                      className="min-h-9"
                      buttonClassName="h-9 min-h-9 rounded-full border-[rgba(75,53,45,0.1)] bg-[rgba(255,249,244,0.94)] px-3 py-0 text-[0.75rem] font-semibold shadow-[0_10px_18px_-18px_rgba(75,53,45,0.16)]"
                    />
                  </div>
                </div>

                <label className="joy-soft-panel block rounded-[1.1rem] border border-[rgba(75,53,45,0.06)] bg-[rgba(255,248,244,0.88)] px-3 py-3">
                  <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/58">
                    {copy.momentLabel}
                  </span>
                  <AutoGrowTextarea
                    value={content}
                    onChange={(event) => onContentChange(event.target.value)}
                    placeholder={copy.momentPlaceholder}
                    className="min-h-20 w-full border-none bg-transparent p-0 text-[1.18rem] font-black leading-[1.36] tracking-[-0.04em] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/28"
                  />
                </label>

                <label className="joy-soft-panel block rounded-[1.1rem] border border-[rgba(75,53,45,0.06)] bg-[rgba(255,248,244,0.88)] px-3 py-3">
                  <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--tertiary)]/70">
                    <Lightbulb className="size-3.5" />
                    {copy.reasonLabel}
                  </span>
                  <AutoGrowTextarea
                    value={reason}
                    onChange={(event) => onReasonChange(event.target.value)}
                    placeholder={copy.reasonPlaceholder}
                    className="min-h-22 w-full border-none bg-transparent p-0 text-[0.84rem] leading-6 text-[var(--muted)] outline-none placeholder:text-[var(--muted)]/24"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div
          data-ui="quick-entry-footer"
          className={`relative z-10 min-h-[3.3rem] px-3 py-1.5 sm:px-5 ${isCloudyMode ? "bg-[rgba(242,237,241,0.96)]" : ""}`}
        >
          <div
            data-ui="quick-entry-save-rail"
            className={`flex w-full items-center justify-between gap-3 rounded-[1.15rem] border px-2.5 py-2 shadow-[0_18px_34px_-26px_rgba(75,53,45,0.22)] backdrop-blur-md ${
              isCloudyMode
                ? "border-[rgba(143,133,149,0.14)] bg-[rgba(248,243,247,0.88)]"
                : "border-[rgba(75,53,45,0.08)] bg-[rgba(247,240,235,0.9)]"
            }`}
          >
            <div className="min-w-0 pl-0.5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--outline-strong)]">
                Primary Action
              </p>
              <p className="truncate text-[0.74rem] text-[var(--muted)]">
                {isCloudyMode ? "把这段心事安放进档案袋" : "把这一刻收进今天的记录"}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitAction.disabled}
              className="joy-topbar-button joy-topbar-button--primary min-h-10 shrink-0 px-4 py-2.25 text-[0.78rem]"
            >
              {submitAction.disabled ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {submitAction.label}
            </button>
          </div>
        </div>

        <div
          data-ui="quick-entry-nav-support"
          className={isCloudyMode ? "bg-[rgba(242,237,241,0.96)]" : ""}
        >
          <AppBottomNav activeTab={activeTab} onTabChange={onTabChange} />
        </div>
      </form>

      <AppToast message={message} onClear={onMessageClear} />

      {!isCloudyMode && pendingDelete ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(29,29,3,0.24)] px-6">
          <div className="joy-card w-full max-w-sm rounded-[1.4rem] p-5">
            <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[var(--primary)]">
              {copy.deleteConfirmTitle}
            </h3>
            <p className="mt-3 text-[0.9rem] leading-6 text-[var(--muted)]">
              {pendingDelete.personName}
              {copy.deleteConfirmBodyPrefix}
              {pendingDelete.recordCount}
              {copy.deleteConfirmBodySuffix}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-full px-4 py-2 text-[0.9rem] font-semibold text-[var(--muted)]"
              >
                {copy.keepPerson}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deletingPersonId === pendingDelete.personId}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-4 py-2.5 text-[0.9rem] font-bold text-white disabled:opacity-70"
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

      {!isCloudyMode && isMediaSheetOpen ? (
        <div
          className="absolute inset-0 z-50 flex items-end bg-[rgba(29,29,3,0.28)]"
          onClick={() => setIsMediaSheetOpen(false)}
        >
          <div className="w-full px-3 pb-4 sm:px-4 sm:pb-5">
            <div
              className="overflow-hidden rounded-[1.4rem] bg-[rgba(255,255,255,0.96)] shadow-[0_24px_40px_-28px_rgba(29,29,3,0.3)] backdrop-blur"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-[rgba(155,69,0,0.08)] px-5 py-3.5 text-center text-[0.88rem] font-semibold text-[var(--outline-strong)]">
                {copy.actionSheetTitle}
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setIsMediaSheetOpen(false);
                  cameraInputRef.current?.click();
                }}
                className="flex min-h-14 w-full items-center justify-center border-b border-[rgba(155,69,0,0.08)] px-5 text-[1rem] font-medium text-[var(--foreground)] disabled:opacity-60"
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
                className={`flex min-h-14 w-full items-center justify-center px-5 text-[1rem] font-medium text-[var(--foreground)] disabled:opacity-60 ${
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
                  className="flex min-h-14 w-full items-center justify-center px-5 text-[1rem] font-medium text-[#ba1a1a] disabled:opacity-60"
                >
                  {copy.remove}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              disabled={uploading}
              onClick={() => setIsMediaSheetOpen(false)}
              className="mt-3 flex min-h-14 w-full items-center justify-center rounded-[1.15rem] bg-[rgba(255,255,255,0.96)] text-[1rem] font-medium text-[var(--foreground)] shadow-[0_20px_36px_-24px_rgba(29,29,3,0.24)] disabled:opacity-60"
            >
              {copy.dismissSheet}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
