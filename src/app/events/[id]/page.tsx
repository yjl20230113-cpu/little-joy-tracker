"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import {
  DetailTopBarActionButtons,
  DetailTopBarBackButton,
} from "@/components/DetailTopBarControls";
import { EventDetailPanel } from "@/components/EventDetailPanel";
import { TimelineView } from "@/components/TimelineView";
import {
  buildEventPayload,
  hasEventInsightUnseenJoy,
  normalizeAutoImageAttribution,
  normalizeEventInsightResult,
  type AutoImageStatus,
  type EventInsightReport,
  type EventInsightStatus,
  type PersonOption,
  type TimelineEntry,
} from "@/lib/app-logic";
import { uploadImageToStorage } from "@/lib/image-upload";
import { generateMemoryTitles } from "@/lib/memory-title-client";
import { supabase } from "@/lib/supabase";

type SupabaseErrorLike = {
  message?: string;
};

function isMissingSchemaColumnMessage(message: string, columnPattern: RegExp) {
  return (
    columnPattern.test(message) &&
    (/schema cache/i.test(message) ||
      (/column/i.test(message) && /does not exist|unknown field/i.test(message)))
  );
}

function isMissingAutoImageSchemaError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as SupabaseErrorLike).message ?? "").trim()
      : error instanceof Error
        ? error.message.trim()
        : "";

  return message
    ? isMissingSchemaColumnMessage(message, /auto_image_(status|payload)/i)
    : false;
}

type DetailEventRow = {
  id: string;
  title: string | null;
  content: string;
  reason: string | null;
  image_urls: string | null;
  display_date: string;
  created_at: string;
  person_id: string;
  ai_insight_status: EventInsightStatus | null;
  ai_insight_payload: unknown;
  auto_image_status: AutoImageStatus | null;
  auto_image_payload: unknown;
  persons:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null;
};

type EventTitleRow = {
  title?: string | null;
};

const detailEventSelect =
  "id, title, content, reason, image_urls, display_date, created_at, person_id, ai_insight_status, ai_insight_payload, auto_image_status, auto_image_payload, persons(id, name)";
const detailEventLegacySelect =
  "id, title, content, reason, image_urls, display_date, created_at, person_id, ai_insight_status, ai_insight_payload, persons(id, name)";

const copy = {
  loading: "正在打开这件小美好...",
  notFound: "没有找到这条记录，也许它已经被移走了。",
  unknownError: "操作失败，请稍后再试。",
  imageUploading: "正在把照片收进小美好...",
  imageReady: "照片已经更新好，可以继续整理这段回忆了。",
  uploadFailed: "图片上传失败，请检查 Storage bucket 是否已建好。",
  uploadPending: "图片还在路上，稍等一下再保存哦。",
  saveSuccess: "这件小美好已经更新好了。",
  insightFailed: "AI 暂时没有整理好这条记录，稍后再试一次。",
};

const imageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "joy-images";

function toHumanErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as SupabaseErrorLike).message;
    if (typeof message === "string" && message.trim()) {
      const normalized = message.trim();

      if (isMissingAutoImageSchemaError({ message: normalized })) {
        return "数据库还没有识别 events.auto_image_status / events.auto_image_payload 字段（或 API schema cache 未刷新）。当前会先按普通记录保存；如需 AI 配图，请执行 supabase-sql.md 里的 auto image 迁移并刷新 schema cache。";
      }

      return normalized;
    }
  }

  return fallback;
}

function parseImageUrls(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  } catch {
    return [];
  }
}

function parseEventInsightPayload(value: unknown) {
  if (!value) {
    return {
      report: null,
      needsRefresh: false,
    };
  }

  try {
    return {
      report: normalizeEventInsightResult(value),
      needsRefresh: !hasEventInsightUnseenJoy(value),
    };
  } catch {
    return {
      report: null,
      needsRefresh: true,
    };
  }
}

function getPersonName(
  person:
    | {
        id: string;
        name: string;
      }
    | Array<{
        id: string;
        name: string;
      }>
    | null,
) {
  if (Array.isArray(person)) {
    return person[0]?.name ?? "自己";
  }

  return person?.name ?? "自己";
}

function mapDetailEvent(event: DetailEventRow): TimelineEntry {
  const { report, needsRefresh } = parseEventInsightPayload(event.ai_insight_payload);

  return {
    id: event.id,
    title: event.title,
    content: event.content,
    reason: event.reason,
    imageUrl: parseImageUrls(event.image_urls)[0] ?? null,
    displayDate: event.display_date,
    createdAt: event.created_at,
    personId: event.person_id,
    personName: getPersonName(event.persons),
    aiInsightStatus: event.ai_insight_status,
    aiInsight: report,
    aiInsightNeedsRefresh: needsRefresh,
    autoImageStatus: event.auto_image_status,
    autoImageAttribution: normalizeAutoImageAttribution(event.auto_image_payload),
  };
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [userId, setUserId] = useState("");
  const [booting, setBooting] = useState(true);
  const [event, setEvent] = useState<TimelineEntry | null>(null);
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [personId, setPersonId] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const insightRetryRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    async function bootstrap() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user.id || !eventId) {
        setBooting(false);
        return;
      }

      setUserId(session.user.id);

      const [{ data: eventData, error: eventError }, { data: peopleData, error: peopleError }] =
        await Promise.all([
          supabase
            .from("events")
            .select(detailEventSelect)
            .eq("user_id", session.user.id)
            .eq("id", eventId)
            .single(),
          supabase
            .from("persons")
            .select("id, name, is_default")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: true }),
        ]);

      let nextEventData = eventData;
      let nextEventError = eventError;

      if (nextEventError && isMissingAutoImageSchemaError(nextEventError)) {
        const legacyResult = await supabase
          .from("events")
          .select(detailEventLegacySelect)
          .eq("user_id", session.user.id)
          .eq("id", eventId)
          .single();

        nextEventData = legacyResult.data;
        nextEventError = legacyResult.error;
      }

      if (nextEventError) {
        setMessage(toHumanErrorMessage(nextEventError, copy.unknownError));
        setBooting(false);
        return;
      }

      if (peopleError) {
        setMessage(toHumanErrorMessage(peopleError, copy.unknownError));
        setBooting(false);
        return;
      }

      const nextEvent = mapDetailEvent(nextEventData as DetailEventRow);
      setEvent(nextEvent);
      setPeople((peopleData ?? []) as PersonOption[]);
      setTitle((nextEvent.title ?? "").trim());
      setTitleTouched(false);
      setContent(nextEvent.content);
      setReason(nextEvent.reason ?? "");
      setDisplayDate(nextEvent.displayDate);
      setPersonId(nextEvent.personId);
      setImagePreviewUrl(nextEvent.imageUrl);
      setUploadedImageUrl(nextEvent.imageUrl);
      setBooting(false);
    }

    void bootstrap();
  }, [eventId]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (!userId || !event || editing) {
      return;
    }

    if (event.aiInsightStatus === "ready" && !event.aiInsightNeedsRefresh) {
      return;
    }

    if (insightRetryRef.current.has(event.id)) {
      return;
    }

    insightRetryRef.current.add(event.id);
    applyInsightToLocalState("pending", null);
    void backfillEventInsight({
      eventId: event.id,
      userId,
      content: event.content,
      reason: event.reason ?? "",
      displayDate: event.displayDate,
      personName:
        people.find((person) => person.id === event.personId)?.name ?? event.personName,
    }).then((report) => {
      if (!report) {
        setMessage(copy.insightFailed);
      }
    });
  }, [editing, event, people, userId]);

  async function handleImageChange(eventChange: ChangeEvent<HTMLInputElement>) {
    const file = eventChange.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setSelectedImageName(file.name);
    setUploadedImageUrl(null);
    setImagePreviewUrl(localPreviewUrl);
    setMessage(copy.imageUploading);
    setUploading(true);

    try {
      const { publicUrl } = await uploadImageToStorage({
        storage: supabase.storage,
        bucket: imageBucket,
        userId,
        file,
      });
      setUploadedImageUrl(publicUrl);
      setMessage(copy.imageReady);
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.uploadFailed));
    } finally {
      setUploading(false);
      eventChange.target.value = "";
    }
  }

  function restoreForm(nextEvent: TimelineEntry | null) {
    if (!nextEvent) {
      return;
    }

    setTitle((nextEvent.title ?? "").trim());
    setTitleTouched(false);
    setContent(nextEvent.content);
    setReason(nextEvent.reason ?? "");
    setDisplayDate(nextEvent.displayDate);
    setPersonId(nextEvent.personId);
    setImagePreviewUrl(nextEvent.imageUrl);
    setUploadedImageUrl(nextEvent.imageUrl);
    setSelectedImageName("");
  }

  function applyTitleToLocalState(nextTitle: string) {
    const titleValue = nextTitle.trim();
    if (!titleValue) {
      return;
    }

    setEvent((current) =>
      current ? { ...current, title: titleValue } : current,
    );

    if (!editing && !titleTouched) {
      setTitle(titleValue);
      setTitleTouched(false);
    }
  }

  async function backfillMemoryTitle(input: {
    eventId: string;
    userId: string;
    content: string;
    reason: string;
    displayDate: string;
  }) {
    try {
      const [generatedTitle] = await generateMemoryTitles([
        {
          content: input.content,
          reason: input.reason,
          time: input.displayDate,
        },
      ]);

      const titleValue = (generatedTitle ?? "").trim();
      if (!titleValue) {
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .update({ title: titleValue })
        .eq("id", input.eventId)
        .eq("user_id", input.userId)
        .or("title.is.null,title.eq.\"\"")
        .select("id, title")
        .maybeSingle();

      if (error) {
        throw error;
      }

      const updatedTitle =
        data && typeof data === "object" && "title" in data
          ? String((data as EventTitleRow).title ?? "")
          : "";

      if (!updatedTitle.trim()) {
        return;
      }

      applyTitleToLocalState(updatedTitle);
    } catch {
      // Fire-and-forget: title backfill should never block the primary save path.
    }
  }

  function applyInsightToLocalState(
    status: EventInsightStatus,
    report: EventInsightReport | null,
  ) {
    setEvent((current) =>
      current
        ? {
            ...current,
            aiInsightStatus: status,
            aiInsight: report,
            aiInsightNeedsRefresh: false,
          }
        : current,
    );
  }

  async function requestEventInsightReport(input: {
    content: string;
    reason: string;
    displayDate: string;
    personName: string;
  }) {
    const response = await fetch("/api/event-insight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof payload?.error === "string" ? payload.error : copy.insightFailed,
      );
    }

    return normalizeEventInsightResult(payload);
  }

  async function persistEventInsightState(input: {
    eventId: string;
    userId: string;
    status: EventInsightStatus;
    report: EventInsightReport | null;
  }) {
    const { error } = await supabase
      .from("events")
      .update({
        ai_insight_status: input.status,
        ai_insight_payload: input.report,
      })
      .eq("id", input.eventId)
      .eq("user_id", input.userId);

    if (error) {
      throw error;
    }
  }

  async function backfillEventInsight(input: {
    eventId: string;
    userId: string;
    content: string;
    reason: string;
    displayDate: string;
    personName: string;
  }) {
    try {
      const report = await requestEventInsightReport({
        content: input.content,
        reason: input.reason,
        displayDate: input.displayDate,
        personName: input.personName,
      });

      await persistEventInsightState({
        eventId: input.eventId,
        userId: input.userId,
        status: "ready",
        report,
      });
      applyInsightToLocalState("ready", report);
      return report;
    } catch {
      try {
        await persistEventInsightState({
          eventId: input.eventId,
          userId: input.userId,
          status: "failed",
          report: null,
        });
      } catch {
        // Keep the detail page usable even if the failure state is not persisted.
      }
      applyInsightToLocalState("failed", null);
      return null;
    }
  }

  function handleRemoveImage() {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImagePreviewUrl(null);
    setUploadedImageUrl(null);
    setSelectedImageName("");
    setMessage("");
  }

  async function handleSave(eventForm: FormEvent<HTMLFormElement>) {
    eventForm.preventDefault();

    if (!event || !userId || !personId) {
      return;
    }

    if (
      uploading ||
      (Boolean(selectedImageName) &&
        imagePreviewUrl?.startsWith("blob:") &&
        !uploadedImageUrl)
    ) {
      setMessage(copy.uploadPending);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const payload = buildEventPayload({
        userId,
        personId,
        content,
        reason,
        imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
        displayDate,
      });

      const detailNeedsInsightRefresh =
        event.content !== payload.content ||
        (event.reason ?? "") !== (payload.reason ?? "") ||
        event.displayDate !== payload.display_date ||
        event.personId !== payload.person_id;
      const detailImageChanged = uploadedImageUrl !== event.imageUrl;

      const updatePayload: Record<string, unknown> = {
        person_id: payload.person_id,
        content: payload.content,
        reason: payload.reason,
        image_urls: payload.image_urls,
        display_date: payload.display_date,
      };

      if (detailNeedsInsightRefresh) {
        updatePayload.ai_insight_status = "pending";
        updatePayload.ai_insight_payload = null;
      }

      if (detailImageChanged) {
        updatePayload.auto_image_status = null;
        updatePayload.auto_image_payload = null;
      }

      if (titleTouched) {
        const trimmedTitle = title.trim();
        updatePayload.title = trimmedTitle ? trimmedTitle : null;
      }

      let { data, error } = await supabase
        .from("events")
        .update(updatePayload)
        .eq("id", event.id)
        .eq("user_id", userId)
        .select(detailEventSelect)
        .single();

      if (error && isMissingAutoImageSchemaError(error)) {
        const legacyPayload = { ...updatePayload };
        delete legacyPayload.auto_image_status;
        delete legacyPayload.auto_image_payload;

        ({ data, error } = await supabase
          .from("events")
          .update(legacyPayload)
          .eq("id", event.id)
          .eq("user_id", userId)
          .select(detailEventLegacySelect)
          .single());
      }

      if (error) {
        throw error;
      }

      const nextEvent = mapDetailEvent(data as DetailEventRow);
      setEvent(nextEvent);
      restoreForm(nextEvent);
      setEditing(false);
      setConfirmingDelete(false);
      setMessage(copy.saveSuccess);

      if (detailNeedsInsightRefresh) {
        applyInsightToLocalState("pending", null);
        insightRetryRef.current.add(nextEvent.id);
        void backfillEventInsight({
          eventId: nextEvent.id,
          userId,
          content: payload.content,
          reason: payload.reason ?? "",
          displayDate: payload.display_date,
          personName:
            people.find((person) => person.id === payload.person_id)?.name ?? event.personName,
        });
      }

      if (!titleTouched && !(nextEvent.title ?? "").trim()) {
        void backfillMemoryTitle({
          eventId: nextEvent.id,
          userId,
          content: payload.content,
          reason: payload.reason ?? "",
          displayDate: payload.display_date,
        });
      }
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete() {
    if (!event || !userId) {
      return;
    }

    setDeleting(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      router.replace("/?tab=timeline");
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setDeleting(false);
    }
  }

  async function handleRetryInsight() {
    if (!event || !userId) {
      return;
    }

    setMessage("");
    insightRetryRef.current.add(event.id);
    applyInsightToLocalState("pending", null);
    try {
      await persistEventInsightState({
        eventId: event.id,
        userId,
        status: "pending",
        report: null,
      });
    } catch {
      // Do not block the retry flow on a pending-state write failure.
    }

    const report = await backfillEventInsight({
      eventId: event.id,
      userId,
      content,
      reason,
      displayDate,
      personName:
        people.find((person) => person.id === personId)?.name ?? event.personName,
    });

    if (!report) {
      setMessage(copy.insightFailed);
    }
  }

  const draftEvent = event
    ? {
        ...event,
        title: editing ? title : event.title,
        content,
        reason,
        displayDate,
        personId: personId || event.personId,
        personName:
          people.find((person) => person.id === personId)?.name ?? event.personName,
        imageUrl: editing ? imagePreviewUrl : event.imageUrl,
      }
    : null;

  if (booting) {
    return (
      <main className="joy-grid flex min-h-dvh items-center justify-center px-4 py-6 sm:min-h-screen sm:px-6">
        <div className="joy-card flex w-full max-w-sm items-center gap-3 rounded-[2rem] px-5 py-4 text-sm text-[var(--muted)]">
          <LoaderCircle className="size-4 animate-spin text-[var(--primary)]" />
          {copy.loading}
        </div>
      </main>
    );
  }

  return (
    <main className="joy-grid h-dvh overflow-hidden sm:px-6 sm:py-6">
      <div className="flex h-full w-full min-h-0 justify-center">
        <div className="flex h-full min-h-0 w-full sm:max-w-[38rem] sm:min-w-[20rem]">
          <TimelineView
            activeTab="timeline"
            groups={[]}
            peopleFilters={[]}
            selectedPersonId="all"
            selectedRange="week"
            customStartDate=""
            customEndDate=""
            message=""
            topBarTitle=""
            topBarLeftSlot={
              <DetailTopBarBackButton
                onBack={() => router.replace("/?tab=timeline")}
              />
            }
            topBarRightSlot={
              draftEvent ? (
                <DetailTopBarActionButtons
                  editing={editing}
                  saving={saving}
                  deleting={deleting}
                  onEditToggle={() => {
                    if (editing) {
                      restoreForm(event);
                    }

                    setEditing((current) => !current);
                    setMessage("");
                    setConfirmingDelete(false);
                  }}
                  onDeleteRequest={() => setConfirmingDelete(true)}
                />
              ) : undefined
            }
            detailContent={
              draftEvent ? (
                <EventDetailPanel
                  event={draftEvent}
                  people={people}
                  editing={editing}
                  saving={saving}
                  deleting={deleting}
                  uploading={uploading}
                  confirmingDelete={confirmingDelete}
                  message={message}
                  onMessageClear={() => setMessage("")}
                  selectedImageName={selectedImageName}
                  imagePreviewUrl={imagePreviewUrl}
                  onDeleteCancel={() => setConfirmingDelete(false)}
                  onDeleteConfirm={handleDelete}
                  onTitleChange={(value) => {
                    setTitle(value);
                    setTitleTouched(true);
                  }}
                  onContentChange={setContent}
                  onReasonChange={setReason}
                  onDateChange={setDisplayDate}
                  onPersonChange={setPersonId}
                  onImageChange={handleImageChange}
                  onRemoveImage={handleRemoveImage}
                  onRetryInsight={handleRetryInsight}
                  onSave={handleSave}
                  onCancelEdit={() => {
                    restoreForm(event);
                    setEditing(false);
                    setConfirmingDelete(false);
                    setMessage("");
                  }}
                />
              ) : (
                <div className="joy-card rounded-[2rem] px-6 py-10 text-center text-[var(--muted)]">
                  {message || copy.notFound}
                </div>
              )
            }
            onPersonChange={() => {}}
            onRangeChange={() => {}}
            onCustomStartDateChange={() => {}}
            onCustomEndDateChange={() => {}}
            onSummaryClick={() => {}}
            onTabChange={(tab) => router.push(`/?tab=${tab}`)}
            onEventOpen={() => {}}
          />
        </div>
      </div>
    </main>
  );
}
