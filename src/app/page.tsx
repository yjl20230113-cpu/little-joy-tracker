"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { LoaderCircle } from "lucide-react";
import {
  DetailTopBarActionButtons,
  DetailTopBarBackButton,
} from "@/components/DetailTopBarControls";
import {
  EventDetailPanel,
} from "@/components/EventDetailPanel";
import {
  QuickEntry,
  type HomeTab,
  type QuickEntryPerson,
} from "@/components/QuickEntry";
import { AuthScreen } from "@/components/AuthScreen";
import { ProfileView } from "@/components/ProfileView";
import { InsightView } from "@/components/InsightView";
import { TimelineView } from "@/components/TimelineView";
import {
  buildEventPayload,
  buildSummaryRequestEvents,
  createDefaultPersonPayload,
  filterTimelineItems,
  groupTimelineItemsByDate,
  getPostSignupWelcomeMessage,
  getRetryAfterSeconds,
  isRateLimitError,
  normalizePersonName,
  pickInitialPerson,
  serializeImageUrls,
  type SummaryReport,
  type TimelineEntry,
  type TimelineRange,
  validateCredentials,
} from "@/lib/app-logic";
import { generateMemoryTitles } from "@/lib/memory-title-client";
import { fallbackMemoryTitle } from "@/lib/memory-title";
import { supabase } from "@/lib/supabase";

type AuthMode = "sign-in" | "sign-up";

const copy = {
  heading: "\u90ae\u7bb1\u767b\u5f55\u540e\uff0c\u5c31\u80fd\u76f4\u63a5\u5f00\u8bb0\u3002",
  intro:
    "\u8fd9\u4e00\u7248\u5148\u7528 Supabase \u539f\u751f\u90ae\u7bb1\u5bc6\u7801\u767b\u5f55\uff0c\u786e\u4fdd\u8bb0\u5f55\u53ef\u4ee5\u7a33\u5b9a\u5199\u5165 events \u8868\u3002",
  signInTitle: "\u6b22\u8fce\u56de\u6765",
  signUpTitle: "\u521b\u5efa\u4f60\u7684\u5c0f\u7f8e\u597d\u8d26\u53f7",
  signInDescription:
    "\u8f93\u5165\u90ae\u7bb1\u548c\u5bc6\u7801\uff0c\u76f4\u63a5\u56de\u5230\u4f60\u7684\u901f\u8bb0\u9875\u9762\u3002",
  signUpDescription:
    "\u7b2c\u4e00\u6b21\u4f7f\u7528\u5c31\u5728\u8fd9\u91cc\u6ce8\u518c\uff0c\u6210\u529f\u540e\u4f1a\u76f4\u63a5\u8fdb\u5165\u5e94\u7528\u3002",
  emailLabel: "\u90ae\u7bb1\u5730\u5740",
  passwordLabel: "\u5bc6\u7801",
  emailPlaceholder: "you@example.com",
  passwordPlaceholder: "\u8bf7\u8f93\u5165\u5bc6\u7801",
  signIn: "\u767b\u5f55\u8fdb\u5165\u5c0f\u7f8e\u597d",
  signUp: "\u6ce8\u518c\u5e76\u8fdb\u5165\u5e94\u7528",
  processing: "\u5904\u7406\u4e2d...",
  switchToSignUp: "\u8fd8\u6ca1\u6709\u8d26\u53f7\uff1f\u53bb\u6ce8\u518c",
  switchToSignIn: "\u5df2\u6709\u8d26\u53f7\uff1f\u53bb\u767b\u5f55",
  retryWaitPrefix: "\u8bf7\u5728 ",
  retryWaitSuffix: " \u79d2\u540e\u91cd\u8bd5",
  rateLimitFriendly: "\u64cd\u4f5c\u592a\u9891\u7e41\u5566\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u54e6~",
  loading: "\u6b63\u5728\u8fde\u63a5 Supabase...",
  registerHint:
    "\u5982\u679c\u4f60\u8fd8\u6ca1\u6709 Supabase \u8d26\u53f7\uff0c\u53ef\u4ee5\u5148\u7528\u540c\u4e00\u5957\u90ae\u7bb1\u5bc6\u7801\u76f4\u63a5\u6ce8\u518c\u3002",
  autoPersonMessage:
    "\u9996\u6b21\u767b\u5f55\u4f1a\u81ea\u52a8\u51c6\u5907\u9ed8\u8ba4\u8bb0\u5f55\u5bf9\u8c61\u201c\u81ea\u5df1\u201d\u3002",
  saved: "\u5df2\u4fdd\u5b58\u5230 events \u8868\uff0c\u56fe\u7247\u4e5f\u5df2\u5199\u5165 image_urls\u3002",
  emptyPeople: "\u6b63\u5728\u51c6\u5907\u8bb0\u5f55\u5bf9\u8c61\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  confirmEmail:
    "\u6ce8\u518c\u6210\u529f\uff0c\u5982\u679c\u4f60\u5728 Supabase \u5f00\u4e86\u90ae\u7bb1\u786e\u8ba4\uff0c\u8bf7\u5148\u53bb\u90ae\u7bb1\u5b8c\u6210\u9a8c\u8bc1\u3002",
  signInSuccess: "\u767b\u5f55\u6210\u529f\uff0c\u53ef\u4ee5\u5f00\u59cb\u8bb0\u5f55\u4e86\u3002",
  signOutSuccess: "\u5df2\u9000\u51fa\u5f53\u524d\u8d26\u53f7\u3002",
  personCreated: "\u5df2\u65b0\u5efa\u4eba\u5458\uff1a",
  personDeleted: "\u5df2\u5220\u9664\u4eba\u5458\uff1a",
  personDeletedWithRecords:
    "\u5df2\u5220\u9664\u4eba\u5458\u53ca\u5176\u540d\u4e0b\u8bb0\u5f55\uff1a",
  duplicatePerson: "\u8fd9\u4e2a\u4eba\u5458\u540d\u79f0\u5df2\u5b58\u5728\uff0c\u8bf7\u6362\u4e00\u4e2a\u3002",
  defaultPersonProtected:
    "\u9ed8\u8ba4\u4eba\u5458\u201c\u81ea\u5df1\u201d\u4e0d\u652f\u6301\u5220\u9664\u3002",
  uploadFailed: "\u56fe\u7247\u4e0a\u4f20\u5931\u8d25\uff0c\u8bf7\u68c0\u67e5 Storage bucket \u662f\u5426\u5df2\u5efa\u597d\u3002",
  unknownError: "\u64cd\u4f5c\u5931\u8d25\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5\u3002",
  imageReady: "\u7167\u7247\u5df2\u4e0a\u4f20\u597d\uff0c\u53ef\u4ee5\u7ee7\u7eed\u5199\u4e0b\u90a3\u4e2a\u77ac\u95f4\u4e86\u3002",
  imageUploading: "\u6b63\u5728\u628a\u7167\u7247\u6536\u8fdb\u5c0f\u7f8e\u597d...",
  uploadPending: "\u7167\u7247\u8fd8\u5728\u8def\u4e0a\uff0c\u7a0d\u7b49\u4e00\u4e0b\u518d\u4fdd\u5b58\u54e6\u3002",
  saveSuccess: "\u8fd9\u4ef6\u5c0f\u7f8e\u597d\u5df2\u88ab\u73cd\u85cf \u2728",
  insightEmpty: "\u5148\u53bb\u8bb0\u5f55\u4e00\u4e9b\u5c0f\u7f8e\u597d\u518d\u6765\u5427",
  insightShare: "\u529f\u80fd\u6b63\u5728\u5f00\u53d1\u4e2d\uff0c\u5148\u622a\u56fe\u5206\u4eab\u7ed9\u5fc3\u7231\u7684\u4eba\u5427~",
};

const imageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "joy-images";
const todayString = new Date().toISOString().slice(0, 10);
const pendingWelcomeKey = "little-joy-tracker:pending-welcome";

type EventRow = {
  id: string;
  title: string | null;
  content: string;
  reason: string | null;
  image_urls: string | null;
  display_date: string;
  created_at: string;
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
    return person[0]?.name ?? "\u81ea\u5df1";
  }

  return person?.name ?? "\u81ea\u5df1";
}

function getPersonId(
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
    return person[0]?.id ?? "";
  }

  return person?.id ?? "";
}

async function fetchTimelineItems(userId: string) {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, content, reason, image_urls, display_date, created_at, persons(id, name)",
    )
    .eq("user_id", userId)
    .order("display_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as EventRow[]).map((event) => ({
    id: event.id,
    title: event.title?.trim() || fallbackMemoryTitle(event.content),
    content: event.content,
    reason: event.reason,
    imageUrl: parseImageUrls(event.image_urls)[0] ?? null,
    displayDate: event.display_date,
    personName: getPersonName(event.persons),
    createdAt: event.created_at,
    personId: getPersonId(event.persons),
  }));
}

async function fetchTimelineItemDetail(userId: string, eventId: string) {
  const { data, error } = await supabase
    .from("events")
    .select(
      "id, title, content, reason, image_urls, display_date, created_at, person_id, persons(id, name)",
    )
    .eq("user_id", userId)
    .eq("id", eventId)
    .single();

  if (error) {
    throw error;
  }

  const event = data as DetailEventRow;

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

export default function HomePage() {
  const router = useRouter();
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);
  const [activeTab, setActiveTab] = useState<HomeTab>("quick-entry");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(copy.autoPersonMessage);
  const [people, setPeople] = useState<QuickEntryPerson[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [displayDate, setDisplayDate] = useState(todayString);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineEntry[]>([]);
  const [timelinePersonId, setTimelinePersonId] = useState("all");
  const [timelineRange, setTimelineRange] = useState<TimelineRange>("week");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState(todayString);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightMessage, setInsightMessage] = useState("");
  const [summaryReport, setSummaryReport] = useState<SummaryReport | null>(null);
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState("");
  const [timelineDetail, setTimelineDetail] = useState<TimelineEntry | null>(null);
  const [detailEditing, setDetailEditing] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailDeleting, setDetailDeleting] = useState(false);
  const [detailUploading, setDetailUploading] = useState(false);
  const [detailConfirmingDelete, setDetailConfirmingDelete] = useState(false);
  const [detailMessage, setDetailMessage] = useState("");
  const [detailContent, setDetailContent] = useState("");
  const [detailReason, setDetailReason] = useState("");
  const [detailDisplayDate, setDetailDisplayDate] = useState(todayString);
  const [detailPersonId, setDetailPersonId] = useState("");
  const [detailImagePreviewUrl, setDetailImagePreviewUrl] = useState<string | null>(null);
  const [detailSelectedImageName, setDetailSelectedImageName] = useState("");
  const [detailUploadedImageUrl, setDetailUploadedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function syncFromLocation() {
      const searchParams = new URLSearchParams(window.location.search);
      const requestedTab = searchParams.get("tab");
      const requestedEventId = searchParams.get("event") ?? "";

      if (
        requestedTab === "timeline" ||
        requestedTab === "quick-entry" ||
        requestedTab === "insight" ||
        requestedTab === "profile"
      ) {
        setActiveTab(requestedTab);
      }

      setSelectedTimelineEventId(requestedEventId);
    }

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!mounted) {
        return;
      }

      setSession(initialSession);
      if (initialSession) {
        setAuthMessage(copy.signInSuccess);
      }
      setBooting(false);
    }

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setAuthLoading(false);

      if (event === "SIGNED_IN") {
        setAuthMessage(copy.signInSuccess);
      }

      if (event === "SIGNED_OUT") {
        setAuthMessage(copy.signOutSuccess);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function syncPeople() {
      if (!session?.user.id) {
        return;
      }

      const { data, error } = await supabase
        .from("persons")
        .select("id, name, is_default")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      if (error) {
        setMessage(error.message);
        return;
      }

      let nextPeople = (data ?? []) as QuickEntryPerson[];

      if (nextPeople.length === 0) {
        const { data: inserted, error: insertError } = await supabase
          .from("persons")
          .insert(createDefaultPersonPayload(session.user.id))
          .select("id, name, is_default")
          .single();

        if (insertError) {
          setMessage(insertError.message);
          return;
        }

        nextPeople = inserted ? [inserted as QuickEntryPerson] : [];

        if (typeof window !== "undefined") {
          const shouldShowWelcome =
            window.sessionStorage.getItem(pendingWelcomeKey) === "true";

          if (shouldShowWelcome) {
            setMessage(getPostSignupWelcomeMessage());
            window.sessionStorage.removeItem(pendingWelcomeKey);
          }
        }
      }

      setPeople(nextPeople);
      setSelectedPersonId(
        pickInitialPerson(nextPeople)?.id ?? nextPeople[0]?.id ?? "",
      );
    }

    syncPeople();
  }, [session?.user.id]);

  useEffect(() => {
    async function syncEvents() {
      if (!session?.user.id) {
        setTimelineItems([]);
        return;
      }

      try {
        setTimelineItems(await fetchTimelineItems(session.user.id));
      } catch (error) {
        setMessage(error instanceof Error ? error.message : copy.unknownError);
      }
    }

    syncEvents();
  }, [session?.user.id]);

  useEffect(() => {
    async function syncTimelineDetail() {
      if (!session?.user.id || !selectedTimelineEventId) {
        setTimelineDetail(null);
        setDetailEditing(false);
        setDetailMessage("");
        return;
      }

      try {
        const nextDetail = await fetchTimelineItemDetail(
          session.user.id,
          selectedTimelineEventId,
        );

        setTimelineDetail(nextDetail);
        restoreDetailForm(nextDetail);
        setDetailMessage("");
      } catch (error) {
        setTimelineDetail(null);
        setDetailMessage(error instanceof Error ? error.message : copy.unknownError);
      }
    }

    syncTimelineDetail();
  }, [selectedTimelineEventId, session?.user.id]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  useEffect(() => {
    return () => {
      if (detailImagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(detailImagePreviewUrl);
      }
    };
  }, [detailImagePreviewUrl]);

  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRetryAfterSeconds((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [retryAfterSeconds]);

  useEffect(() => {
    setSummaryReport(null);
    setInsightMessage("");
  }, [timelinePersonId, timelineRange, customStartDate, customEndDate]);

  function syncHomeLocation(tab: HomeTab, eventId = "", replace = false) {
    if (typeof window === "undefined") {
      return;
    }

    const searchParams = new URLSearchParams();
    searchParams.set("tab", tab);

    if (eventId) {
      searchParams.set("event", eventId);
    }

    const nextUrl = `/?${searchParams.toString()}`;

    if (replace) {
      window.history.replaceState({}, "", nextUrl);
      return;
    }

    window.history.pushState({}, "", nextUrl);
  }

  function restoreDetailForm(nextDetail: TimelineEntry | null) {
    if (!nextDetail) {
      return;
    }

    setDetailContent(nextDetail.content);
    setDetailReason(nextDetail.reason ?? "");
    setDetailDisplayDate(nextDetail.displayDate);
    setDetailPersonId(nextDetail.personId);
    setDetailImagePreviewUrl(nextDetail.imageUrl);
    setDetailUploadedImageUrl(nextDetail.imageUrl);
    setDetailSelectedImageName("");
  }

  function validateAuth() {
    const nextErrors = validateCredentials(email, password);
    setErrors(nextErrors);
    if (retryAfterSeconds === 0) {
      setAuthMessage("");
    }
    return Object.keys(nextErrors).length === 0;
  }

  function formatAuthErrorMessage(message: string) {
    const cooldown = getRetryAfterSeconds(message);

    if (isRateLimitError(message)) {
      if (cooldown) {
        setRetryAfterSeconds(cooldown);
        return `${copy.rateLimitFriendly} ${copy.retryWaitPrefix}${cooldown}${copy.retryWaitSuffix}`;
      }

      return copy.rateLimitFriendly;
    }

    return message;
  }

  async function handleAuthSubmit() {
    if (retryAfterSeconds > 0) {
      setAuthMessage(
        `${copy.retryWaitPrefix}${retryAfterSeconds}${copy.retryWaitSuffix}`,
      );
      return;
    }

    if (!validateAuth()) {
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");

    if (authMode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthMessage(formatAuthErrorMessage(error.message));
        setAuthLoading(false);
      }

      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setAuthMessage(formatAuthErrorMessage(error.message));
      setAuthLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(pendingWelcomeKey, "true");
    }

    if (data.session) {
      setAuthMessage("\u6ce8\u518c\u6210\u529f\uff0c\u6b63\u5728\u8fdb\u5165\u5e94\u7528...");
      router.refresh();
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setAuthMessage(formatAuthErrorMessage(signInError.message));
      setAuthLoading(false);
      return;
    }

    setAuthMessage("\u6ce8\u518c\u6210\u529f\uff0c\u6b63\u5728\u8fdb\u5165\u5e94\u7528...");
    router.refresh();
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!session?.user.id) {
      setMessage(copy.unknownError);
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
      const publicUrl = await uploadImage(session.user.id, file, setUploading);
      URL.revokeObjectURL(localPreviewUrl);
      setUploadedImageUrl(publicUrl);
      setImagePreviewUrl(publicUrl);
      setMessage(copy.imageReady);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.uploadFailed);
    } finally {
      event.target.value = "";
    }
  }

  async function handleDetailImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!session?.user.id) {
      setDetailMessage(copy.unknownError);
      return;
    }

    if (detailImagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(detailImagePreviewUrl);
    }

    const localPreviewUrl = URL.createObjectURL(file);
    setDetailSelectedImageName(file.name);
    setDetailUploadedImageUrl(null);
    setDetailImagePreviewUrl(localPreviewUrl);
    setDetailMessage(copy.imageUploading);

    try {
      const publicUrl = await uploadImage(session.user.id, file, setDetailUploading);
      URL.revokeObjectURL(localPreviewUrl);
      setDetailUploadedImageUrl(publicUrl);
      setDetailImagePreviewUrl(publicUrl);
      setDetailMessage(copy.imageReady);
    } catch (error) {
      setDetailMessage(error instanceof Error ? error.message : copy.uploadFailed);
    } finally {
      event.target.value = "";
    }
  }

  function handleDetailRemoveImage() {
    if (detailImagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(detailImagePreviewUrl);
    }

    setDetailImagePreviewUrl(null);
    setDetailUploadedImageUrl(null);
    setDetailSelectedImageName("");
    setDetailMessage("");
  }

  async function uploadImage(
    userId: string,
    file: File,
    setLoading: (value: boolean) => void,
  ) {
    setLoading(true);

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "-");
    const filePath = `${userId}/${Date.now()}-${safeName}.${extension}`;

    const { error } = await supabase.storage
      .from(imageBucket)
      .upload(filePath, file, { upsert: false });

    if (error) {
      setLoading(false);
      throw new Error(copy.uploadFailed);
    }

    const { data } = supabase.storage.from(imageBucket).getPublicUrl(filePath);
    setLoading(false);
    return data.publicUrl;
  }

  async function handleCreatePerson(name: string) {
    if (!session?.user.id) {
      setMessage(copy.emptyPeople);
      return false;
    }

    const normalizedName = normalizePersonName(name);
    const hasDuplicate = people.some(
      (person) => normalizePersonName(person.name) === normalizedName,
    );

    if (hasDuplicate) {
      setMessage(copy.duplicatePerson);
      return false;
    }

    const { data, error } = await supabase
      .from("persons")
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        is_default: false,
      })
      .select("id, name, is_default")
      .single();

    if (error || !data) {
      setMessage(error?.message ?? copy.unknownError);
      return false;
    }

    const nextPerson = data as QuickEntryPerson;
    setPeople((current) => [...current, nextPerson]);
    setSelectedPersonId(nextPerson.id);
    setMessage(`${copy.personCreated}${nextPerson.name}`);
    return true;
  }

  async function handleDeletePerson(personId: string, forceDelete = false) {
    if (!session?.user.id) {
      setMessage(copy.emptyPeople);
      return { ok: false };
    }

    const personToDelete = people.find((person) => person.id === personId);

    if (!personToDelete) {
      return { ok: false };
    }

    if (personToDelete.is_default) {
      setMessage(copy.defaultPersonProtected);
      return { ok: false };
    }

    const { count, error: countError } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id)
      .eq("person_id", personId);

    if (countError) {
      setMessage(countError.message);
      return { ok: false };
    }

    const recordCount = count ?? 0;

    if (recordCount > 0 && !forceDelete) {
      return {
        ok: false,
        requiresConfirmation: true,
        recordCount,
        personName: personToDelete.name,
      };
    }

    const { error } = await supabase
      .from("persons")
      .delete()
      .eq("id", personId)
      .eq("user_id", session.user.id);

    if (error) {
      setMessage(error.message);
      return { ok: false };
    }

    const nextPeople = people.filter((person) => person.id !== personId);
    const fallbackPerson = pickInitialPerson(nextPeople);
    setPeople(nextPeople);
    setSelectedPersonId((current) =>
      current === personId ? fallbackPerson?.id ?? "" : current,
    );
    setTimelinePersonId((current) =>
      current === personId ? "all" : current,
    );
    try {
      setTimelineItems(await fetchTimelineItems(session.user.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.unknownError);
    }
    setMessage(
      `${
        recordCount > 0 ? copy.personDeletedWithRecords : copy.personDeleted
      }${personToDelete.name}`,
    );
    return { ok: true };
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user.id || !selectedPersonId) {
      setMessage(copy.emptyPeople);
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
        userId: session.user.id,
        personId: selectedPersonId,
        content,
        reason,
        imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
        displayDate,
      });

      const { error } = await supabase
        .from("events")
        .insert({ ...payload, title: generatedTitle || fallbackMemoryTitle(content) });

      if (error) {
        throw error;
      }

      handleCancel();
      setMessage(copy.saveSuccess);
      setActiveTab("timeline");
      syncHomeLocation("timeline", "", true);

      setTimelineItems(await fetchTimelineItems(session.user.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : copy.unknownError);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDetailSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session?.user.id || !timelineDetail || !detailPersonId) {
      setDetailMessage(copy.emptyPeople);
      return;
    }

    if (detailUploading) {
      setDetailMessage(copy.uploadPending);
      return;
    }

    setDetailSaving(true);
    setDetailMessage("");

    try {
      const [generatedTitle] = await generateMemoryTitles([
        {
          content: detailContent,
          reason: detailReason,
          time: detailDisplayDate,
        },
      ]);

      const payload = buildEventPayload({
        userId: session.user.id,
        personId: detailPersonId,
        content: detailContent,
        reason: detailReason,
        imageUrls: detailUploadedImageUrl ? [detailUploadedImageUrl] : [],
        displayDate: detailDisplayDate,
      });

      const { data, error } = await supabase
        .from("events")
        .update({
          person_id: payload.person_id,
          title: generatedTitle || fallbackMemoryTitle(detailContent),
          content: payload.content,
          reason: payload.reason,
          image_urls: payload.image_urls ?? serializeImageUrls([]),
          display_date: payload.display_date,
        })
        .eq("id", timelineDetail.id)
        .eq("user_id", session.user.id)
        .select(
          "id, title, content, reason, image_urls, display_date, created_at, person_id, persons(id, name)",
        )
        .single();

      if (error) {
        throw error;
      }

      const nextDetailRow = data as DetailEventRow;
      const nextDetail = {
        id: nextDetailRow.id,
        title: nextDetailRow.title?.trim() || fallbackMemoryTitle(nextDetailRow.content),
        content: nextDetailRow.content,
        reason: nextDetailRow.reason,
        imageUrl: parseImageUrls(nextDetailRow.image_urls)[0] ?? null,
        displayDate: nextDetailRow.display_date,
        createdAt: nextDetailRow.created_at,
        personId: nextDetailRow.person_id,
        personName: getPersonName(nextDetailRow.persons),
      };

      setTimelineDetail(nextDetail);
      restoreDetailForm(nextDetail);
      setTimelineItems(await fetchTimelineItems(session.user.id));
      setDetailEditing(false);
      setDetailConfirmingDelete(false);
      setDetailMessage(copy.saveSuccess);
    } catch (error) {
      setDetailMessage(error instanceof Error ? error.message : copy.unknownError);
    } finally {
      setDetailSaving(false);
      setDetailUploading(false);
    }
  }

  async function handleDetailDelete() {
    if (!session?.user.id || !timelineDetail) {
      return;
    }

    setDetailDeleting(true);
    setDetailMessage("");

    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", timelineDetail.id)
        .eq("user_id", session.user.id);

      if (error) {
        throw error;
      }

      setTimelineItems(await fetchTimelineItems(session.user.id));
      setMessage("这件小美好已从时间线中轻轻放下。");
      handleCloseTimelineDetail();
    } catch (error) {
      setDetailMessage(error instanceof Error ? error.message : copy.unknownError);
    } finally {
      setDetailDeleting(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPeople([]);
    setSelectedPersonId("");
    handleCancel();
  }

  function handleCancel() {
    if (imagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setContent("");
    setReason("");
    setDisplayDate(todayString);
    setUploadedImageUrl(null);
    setImagePreviewUrl(null);
    setSelectedImageName("");
  }

  function handleTimelineTabChange(nextTab: HomeTab) {
    setActiveTab(nextTab);

    if (nextTab !== "timeline") {
      setSelectedTimelineEventId("");
      setTimelineDetail(null);
      setDetailEditing(false);
      setDetailMessage("");
      setDetailImagePreviewUrl(null);
      setDetailConfirmingDelete(false);
      syncHomeLocation(nextTab, "", true);
      return;
    }

    syncHomeLocation("timeline", selectedTimelineEventId, true);
  }

  function handleOpenTimelineDetail(eventId: string) {
    setActiveTab("timeline");
    setSelectedTimelineEventId(eventId);
    setDetailEditing(false);
    setDetailMessage("");
    syncHomeLocation("timeline", eventId);
  }

  function handleCloseTimelineDetail() {
    setSelectedTimelineEventId("");
    setTimelineDetail(null);
    setDetailEditing(false);
    setDetailMessage("");
    setDetailImagePreviewUrl(null);
    setDetailSelectedImageName("");
    setDetailUploadedImageUrl(null);
    setDetailConfirmingDelete(false);
    syncHomeLocation("timeline", "", true);
  }

  function handleDetailEditToggle() {
    if (detailEditing) {
      restoreDetailForm(timelineDetail);
      setDetailMessage("");
      setDetailEditing(false);
      setDetailConfirmingDelete(false);
      return;
    }

    setDetailEditing(true);
    setDetailMessage("");
    setDetailConfirmingDelete(false);
  }

  function handleDetailCancelEdit() {
    restoreDetailForm(timelineDetail);
    setDetailMessage("");
    setDetailEditing(false);
    setDetailConfirmingDelete(false);
  }

  function handleTimelineRangeChange(nextRange: TimelineRange) {
    setTimelineRange(nextRange);
  }

  function handleOpenInsightSummary() {
    handleTimelineTabChange("insight");
    void handleGenerateSummary();
  }

  async function handleGenerateSummary() {
    if (filteredTimelineItems.length === 0) {
      setInsightMessage(copy.insightEmpty);
      return;
    }

    setInsightLoading(true);
    setInsightMessage("");

    try {
      const response = await fetch("/api/summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          events: buildSummaryRequestEvents(filteredTimelineItems),
        }),
      });

      const data = (await response.json()) as SummaryReport | { error?: string };

      if (!response.ok || "error" in data) {
        throw new Error(
          "error" in data && data.error ? data.error : copy.unknownError,
        );
      }

      setSummaryReport(data as SummaryReport);
    } catch (error) {
      setInsightMessage(error instanceof Error ? error.message : copy.unknownError);
    } finally {
      setInsightLoading(false);
    }
  }

  function handleShareSummary() {
    setInsightMessage(copy.insightShare);
  }

  const filteredTimelineItems = filterTimelineItems(timelineItems, {
    personId: timelinePersonId,
    range: timelineRange,
    customStartDate,
    customEndDate,
    today: todayString,
  });
  const timelineGroups = groupTimelineItemsByDate(filteredTimelineItems);
  const timelinePeopleFilters = [
    { id: "all", label: "\u5168\u90e8" },
    ...people.map((person) => ({ id: person.id, label: person.name })),
  ];
  const timelineDetailDraft = timelineDetail
    ? {
        ...timelineDetail,
        title:
          timelineItems.find((item) => item.id === timelineDetail.id)?.title ??
          timelineDetail.title ??
          fallbackMemoryTitle(timelineDetail.content),
        content: detailContent,
        reason: detailReason,
        displayDate: detailDisplayDate,
        personId: detailPersonId || timelineDetail.personId,
        personName:
          people.find((person) => person.id === detailPersonId)?.name ??
          timelineDetail.personName,
        imageUrl: detailEditing ? detailImagePreviewUrl : timelineDetail.imageUrl,
      }
    : null;

  if (booting) {
    return (
      <main className="joy-grid flex min-h-screen items-center justify-center px-4 py-6 sm:px-6">
        <div className="joy-card flex w-full max-w-sm items-center gap-3 rounded-[2rem] px-5 py-4 text-sm text-[var(--muted)]">
          <LoaderCircle className="size-4 animate-spin text-[var(--primary)]" />
          {copy.loading}
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <AuthScreen
        authMode={authMode}
        email={email}
        password={password}
        errors={errors}
        authMessage={authMessage}
        authLoading={authLoading}
        retryAfterSeconds={retryAfterSeconds}
        copy={{
          signInTitle: copy.signInTitle,
          signUpTitle: copy.signUpTitle,
          signInDescription: copy.signInDescription,
          signUpDescription: copy.signUpDescription,
          emailLabel: copy.emailLabel,
          passwordLabel: copy.passwordLabel,
          emailPlaceholder: copy.emailPlaceholder,
          passwordPlaceholder: copy.passwordPlaceholder,
          signIn: copy.signIn,
          signUp: copy.signUp,
          processing: copy.processing,
          switchToSignUp: copy.switchToSignUp,
          switchToSignIn: copy.switchToSignIn,
        }}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => {
          setAuthMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          setAuthMessage("");
          setErrors({});
        }}
      />
    );
  }

  return (
    <main className="joy-grid h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto flex h-full w-full min-h-0 justify-center">
        <div className="flex h-full min-h-0 w-full max-w-[38rem] min-w-[20rem]">
          {activeTab === "quick-entry" ? (
            <QuickEntry
              people={people}
              selectedPersonId={selectedPersonId}
              content={content}
              reason={reason}
              displayDate={displayDate}
              saving={saving}
              uploading={uploading}
              message={message}
              selectedImageName={selectedImageName}
              imagePreviewUrl={imagePreviewUrl}
              activeTab={activeTab}
              onPersonChange={setSelectedPersonId}
              onTabChange={handleTimelineTabChange}
              onCreatePerson={handleCreatePerson}
              onDeletePerson={handleDeletePerson}
              onContentChange={setContent}
              onReasonChange={setReason}
              onDateChange={setDisplayDate}
              onImageChange={handleImageChange}
              onRemoveImage={() => {
                if (imagePreviewUrl?.startsWith("blob:")) {
                  URL.revokeObjectURL(imagePreviewUrl);
                }

                setUploadedImageUrl(null);
                setImagePreviewUrl(null);
                setSelectedImageName("");
              }}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : activeTab === "timeline" ? (
            <TimelineView
              activeTab={activeTab}
              groups={timelineGroups}
              peopleFilters={timelinePeopleFilters}
              selectedPersonId={timelinePersonId}
              selectedRange={timelineRange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              message={message}
              topBarTitle={timelineDetailDraft ? "" : undefined}
              topBarLeftSlot={
                timelineDetailDraft ? (
                  <DetailTopBarBackButton onBack={handleCloseTimelineDetail} />
                ) : undefined
              }
              topBarRightSlot={
                timelineDetailDraft ? (
                  <DetailTopBarActionButtons
                    editing={detailEditing}
                    saving={detailSaving}
                    deleting={detailDeleting}
                    onEditToggle={handleDetailEditToggle}
                    onDeleteRequest={() => setDetailConfirmingDelete(true)}
                  />
                ) : undefined
              }
              detailContent={
                timelineDetailDraft ? (
                  <EventDetailPanel
                    event={timelineDetailDraft}
                    people={people}
                    editing={detailEditing}
                    saving={detailSaving}
                    deleting={detailDeleting}
                    uploading={detailUploading}
                    confirmingDelete={detailConfirmingDelete}
                    message={detailMessage}
                    selectedImageName={detailSelectedImageName}
                    imagePreviewUrl={detailImagePreviewUrl}
                    onDeleteCancel={() => setDetailConfirmingDelete(false)}
                    onDeleteConfirm={handleDetailDelete}
                    onContentChange={setDetailContent}
                    onReasonChange={setDetailReason}
                    onDateChange={setDetailDisplayDate}
                    onPersonChange={setDetailPersonId}
                    onImageChange={handleDetailImageChange}
                    onRemoveImage={handleDetailRemoveImage}
                    onSave={handleDetailSave}
                    onCancelEdit={handleDetailCancelEdit}
                  />
                ) : undefined
              }
              onPersonChange={setTimelinePersonId}
              onRangeChange={handleTimelineRangeChange}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
              onSummaryClick={handleOpenInsightSummary}
              onTabChange={handleTimelineTabChange}
              onEventOpen={handleOpenTimelineDetail}
            />
          ) : activeTab === "insight" ? (
            <InsightView
              activeTab={activeTab}
              peopleFilters={timelinePeopleFilters}
              selectedPersonId={timelinePersonId}
              selectedRange={timelineRange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              message={insightMessage}
              emptyHint={copy.insightEmpty}
              generateDisabled={filteredTimelineItems.length === 0}
              loading={insightLoading}
              report={summaryReport}
              onPersonChange={setTimelinePersonId}
              onRangeChange={handleTimelineRangeChange}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
              onGenerate={handleGenerateSummary}
              onShare={handleShareSummary}
              onTabChange={handleTimelineTabChange}
            />
          ) : (
            <ProfileView
              email={session.user.email ?? ""}
              activeTab={activeTab}
              message={message}
              onLogout={handleLogout}
              onTabChange={handleTimelineTabChange}
            />
          )}
        </div>
      </div>
    </main>
  );
}
