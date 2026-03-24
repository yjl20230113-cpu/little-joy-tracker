"use client";

import { useEffect, useState } from "react";
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
  type PersonOption,
  type TimelineEntry,
} from "@/lib/app-logic";
import { generateMemoryTitles } from "@/lib/memory-title-client";
import { fallbackMemoryTitle } from "@/lib/memory-title";
import { supabase } from "@/lib/supabase";

type DetailEventRow = {
  id: string;
  title: string | null;
  content: string;
  reason: string | null;
  image_urls: string | null;
  display_date: string;
  created_at: string;
  person_id: string;
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

const copy = {
  loading: "正在打开这件小美好...",
  notFound: "没有找到这条记录，也许它已经被移走了。",
  backHome: "返回时间线",
  unknownError: "操作失败，请稍后再试。",
  imageUploading: "正在把照片收进小美好...",
  imageReady: "照片已更新好，可以继续整理这段回忆了。",
  uploadFailed: "图片上传失败，请检查 Storage bucket 是否已建好。",
  uploadPending: "图片还在路上，稍等一下再保存哦。",
  deleteSuccess: "这件小美好已经轻轻告别。",
  saveSuccess: "这件小美好已经更新好了。",
};

const imageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "joy-images";

function parseImageUrls(value: string | null) {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
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
  return {
    id: event.id,
    title: event.title?.trim() || fallbackMemoryTitle(event.content),
    content: event.content,
    reason: event.reason,
    imageUrl: parseImageUrls(event.image_urls)[0] ?? null,
    displayDate: event.display_date,
    createdAt: event.created_at,
    personId: event.person_id,
    personName: getPersonName(event.persons),
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
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [personId, setPersonId] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

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
            .select(
              "id, title, content, reason, image_urls, display_date, created_at, person_id, persons(id, name)",
            )
            .eq("user_id", session.user.id)
            .eq("id", eventId)
            .single(),
          supabase
            .from("persons")
            .select("id, name, is_default")
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: true }),
        ]);

      if (eventError) {
        setMessage(eventError.message);
        setBooting(false);
        return;
      }

      if (peopleError) {
        setMessage(peopleError.message);
        setBooting(false);
        return;
      }

      const nextEvent = mapDetailEvent(eventData as DetailEventRow);
      setEvent(nextEvent);
      setPeople((peopleData ?? []) as PersonOption[]);
      setContent(nextEvent.content);
      setReason(nextEvent.reason ?? "");
      setDisplayDate(nextEvent.displayDate);
      setPersonId(nextEvent.personId);
      setImagePreviewUrl(nextEvent.imageUrl);
      setUploadedImageUrl(nextEvent.imageUrl);
      setBooting(false);
    }

    bootstrap();
  }, [eventId]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  async function uploadImage(file: File) {
    setUploading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
    const filePath = `${userId}/${Date.now()}-${safeName}.${extension}`;

    const { error } = await supabase.storage
      .from(imageBucket)
      .upload(filePath, file, { upsert: false });

    if (error) {
      setUploading(false);
      throw new Error(copy.uploadFailed);
    }

    const { data } = supabase.storage.from(imageBucket).getPublicUrl(filePath);
    setUploading(false);
    return data.publicUrl;
  }

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

    try {
      const publicUrl = await uploadImage(file);
      URL.revokeObjectURL(localPreviewUrl);
      setUploadedImageUrl(publicUrl);
      setImagePreviewUrl(publicUrl);
      setMessage(copy.imageReady);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.uploadFailed);
    } finally {
      eventChange.target.value = "";
    }
  }

  function restoreForm(nextEvent: TimelineEntry | null) {
    if (!nextEvent) {
      return;
    }

    setContent(nextEvent.content);
    setReason(nextEvent.reason ?? "");
    setDisplayDate(nextEvent.displayDate);
    setPersonId(nextEvent.personId);
    setImagePreviewUrl(nextEvent.imageUrl);
    setUploadedImageUrl(nextEvent.imageUrl);
    setSelectedImageName("");
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

    if (uploading) {
      setMessage(copy.uploadPending);
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const [generatedTitle] = await generateMemoryTitles([
        {
          content,
          reason,
          time: displayDate,
        },
      ]);

      const payload = buildEventPayload({
        userId,
        personId,
        content,
        reason,
        imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
        displayDate,
      });

      const { data, error } = await supabase
        .from("events")
        .update({
          person_id: payload.person_id,
          title: generatedTitle || fallbackMemoryTitle(content),
          content: payload.content,
          reason: payload.reason,
          image_urls: payload.image_urls,
          display_date: payload.display_date,
        })
        .eq("id", event.id)
        .eq("user_id", userId)
        .select(
          "id, title, content, reason, image_urls, display_date, created_at, person_id, persons(id, name)",
        )
        .single();

      if (error) {
        throw error;
      }

      const nextEvent = mapDetailEvent(data as DetailEventRow);
      setEvent(nextEvent);
      restoreForm(nextEvent);
      setEditing(false);
      setConfirmingDelete(false);
      setMessage(copy.saveSuccess);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.unknownError);
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
      setMessage(error instanceof Error ? error.message : copy.unknownError);
    } finally {
      setDeleting(false);
    }
  }

  const draftEvent = event
    ? {
        ...event,
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
                  onContentChange={setContent}
                  onReasonChange={setReason}
                  onDateChange={setDisplayDate}
                  onPersonChange={setPersonId}
                  onImageChange={handleImageChange}
                  onRemoveImage={handleRemoveImage}
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
