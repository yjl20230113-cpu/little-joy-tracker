import type { ChangeEventHandler, FormEventHandler } from "react";
import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  ChevronDown,
  Lightbulb,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { AppDatePicker } from "./AppDatePicker";
import { AppToast } from "./AppToast";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import type {
  AutoImageAttribution,
  EventInsightReport,
  EventInsightStatus,
} from "../lib/app-logic";
import {
  autoImagePlaceholderSrc,
  formatDetailTimestamp,
  withUnsplashAttributionParams,
} from "../lib/app-logic";
import { fallbackMemoryTitle } from "../lib/memory-title";

type DetailPerson = {
  id: string;
  name: string;
  is_default: boolean;
};

type DetailEvent = {
  id: string;
  title?: string | null;
  content: string;
  reason: string | null;
  imageUrl: string | null;
  displayDate: string;
  createdAt: string;
  personName: string;
  personId: string;
  aiInsightStatus?: EventInsightStatus | null;
  aiInsight?: EventInsightReport | null;
  autoImageStatus?: "pending" | "ready" | "failed" | null;
  autoImageAttribution?: AutoImageAttribution | null;
};

type EventDetailPanelProps = {
  event: DetailEvent;
  people: DetailPerson[];
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  uploading: boolean;
  confirmingDelete: boolean;
  message: string;
  onMessageClear?: () => void;
  selectedImageName: string;
  imagePreviewUrl: string | null;
  onDeleteCancel: () => void;
  onDeleteConfirm: () => void | Promise<void>;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onPersonChange: (value: string) => void;
  onImageChange: ChangeEventHandler<HTMLInputElement>;
  onRemoveImage: () => void;
  onRetryInsight: () => void;
  onSave: FormEventHandler<HTMLFormElement>;
  onCancelEdit: () => void;
};

const copy = {
  save: "保存修改",
  saving: "保存中...",
  cancel: "取消",
  upload: "添加照片或视频",
  uploading: "正在处理图片...",
  actionSheetTitle: "选择一种方式",
  capture: "拍照",
  pick: "从手机相册选择",
  remove: "移除当前照片",
  dismissSheet: "取消",
  titleLabel: "这个瞬间的标题",
  titlePlaceholder: "比如：春日晚风",
  momentLabel: "那个瞬间",
  reasonLabel: "此时感悟",
  momentPlaceholder: "发生了什么？",
  reasonPlaceholder: "为什么觉得美好？",
  recordFor: "记录给：",
  recordedBy: "由我记录",
  createdAt: "记录于",
  emptyReason: "这份感受还没写下，但这个瞬间已经很亮了。",
  deleteConfirmTitle: "确认永久删除这条记录",
  deleteConfirmBody: "永久删除后将无法恢复，确认要继续吗？",
  keepRecord: "先保留",
  confirmDelete: "确认删除",
  emptyImage: "暂时没有图片，但这个瞬间一样很亮。",
  replaceImage: "重新上传图片",
  replaceHint: "点击卡片即可替换现有图片",
  aiPanelTitle: "这条记录里的微光",
  aiPending: "请稍等，AI 正在整理这条记录里的微光...",
  aiRetry: "重新整理亮点",
  aiUnseenJoy: "你没意识到的小幸福",
  aiHighlight: "亮点",
  aiSignals: "线索标签",
  aiEmotion: "情绪线索",
  aiRelationship: "关系线索",
  aiValue: "价值观线索",
  imageBy: "图片来自",
  onUnsplash: "· Unsplash",
};

export function EventDetailPanel({
  event,
  people,
  editing,
  saving: _saving,
  deleting: _deleting,
  uploading,
  confirmingDelete: _confirmingDelete,
  message,
  onMessageClear,
  selectedImageName,
  imagePreviewUrl,
  onDeleteCancel: _onDeleteCancel,
  onDeleteConfirm: _onDeleteConfirm,
  onTitleChange,
  onContentChange,
  onReasonChange,
  onDateChange,
  onPersonChange,
  onImageChange,
  onRemoveImage,
  onRetryInsight,
  onSave,
  onCancelEdit: _onCancelEdit,
}: EventDetailPanelProps) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isPersonMenuOpen, setIsPersonMenuOpen] = useState(false);
  const [isMediaSheetOpen, setIsMediaSheetOpen] = useState(false);

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === event.personId) ?? people[0],
    [event.personId, people],
  );
  const headline = event.title?.trim() || fallbackMemoryTitle(event.content);
  const currentImageUrl = imagePreviewUrl ?? event.imageUrl;
  const normalizedCurrentImageUrl = currentImageUrl?.trim()
    ? currentImageUrl
    : null;
  const hasImage = Boolean(normalizedCurrentImageUrl);
  const shouldShowAutoPlaceholder =
    !editing &&
    !normalizedCurrentImageUrl &&
    (event.autoImageStatus === "pending" || event.autoImageStatus === "failed");
  const imageSrc =
    normalizedCurrentImageUrl ??
    (shouldShowAutoPlaceholder ? autoImagePlaceholderSrc : null);
  const imageAlt = shouldShowAutoPlaceholder ? event.content : headline || event.content;
  return (
    <div className="relative space-y-3.5 pb-7">
      <section className="joy-card overflow-hidden rounded-[1.25rem] p-3 sm:p-3.5">
        {!editing && imageSrc ? (
          <div className="relative overflow-hidden rounded-[1rem] bg-[linear-gradient(180deg,rgba(248,246,201,0.96),rgba(242,240,196,0.96))]">
            <div className="relative h-[10.75rem] overflow-hidden sm:h-[12rem]">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(14,14,4,0.08),transparent_35%,rgba(255,248,194,0.95)_100%)]" />
            </div>
          </div>
        ) : null}

        {editing ? (
          <form
            id="detail-editor-form"
            data-testid="detail-editor-form"
            onSubmit={onSave}
            className="mt-3.5 space-y-3.5"
          >
            <div
              data-testid="detail-editor-media"
            className="relative flex h-[10rem] w-full flex-col justify-end overflow-hidden rounded-[0.95rem] border border-[rgba(155,69,0,0.05)] bg-[linear-gradient(180deg,rgba(248,246,201,0.96),rgba(242,240,196,0.96))] sm:h-[11.25rem]"
            >
              {normalizedCurrentImageUrl ? (
                <>
                  <Image
                    src={normalizedCurrentImageUrl}
                    alt="Selected memory preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </>
              ) : (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
                  <span className="flex size-[3.3rem] items-center justify-center rounded-full bg-white/92 text-[var(--primary)] shadow-[0_10px_20px_-18px_rgba(29,29,3,0.2)]">
                    {uploading ? (
                      <LoaderCircle className="size-6 animate-spin" />
                    ) : (
                      <Camera className="size-6" />
                    )}
                  </span>
                  <span className="mt-2.5 text-[0.9rem] font-medium text-[var(--muted)]/90">
                    {uploading ? copy.uploading : copy.upload}
                  </span>
                  {selectedImageName ? (
                    <span className="mt-2 rounded-full bg-white/88 px-2.5 py-1 text-[0.7rem] font-semibold text-[var(--primary)]">
                      {selectedImageName}
                    </span>
                  ) : null}
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsMediaSheetOpen(true)}
                disabled={uploading}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center disabled:cursor-not-allowed"
              >
                {normalizedCurrentImageUrl ? (
                  <span className="rounded-full bg-white/88 px-3 py-1.5 text-[0.74rem] font-semibold text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.22)]">
                    {uploading ? copy.uploading : copy.replaceImage}
                  </span>
                ) : null}
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
                <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/88 px-2.5 py-1 text-[0.7rem] font-semibold text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.22)]">
                  {selectedImageName}
                </span>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                data-testid="detail-editor-person-trigger"
                onClick={() => setIsPersonMenuOpen((current) => !current)}
                className="joy-control-pill bg-[var(--surface-soft)] px-3 text-[var(--muted)] shadow-[0_10px_22px_-18px_rgba(29,29,3,0.16)]"
              >
                <span>
                  {copy.recordFor}
                  {selectedPerson?.name ?? ""}
                </span>
                <ChevronDown className="size-4" />
              </button>

              {isPersonMenuOpen ? (
                <div className="absolute left-0 top-full z-20 mt-2.5 w-72 rounded-[1rem] border border-[rgba(155,69,0,0.08)] bg-white/95 p-3 shadow-[0_14px_24px_-20px_rgba(29,29,3,0.24)] backdrop-blur">
                  <div className="space-y-2">
                    {people.map((person) => (
                      <button
                        key={person.id}
                        type="button"
                        onClick={() => {
                          onPersonChange(person.id);
                          setIsPersonMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-[1rem] px-3 py-2.5 text-left text-[0.9rem] font-semibold transition-colors ${
                          person.id === event.personId
                            ? "bg-[var(--primary-wash)] text-[var(--primary)]"
                            : "bg-[var(--surface-soft)] text-[var(--muted)]"
                        }`}
                      >
                        <span className="truncate">{person.name}</span>
                        {person.is_default ? (
                          <span className="text-[9px] uppercase tracking-[0.18em]">
                            Default
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div data-testid="detail-editor-date" className="inline-flex">
              <AppDatePicker
                value={event.displayDate}
                onChange={onDateChange}
                align="center"
                placement="bottom"
                centerPanelOnViewport
                buttonLabel=""
                buttonClassName="px-3 py-2 text-[0.76rem] font-medium shadow-none"
              />
            </div>

            <label className="joy-soft-panel block rounded-[1rem] px-3 py-3">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/58">
                {copy.titleLabel}
              </span>
              <input
                data-testid="detail-editor-title"
                value={event.title ?? ""}
                onChange={(nextEvent) => onTitleChange(nextEvent.target.value)}
                placeholder={copy.titlePlaceholder}
                className="w-full border-none bg-transparent p-0 text-[1.02rem] font-black leading-[1.3] tracking-[-0.04em] text-[var(--primary)] outline-none placeholder:text-[var(--muted)]/28"
              />
            </label>

            <label className="joy-soft-panel block rounded-[1rem] px-3 py-3">
              <span className="mb-2 block text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/58">
                {copy.momentLabel}
              </span>
              <AutoGrowTextarea
                value={event.content}
                onChange={(nextEvent) => onContentChange(nextEvent.target.value)}
                placeholder={copy.momentPlaceholder}
                className="min-h-20 w-full resize-none border-none bg-transparent p-0 text-[1.18rem] font-black leading-[1.36] tracking-[-0.04em] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]/28"
              />
            </label>

            <label className="joy-soft-panel block rounded-[1rem] px-3 py-3">
              <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--tertiary)]/70">
                <Lightbulb className="size-3.5" />
                {copy.reasonLabel}
              </span>
              <AutoGrowTextarea
                value={event.reason ?? ""}
                onChange={(nextEvent) => onReasonChange(nextEvent.target.value)}
                placeholder={copy.reasonPlaceholder}
                className="min-h-22 w-full resize-none border-none bg-transparent p-0 text-[0.84rem] leading-6 text-[var(--muted)] outline-none placeholder:text-[var(--muted)]/24"
              />
            </label>
          </form>
        ) : (
            <div className="space-y-4.5 px-1 pb-1 pt-3.5 sm:px-2">
              <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[var(--secondary-soft)] px-2.5 py-1.5 text-[0.72rem] font-bold text-[var(--secondary)]">
                {event.personName}
              </span>
              <span className="text-[0.78rem] font-semibold tracking-[0.05em] text-[var(--outline-strong)]">
                {event.displayDate}
              </span>
            </div>

            {headline ? (
              <h3 className="text-[1.5rem] font-black leading-[1.08] tracking-[-0.05em] text-[var(--primary)]">
                {headline}
              </h3>
            ) : null}

            <section>
              <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--primary)]/42">
                {copy.momentLabel}
              </p>
              <p className="text-[0.96rem] leading-[1.8] tracking-[-0.02em] text-[var(--foreground)]">
                {event.content}
              </p>
            </section>

            <section className="border-l-2 border-[rgba(255,140,66,0.24)] pl-4">
              <p className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-[var(--tertiary)]/56">
                {copy.reasonLabel}
              </p>
              <p className="text-[0.9rem] italic leading-[1.8] text-[var(--muted)]">
                {event.reason || copy.emptyReason}
              </p>
            </section>

            {event.imageUrl && event.autoImageAttribution ? (
              <p className="text-[0.74rem] leading-6 text-[var(--outline-strong)]">
                {copy.imageBy}{" "}
                <a
                  href={withUnsplashAttributionParams(
                    event.autoImageAttribution.photographerProfileUrl,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--primary)]"
                >
                  {event.autoImageAttribution.photographerName}
                </a>{" "}
                <a
                  href={withUnsplashAttributionParams(
                    event.autoImageAttribution.photoPageUrl,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[var(--primary)]"
                >
                  {copy.onUnsplash}
                </a>
              </p>
            ) : null}

            {event.aiInsightStatus === "ready" && event.aiInsight ? (
              <section
                data-testid="detail-ai-panel"
                className="space-y-3.5 rounded-[1rem] border border-[rgba(255,140,66,0.12)] bg-[rgba(255,250,234,0.9)] px-3.5 py-3.5"
              >
                <p className="text-[0.86rem] font-black tracking-[-0.03em] text-[var(--primary)]">
                  {copy.aiPanelTitle}
                </p>

                <div className="rounded-[1rem] bg-white/72 px-3.5 py-3">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[var(--secondary)]/70">
                    {copy.aiUnseenJoy}
                  </p>
                  <p className="mt-1 text-[0.96rem] font-black tracking-[-0.03em] text-[var(--primary)]">
                    {event.aiInsight.unseen_joy.title}
                  </p>
                  <p className="mt-1.5 text-[0.82rem] leading-6 text-[var(--foreground)]">
                    {event.aiInsight.unseen_joy.content}
                  </p>
                </div>

                <div className="rounded-[1rem] bg-white/82 px-3.5 py-3">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[var(--primary)]/58">
                    {copy.aiHighlight}
                  </p>
                  <p className="mt-1 text-[0.96rem] font-black tracking-[-0.03em] text-[var(--primary)]">
                    {event.aiInsight.highlight.title}
                  </p>
                  <p className="mt-1.5 text-[0.82rem] leading-6 text-[var(--foreground)]">
                    {event.aiInsight.highlight.content}
                  </p>
                </div>

                <div className="space-y-2.5 rounded-[1rem] bg-white/66 px-3.5 py-3">
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-[var(--outline-strong)]">
                    {copy.aiSignals}
                  </p>
                  {[
                    [copy.aiEmotion, event.aiInsight.emotion_signal],
                    [copy.aiRelationship, event.aiInsight.relationship_signal],
                    [copy.aiValue, event.aiInsight.value_signal],
                  ].map(([label, card]) => (
                    <div
                      key={label}
                      className="rounded-[0.95rem] border border-[rgba(155,69,0,0.06)] bg-white/72 px-3 py-2.5"
                    >
                      <p className="inline-flex rounded-full bg-[var(--primary-wash)] px-2 py-1 text-[0.64rem] font-extrabold uppercase tracking-[0.14em] text-[var(--primary)]">
                        {label}
                      </p>
                      <p className="mt-2 text-[0.84rem] font-bold text-[var(--foreground)]">
                        {card.title}
                      </p>
                      <p className="mt-1 text-[0.78rem] leading-6 text-[var(--muted)]">
                        {card.content}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {event.aiInsightStatus === "pending" ? (
              <div
                data-testid="detail-ai-pending"
                className="rounded-[1rem] bg-[rgba(255,248,194,0.68)] px-3.5 py-3 text-[0.8rem] font-medium text-[var(--muted)]"
              >
                {copy.aiPending}
              </div>
            ) : null}

            {event.aiInsightStatus === "failed" ? (
              <div className="rounded-[1rem] bg-[rgba(255,239,232,0.9)] px-3.5 py-3">
                <p className="text-[0.8rem] leading-6 text-[#b75b39]">
                  {copy.aiPending}
                </p>
                <button
                  type="button"
                  data-testid="detail-ai-retry"
                  onClick={onRetryInsight}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-[0.76rem] font-bold text-[var(--primary)]"
                >
                  <LoaderCircle className="size-3.5" />
                  {copy.aiRetry}
                </button>
              </div>
            ) : null}

            <div className="flex items-center gap-3 rounded-[1rem] bg-white/64 px-3 py-3">
              <div className="flex size-11 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)]">
                <Pencil className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.98rem] font-black tracking-[-0.03em] text-[var(--foreground)]">
                  {copy.recordedBy}
                </p>
                <p className="text-[0.78rem] leading-5.5 text-[var(--outline-strong)]">
                  {copy.createdAt} {formatDetailTimestamp(event.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}

      </section>

      <AppToast message={message} onClear={onMessageClear} />

      {editing && isMediaSheetOpen ? (
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
    </div>
  );
}

