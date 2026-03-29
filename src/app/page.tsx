"use client";

import { startTransition, useEffect, useState } from "react";
import { useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { LoaderCircle, Trash2 } from "lucide-react";
import {
  DetailTopBarActionButtons,
  DetailTopBarBackButton,
} from "@/components/DetailTopBarControls";
import {
  EventDetailPanel,
} from "@/components/EventDetailPanel";
import {
  CloudyArchiveView,
  type CloudyArchiveItem,
} from "@/components/CloudyArchiveView";
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
  normalizeAutoImageAttribution,
  buildEventPayload,
  hasEventInsightUnseenJoy,
  normalizeEventInsightResult,
  buildSummaryRequestEvents,
  filterTimelineItems,
  groupTimelineItemsByDate,
  getRetryAfterSeconds,
  isRateLimitError,
  type AutoImageAttribution,
  type AutoImageStatus,
  type EventInsightReport,
  type EventInsightStatus,
  normalizePersonName,
  normalizeAuthErrorMessage,
  pickInitialPerson,
  serializeImageUrls,
  type SummaryReport,
  type TimelineEntry,
  type TimelineRange,
  validateCredentials,
} from "@/lib/app-logic";
import { generateMemoryTitles } from "@/lib/memory-title-client";
import {
  normalizeCloudyAnalysisResult,
  type CloudyAnalysisResult,
} from "@/lib/cloudy-analysis";
import { uploadImageToStorage } from "@/lib/image-upload";
import { clearUpdateAvailableBuildId } from "@/lib/pwa-update-client";
import { supabase } from "@/lib/supabase";

type SupabaseErrorLike = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

function isMissingSchemaColumnMessage(message: string, columnPattern: RegExp) {
  return (
    columnPattern.test(message) &&
    (/schema cache/i.test(message) ||
      (/column/i.test(message) && /does not exist|unknown field/i.test(message)))
  );
}

function isMissingAiInsightSchemaError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as SupabaseErrorLike).message ?? "").trim()
      : error instanceof Error
        ? error.message.trim()
        : "";

  return message
    ? isMissingSchemaColumnMessage(message, /ai_insight_(status|payload)/i)
    : false;
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

function isMissingCloudySchemaError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as SupabaseErrorLike).message ?? "").trim()
      : error instanceof Error
        ? error.message.trim()
        : "";

  return message
    ? isMissingSchemaColumnMessage(
        message,
        /(event_type|ai_response|cloudy_analysis_status)/i,
      )
    : false;
}

function toHumanErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as SupabaseErrorLike).message;
    if (typeof message === "string" && message.trim()) {
      const normalized = message.trim();

      if (
        /column/i.test(normalized) &&
        /title/i.test(normalized) &&
        /does not exist|unknown field/i.test(normalized)
      ) {
        return "数据库缺少 events.title 字段，请在 Supabase SQL Editor 执行 supabase-sql.md 里的迁移脚本。";
      }

      if (isMissingAiInsightSchemaError({ message: normalized })) {
        return "数据库缺少 events.ai_insight_status / events.ai_insight_payload 字段（或 API schema cache 未刷新）。请在 Supabase SQL Editor 执行 supabase-sql.md 里“add single-record AI insight persistence for memory records”那段迁移，然后到 Settings -> API 点击 Reload schema cache 后重试。";
      }

      if (isMissingAutoImageSchemaError({ message: normalized })) {
        return "数据库还没有识别 events.auto_image_status / events.auto_image_payload 字段（或 API schema cache 未刷新）。当前会先按普通记录保存；如需 AI 配图，请在 Supabase SQL Editor 执行 supabase-sql.md 里的 auto image 迁移，并在 Settings -> API 点击 Reload schema cache。";
      }

      if (isMissingCloudySchemaError({ message: normalized })) {
        return "鏁版嵁搴撹繕娌℃湁闆ㄦ妯″紡闇€瑕佺殑 events.event_type / events.ai_response / events.cloudy_analysis_status 瀛楁銆傝鍏堝湪 Supabase SQL Editor 鎵ц supabase-sql.md 閲岀殑 Rain Shelter 杩佺Щ锛屽啀鍥炴潵閲嶈瘯銆?";
      }

      if (/row-level security|rls/i.test(normalized)) {
        return "保存被数据库策略拦截（RLS），请检查 events 表的 RLS policy 是否允许当前用户写入。";
      }

      return normalized;
    }
  }

  return fallback;
}

type AuthMode = "sign-in" | "sign-up";

const copy = {
  signInTitle: "\u6b22\u8fce\u4f7f\u7528\u5c0f\u7f8e\u597d",
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
  saved: "\u5df2\u4fdd\u5b58\u5230 events \u8868\uff0c\u56fe\u7247\u4e5f\u5df2\u5199\u5165 image_urls\u3002",
  emptyPeople: "\u8bf7\u5148\u521b\u5efa\u4e00\u4e2a\u8bb0\u5f55\u5bf9\u8c61\u3002",
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
  insightHint: "\u5148\u5199\u4e0b\u4e00\u70b9\u8bb0\u5f55\uff0cAI \u624d\u80fd\u5e2e\u4f60\u53d1\u73b0\u4eae\u70b9\u3002",
  insightFailed: "AI \u6682\u65f6\u6ca1\u6709\u6574\u7406\u597d\u8fd9\u6761\u8bb0\u5f55\uff0c\u7a0d\u540e\u518d\u8bd5\u4e00\u6b21\u3002",
  profileNameRequired: "\u8bf7\u5148\u586b\u5199\u4f60\u7684\u540d\u79f0\u3002",
  profileSaveSuccess: "\u4e2a\u4eba\u8d44\u6599\u5df2\u66f4\u65b0\u3002",
  profileAvatarReady: "\u65b0\u5934\u50cf\u5df2\u9009\u597d\uff0c\u4fdd\u5b58\u540e\u751f\u6548\u3002",
  profileAvatarRemoved: "\u5df2\u79fb\u9664\u5f53\u524d\u5934\u50cf\uff0c\u4fdd\u5b58\u540e\u751f\u6548\u3002",
  insightEmpty: "\u5148\u53bb\u8bb0\u5f55\u4e00\u4e9b\u5c0f\u7f8e\u597d\u518d\u6765\u5427",
  insightShare: "\u529f\u80fd\u6b63\u5728\u5f00\u53d1\u4e2d\uff0c\u5148\u622a\u56fe\u5206\u4eab\u7ed9\u5fc3\u7231\u7684\u4eba\u5427~",
};

const imageBucket =
  process.env.NEXT_PUBLIC_SUPABASE_IMAGE_BUCKET || "joy-images";
const profileImagePathPrefix = "profiles";
const todayString = new Date().toISOString().slice(0, 10);
const bootTimeoutMs = 2500;
const cloudySavedCopy = "已放入档案袋，回信会稍后安静落下。";

type Mode = "JOY" | "CLOUDY";

type EventRow = {
  id: string;
  title: string | null;
  content: string;
  reason: string | null;
  event_type?: "joy" | "cloudy" | null;
  ai_response?: unknown;
  cloudy_analysis_status?: "pending" | "ready" | "failed" | null;
  image_urls: string | null;
  display_date: string;
  created_at: string;
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

type DetailEventRow = {
  id: string;
  title: string | null;
  content: string;
  reason: string | null;
  event_type?: "joy" | "cloudy" | null;
  ai_response?: unknown;
  cloudy_analysis_status?: "pending" | "ready" | "failed" | null;
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

type ProfileRow = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
};

type EventTitleRow = {
  title?: string | null;
};

type FailedCloudyRow = {
  id: string;
  content: string;
  person_id: string;
  display_date: string;
  ai_response: unknown;
  cloudy_analysis_status: "pending" | "ready" | "failed" | null;
};

type CloudyArchiveRow = {
  id: string;
  content: string;
  person_id: string;
  display_date: string;
  created_at: string;
  ai_response: unknown;
  cloudy_analysis_status: "pending" | "ready" | "failed" | null;
};

const timelineEventSelect =
  "id, title, content, reason, event_type, ai_response, cloudy_analysis_status, image_urls, display_date, created_at, ai_insight_status, ai_insight_payload, auto_image_status, auto_image_payload, persons(id, name)";
const timelineEventLegacySelect =
  "id, title, content, reason, image_urls, display_date, created_at, ai_insight_status, ai_insight_payload, persons(id, name)";
const detailEventSelect =
  "id, title, content, reason, event_type, ai_response, cloudy_analysis_status, image_urls, display_date, created_at, person_id, ai_insight_status, ai_insight_payload, auto_image_status, auto_image_payload, persons(id, name)";
const detailEventLegacySelect =
  "id, title, content, reason, image_urls, display_date, created_at, person_id, ai_insight_status, ai_insight_payload, persons(id, name)";

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

function parseAutoImageAttribution(value: unknown) {
  return normalizeAutoImageAttribution(value);
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

function mapEventRowToTimelineEntry(event: EventRow): TimelineEntry {
  const { report, needsRefresh } = parseEventInsightPayload(event.ai_insight_payload);

  return {
    id: event.id,
    title: event.title,
    content: event.content,
    reason: event.reason,
    imageUrl: parseImageUrls(event.image_urls)[0] ?? null,
    displayDate: event.display_date,
    personName: getPersonName(event.persons),
    createdAt: event.created_at,
    personId: getPersonId(event.persons),
    aiInsightStatus: event.ai_insight_status,
    aiInsight: report,
    aiInsightNeedsRefresh: needsRefresh,
    autoImageStatus: event.auto_image_status,
    autoImageAttribution: parseAutoImageAttribution(event.auto_image_payload),
  };
}

function mapDetailRowToTimelineEntry(event: DetailEventRow): TimelineEntry {
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
    autoImageAttribution: parseAutoImageAttribution(event.auto_image_payload),
  };
}

async function fetchTimelineItems(userId: string) {
  let { data, error } = await supabase
    .from("events")
    .select(timelineEventSelect)
    .eq("user_id", userId)
    .eq("event_type", "joy")
    .order("display_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error && isMissingAutoImageSchemaError(error)) {
    ({ data, error } = await supabase
      .from("events")
      .select(timelineEventLegacySelect)
      .eq("user_id", userId)
      .eq("event_type", "joy")
      .order("display_date", { ascending: false })
      .order("created_at", { ascending: false }));
  }

  if (error) {
    throw error;
  }

  return ((data ?? []) as EventRow[]).map((event) => mapEventRowToTimelineEntry(event));
}

async function fetchTimelineItemDetail(userId: string, eventId: string) {
  let { data, error } = await supabase
    .from("events")
    .select(detailEventSelect)
    .eq("user_id", userId)
    .eq("event_type", "joy")
    .eq("id", eventId)
    .single();

  if (error && isMissingAutoImageSchemaError(error)) {
    ({ data, error } = await supabase
      .from("events")
      .select(detailEventLegacySelect)
      .eq("user_id", userId)
      .eq("event_type", "joy")
      .eq("id", eventId)
      .single());
  }

  if (error) {
    throw error;
  }

  const event = data as DetailEventRow;

  return mapDetailRowToTimelineEntry(event);
}

async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, display_name, avatar_url")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as ProfileRow | null) ?? null;
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
  const [mode, setMode] = useState<Mode>("JOY");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileExists, setProfileExists] = useState(false);
  const [profileDisplayName, setProfileDisplayName] = useState("");
  const [profileSavedDisplayName, setProfileSavedDisplayName] = useState("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [profileEditing, setProfileEditing] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [profileSelectedImageName, setProfileSelectedImageName] = useState("");
  const [profileImagePreviewUrl, setProfileImagePreviewUrl] = useState<string | null>(null);
  const [profilePendingAvatarFile, setProfilePendingAvatarFile] = useState<File | null>(null);
  const [profileAvatarRemoved, setProfileAvatarRemoved] = useState(false);
  const [people, setPeople] = useState<QuickEntryPerson[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [content, setContent] = useState("");
  const [reason, setReason] = useState("");
  const [displayDate, setDisplayDate] = useState(todayString);
  const [cloudyLetter, setCloudyLetter] = useState<CloudyAnalysisResult | null>(null);
  const [cloudyLoading, setCloudyLoading] = useState(false);
  const [cloudyLoadingMessage, setCloudyLoadingMessage] = useState("");
  const [cloudyPendingEventId, setCloudyPendingEventId] = useState("");
  const [cloudyRecoveryChecked, setCloudyRecoveryChecked] = useState(false);
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
  const [cloudyArchiveOpen, setCloudyArchiveOpen] = useState(false);
  const [cloudyArchiveLoading, setCloudyArchiveLoading] = useState(false);
  const [cloudyArchiveItems, setCloudyArchiveItems] = useState<CloudyArchiveItem[]>([]);
  const [selectedCloudyArchiveItemId, setSelectedCloudyArchiveItemId] = useState("");
  const [retryingCloudyArchiveItemId, setRetryingCloudyArchiveItemId] = useState("");
  const [cloudyArchiveDeleteMode, setCloudyArchiveDeleteMode] = useState(false);
  const [pendingCloudyArchiveDeleteId, setPendingCloudyArchiveDeleteId] = useState("");
  const [deletingCloudyArchiveItemId, setDeletingCloudyArchiveItemId] = useState("");
  const cloudyArchivePrefetchedUserRef = useRef("");
  const [timelineDetail, setTimelineDetail] = useState<TimelineEntry | null>(null);
  const [detailEditing, setDetailEditing] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailDeleting, setDetailDeleting] = useState(false);
  const [detailUploading, setDetailUploading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailConfirmingDelete, setDetailConfirmingDelete] = useState(false);
  const [detailMessage, setDetailMessage] = useState("");
  const [detailTitle, setDetailTitle] = useState("");
  const [detailTitleTouched, setDetailTitleTouched] = useState(false);
  const [detailContent, setDetailContent] = useState("");
  const [detailReason, setDetailReason] = useState("");
  const [detailDisplayDate, setDetailDisplayDate] = useState(todayString);
  const [detailPersonId, setDetailPersonId] = useState("");
  const [detailImagePreviewUrl, setDetailImagePreviewUrl] = useState<string | null>(null);
  const [detailSelectedImageName, setDetailSelectedImageName] = useState("");
  const [detailUploadedImageUrl, setDetailUploadedImageUrl] = useState<string | null>(null);
  const detailInsightRetryRef = useRef<Set<string>>(new Set());

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
    let settled = false;

    const timeoutId = window.setTimeout(() => {
      if (!mounted || settled) {
        return;
      }

      settled = true;
      setSession(null);
      setAuthMessage("连接超时，请刷新页面后重试。");
      setBooting(false);
    }, bootTimeoutMs);

    async function bootstrap() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted || settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutId);
        setSession(initialSession);
        if (initialSession) {
          setAuthMessage(copy.signInSuccess);
        }
      } catch (error) {
        if (!mounted || settled) {
          return;
        }

        settled = true;
        window.clearTimeout(timeoutId);
        setSession(null);
        setAuthMessage(
          error instanceof Error ? normalizeAuthErrorMessage(error.message) : copy.unknownError,
        );
      } finally {
        if (mounted && settled) {
          setBooting(false);
        }
      }
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
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function syncPeople() {
      if (!session?.user.id) {
        setPeople([]);
        setSelectedPersonId("");
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

      const nextPeople = (data ?? []) as QuickEntryPerson[];

      setPeople(nextPeople);
      setSelectedPersonId(
        pickInitialPerson(nextPeople)?.id ?? nextPeople[0]?.id ?? "",
      );
    }

    syncPeople();
  }, [session?.user.id]);

  useEffect(() => {
    let cancelled = false;

    async function syncProfile() {
      if (!session?.user.id) {
        resetProfileState();
        return;
      }

      try {
        const nextProfile = await fetchProfile(session.user.id);

        if (cancelled) {
          return;
        }

        const fallbackName = pickInitialPerson(people)?.name ?? "";
        const nextDisplayName = nextProfile?.display_name?.trim() || fallbackName;

        clearProfilePendingAvatar();
        setProfileExists(Boolean(nextProfile));
        setProfileSavedDisplayName(nextProfile?.display_name?.trim() ?? "");
        setProfileDisplayName(nextDisplayName);
        setProfileAvatarUrl(nextProfile?.avatar_url ?? null);
        setProfileAvatarRemoved(false);
        setProfileEditing(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setProfileExists(false);
        setProfileSavedDisplayName("");
        setProfileDisplayName(pickInitialPerson(people)?.name ?? "");
        setProfileAvatarUrl(null);
        setProfileAvatarRemoved(false);
        setProfileEditing(false);
        setMessage(toHumanErrorMessage(error, copy.unknownError));
      }
    }

    syncProfile();

    return () => {
      cancelled = true;
    };
  }, [people, session?.user.id]);

  useEffect(() => {
    async function syncEvents() {
      if (!session?.user.id) {
        setTimelineItems([]);
        return;
      }

      try {
        setTimelineItems(await fetchTimelineItems(session.user.id));
      } catch (error) {
        setMessage(toHumanErrorMessage(error, copy.unknownError));
      }
    }

    syncEvents();
  }, [session?.user.id]);

  useEffect(() => {
    setCloudyRecoveryChecked(false);
  }, [activeTab, session?.user.id]);

  useEffect(() => {
    if (activeTab !== "quick-entry" || people.length === 0) {
      return;
    }

    const hasSelectedPerson = people.some((person) => person.id === selectedPersonId);
    if (selectedPersonId && hasSelectedPerson) {
      return;
    }

    const fallbackPersonId = pickInitialPerson(people)?.id ?? people[0]?.id ?? "";
    if (fallbackPersonId && fallbackPersonId !== selectedPersonId) {
      setSelectedPersonId(fallbackPersonId);
    }
  }, [activeTab, people, selectedPersonId]);

  useEffect(() => {
    if (
      !session?.user.id ||
      activeTab !== "quick-entry" ||
      cloudyRecoveryChecked ||
      cloudyLoading
    ) {
      return;
    }

    let cancelled = false;
    setCloudyRecoveryChecked(true);

    async function recoverFailedCloudy() {
      try {
        const failedCloudy = await findLatestFailedCloudy(session.user.id);

        if (cancelled || !failedCloudy) {
          return;
        }

        if (parseCloudyLetter(failedCloudy.ai_response)) {
          return;
        }

        const recoveredPersonId = failedCloudy.person_id || getDefaultPersonId();
        if (!recoveredPersonId) {
          return;
        }

        void startCloudyAnalysisInBackground({
          userId: session.user.id,
          personId: recoveredPersonId,
          content: failedCloudy.content,
          displayDate: failedCloudy.display_date || todayString,
          eventId: failedCloudy.id,
        });
      } catch (error) {
        if (!cancelled) {
          setMessage(toHumanErrorMessage(error, copy.unknownError));
        }
      }
    }

    void recoverFailedCloudy();

    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    cloudyLoading,
    cloudyRecoveryChecked,
    session?.user.id,
  ]);

  useEffect(() => {
    if (!selectedTimelineEventId) {
      return;
    }

    const cachedDetail = timelineItems.find(
      (item) => item.id === selectedTimelineEventId,
    );

    if (!cachedDetail) {
      return;
    }

    setTimelineDetail((current) => {
      if (current?.id === cachedDetail.id) {
        return current;
      }

      return cachedDetail;
    });
    restoreDetailForm(cachedDetail);
  }, [selectedTimelineEventId, timelineItems]);

  useEffect(() => {
    let cancelled = false;

    async function syncTimelineDetail() {
      if (!session?.user.id || !selectedTimelineEventId) {
        setTimelineDetail(null);
        setDetailEditing(false);
        setDetailMessage("");
        setDetailLoading(false);
        return;
      }

      setDetailLoading(true);
      try {
        const nextDetail = await fetchTimelineItemDetail(
          session.user.id,
          selectedTimelineEventId,
        );

        if (cancelled) {
          return;
        }

        setTimelineDetail(nextDetail);
        restoreDetailForm(nextDetail);
        setDetailMessage("");
        setDetailLoading(false);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setTimelineDetail(null);
        setDetailMessage(toHumanErrorMessage(error, copy.unknownError));
        setDetailLoading(false);
      }
    }

    syncTimelineDetail();

    return () => {
      cancelled = true;
      setDetailLoading(false);
    };
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
    return () => {
      if (profileImagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(profileImagePreviewUrl);
      }
    };
  }, [profileImagePreviewUrl]);

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

  // Title is generated after a successful save, not while typing.

  function getSelectedPersonName(personId: string) {
    return people.find((person) => person.id === personId)?.name ?? "自己";
  }

  function getDefaultPersonId() {
    return pickInitialPerson(people)?.id ?? people[0]?.id ?? "";
  }

  function parseCloudyLetter(value: unknown) {
    if (!value) {
      return null;
    }

    try {
      return normalizeCloudyAnalysisResult(value);
    } catch {
      return null;
    }
  }

  function mapCloudyArchiveRowToItem(row: CloudyArchiveRow): CloudyArchiveItem {
    return {
      id: row.id,
      content: row.content,
      createdAt: row.created_at,
      displayDate: row.display_date,
      personId: row.person_id,
      status: row.cloudy_analysis_status,
      aiResponse: row.ai_response,
    };
  }

  async function fetchCloudyArchiveItems(userId: string) {
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, content, person_id, display_date, created_at, ai_response, cloudy_analysis_status",
      )
      .eq("user_id", userId)
      .eq("event_type", "cloudy")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return ((data ?? []) as CloudyArchiveRow[]).map((row) =>
      mapCloudyArchiveRowToItem(row),
    );
  }

  function applyInsightToLocalState(
    eventId: string,
    status: EventInsightStatus,
    report: EventInsightReport | null,
  ) {
    setTimelineItems((items) =>
      items.map((item) =>
        item.id === eventId
          ? {
              ...item,
              aiInsightStatus: status,
              aiInsight: report,
              aiInsightNeedsRefresh: false,
            }
          : item,
      ),
    );
    setTimelineDetail((current) =>
      current?.id === eventId
        ? {
            ...current,
            aiInsightStatus: status,
            aiInsight: report,
            aiInsightNeedsRefresh: false,
          }
        : current,
    );
  }

  function applyTitleToLocalState(eventId: string, nextTitle: string) {
    const titleValue = nextTitle.trim();
    if (!titleValue) {
      return;
    }

    setTimelineItems((items) =>
      items.map((item) => (item.id === eventId ? { ...item, title: titleValue } : item)),
    );
    setTimelineDetail((current) =>
      current?.id === eventId ? { ...current, title: titleValue } : current,
    );

    // Keep the next edit session in sync if the detail view is already open.
    if (
      selectedTimelineEventId === eventId &&
      !detailEditing &&
      !detailTitleTouched
    ) {
      setDetailTitle(titleValue);
      setDetailTitleTouched(false);
    }
  }

  function applyAutoImageToLocalState(params: {
    eventId: string;
    status: AutoImageStatus | null;
    imageUrl: string | null;
    attribution: AutoImageAttribution | null;
  }) {
    setTimelineItems((items) =>
      items.map((item) =>
        item.id === params.eventId
          ? {
              ...item,
              imageUrl: params.imageUrl,
              autoImageStatus: params.status,
              autoImageAttribution: params.attribution,
            }
          : item,
      ),
    );
    setTimelineDetail((current) =>
      current?.id === params.eventId
        ? {
            ...current,
            imageUrl: params.imageUrl,
            autoImageStatus: params.status,
            autoImageAttribution: params.attribution,
          }
        : current,
    );
  }

  async function backfillMemoryTitle(params: {
    eventId: string;
    userId: string;
    content: string;
    reason: string;
    displayDate: string;
  }) {
    try {
      const [generatedTitle] = await generateMemoryTitles([
        {
          content: params.content,
          reason: params.reason,
          time: params.displayDate,
        },
      ]);

      const titleValue = (generatedTitle ?? "").trim();
      if (!titleValue) {
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .update({ title: titleValue })
        .eq("id", params.eventId)
        .eq("user_id", params.userId)
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

      applyTitleToLocalState(params.eventId, updatedTitle);
    } catch {
      // Fire-and-forget: title backfill should never block the primary save path.
    }
  }

  async function requestAutoImage(input: {
    content: string;
    reason: string;
  }) {
    const response = await fetch("/api/generate-auto-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        typeof payload?.error === "string" ? payload.error : copy.unknownError,
      );
    }

    const attribution = normalizeAutoImageAttribution({
      source: "unsplash",
      query:
        typeof payload?.query === "string" ? payload.query : "",
      keywords: Array.isArray(payload?.keywords) ? payload.keywords : [],
      photoId:
        typeof payload?.photoId === "string" ? payload.photoId : "",
      photoPageUrl:
        typeof payload?.photoPageUrl === "string" ? payload.photoPageUrl : "",
      photographerName:
        typeof payload?.photographerName === "string"
          ? payload.photographerName
          : "",
      photographerProfileUrl:
        typeof payload?.photographerProfileUrl === "string"
          ? payload.photographerProfileUrl
          : "",
      downloadLocation:
        typeof payload?.downloadLocation === "string"
          ? payload.downloadLocation
          : "",
    });

    if (!attribution || typeof payload?.imageUrl !== "string" || !payload.imageUrl.trim()) {
      throw new Error("Auto image payload is incomplete");
    }

    return {
      imageUrl: payload.imageUrl.trim(),
      attribution,
    };
  }

  async function persistAutoImageState(params: {
    eventId: string;
    userId: string;
    status: AutoImageStatus | null;
    imageUrl: string | null;
    attribution: AutoImageAttribution | null;
    errorMessage?: string;
  }) {
    const payload =
      params.status === "ready" && params.attribution
        ? params.attribution
        : params.status === "failed"
          ? { error: params.errorMessage ?? "Auto image generation failed" }
          : null;

    const { error } = await supabase
      .from("events")
      .update({
        image_urls: params.imageUrl ? serializeImageUrls([params.imageUrl]) : null,
        auto_image_status: params.status,
        auto_image_payload: payload,
      })
      .eq("id", params.eventId)
      .eq("user_id", params.userId);

    if (error) {
      if (isMissingAutoImageSchemaError(error)) {
        return;
      }
      throw error;
    }
  }

  async function backfillAutoImage(params: {
    eventId: string;
    userId: string;
    content: string;
    reason: string;
  }) {
    let lastError = "Auto image generation failed";

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const result = await requestAutoImage({
          content: params.content,
          reason: params.reason,
        });

        await persistAutoImageState({
          eventId: params.eventId,
          userId: params.userId,
          status: "ready",
          imageUrl: result.imageUrl,
          attribution: result.attribution,
        });
        applyAutoImageToLocalState({
          eventId: params.eventId,
          status: "ready",
          imageUrl: result.imageUrl,
          attribution: result.attribution,
        });
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error.message : lastError;
      }
    }

    try {
      await persistAutoImageState({
        eventId: params.eventId,
        userId: params.userId,
        status: "failed",
        imageUrl: null,
        attribution: null,
        errorMessage: lastError,
      });
    } catch {
      // Keep the main save flow silent even if failure persistence does not succeed.
    }

    applyAutoImageToLocalState({
      eventId: params.eventId,
      status: "failed",
      imageUrl: null,
      attribution: null,
    });
    return null;
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

  async function persistEventInsightState(params: {
    eventId: string;
    userId: string;
    status: EventInsightStatus;
    report: EventInsightReport | null;
  }) {
    const { error } = await supabase
      .from("events")
      .update({
        ai_insight_status: params.status,
        ai_insight_payload: params.report,
      })
      .eq("id", params.eventId)
      .eq("user_id", params.userId);

    if (error) {
      throw error;
    }
  }

  async function backfillEventInsight(params: {
    eventId: string;
    userId: string;
    content: string;
    reason: string;
    displayDate: string;
    personName: string;
  }) {
    try {
      const report = await requestEventInsightReport({
        content: params.content,
        reason: params.reason,
        displayDate: params.displayDate,
        personName: params.personName,
      });

      await persistEventInsightState({
        eventId: params.eventId,
        userId: params.userId,
        status: "ready",
        report,
      });
      applyInsightToLocalState(params.eventId, "ready", report);
      return report;
    } catch {
      try {
        await persistEventInsightState({
          eventId: params.eventId,
          userId: params.userId,
          status: "failed",
          report: null,
        });
      } catch {
        // Keep the page responsive even if persisting the failure state does not succeed.
      }
      applyInsightToLocalState(params.eventId, "failed", null);
      return null;
    }
  }

  async function requestCloudyAnalysis(contentValue: string) {
    const response = await fetch("/api/cloudy-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: contentValue,
      }),
    });

    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      throw new Error(
        payload &&
          typeof payload === "object" &&
          "error" in payload &&
          typeof payload.error === "string"
          ? payload.error
          : copy.unknownError,
      );
    }

    return normalizeCloudyAnalysisResult(payload);
  }

  async function persistCloudyPendingState(params: {
    eventId?: string;
    userId: string;
    personId: string;
    content: string;
    displayDate: string;
  }) {
    const payload = buildEventPayload({
      userId: params.userId,
      personId: params.personId,
      content: params.content,
      reason: "",
      imageUrls: [],
      displayDate: params.displayDate,
      eventType: "cloudy",
    });

    const pendingPayload = {
      ...payload,
      ai_response: null,
      cloudy_analysis_status: "pending" as const,
    };

    if (params.eventId) {
      const { error } = await supabase
        .from("events")
        .update(pendingPayload)
        .eq("id", params.eventId)
        .eq("user_id", params.userId);

      if (error) {
        throw error;
      }

      return params.eventId;
    }

    const { data, error } = await supabase
      .from("events")
      .insert(pendingPayload)
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return (data as { id?: string } | null)?.id ?? "";
  }

  async function persistCloudyAnalysisResult(params: {
    eventId: string;
    userId: string;
    result: CloudyAnalysisResult;
  }) {
    const { error } = await supabase
      .from("events")
      .update({
        ai_response: params.result,
        cloudy_analysis_status: "ready",
      })
      .eq("id", params.eventId)
      .eq("user_id", params.userId);

    if (error) {
      throw error;
    }
  }

  async function persistCloudyFailureState(params: {
    eventId: string;
    userId: string;
  }) {
    const { error } = await supabase
      .from("events")
      .update({
        cloudy_analysis_status: "failed",
      })
      .eq("id", params.eventId)
      .eq("user_id", params.userId);

    if (error) {
      throw error;
    }
  }

  async function findLatestFailedCloudy(userId: string) {
    const { data, error } = await supabase
      .from("events")
      .select(
        "id, content, person_id, display_date, ai_response, cloudy_analysis_status",
      )
      .eq("user_id", userId)
      .eq("event_type", "cloudy")
      .eq("cloudy_analysis_status", "failed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data as FailedCloudyRow | null) ?? null;
  }

  async function analyzeCloudyEvent(params: {
    userId: string;
    personId: string;
    content: string;
    displayDate: string;
    eventId?: string;
  }) {
    let eventId = params.eventId ?? "";

    try {
      eventId = await persistCloudyPendingState({
        eventId: params.eventId,
        userId: params.userId,
        personId: params.personId,
        content: params.content,
        displayDate: params.displayDate,
      });
      setCloudyPendingEventId(eventId);

      const result = await requestCloudyAnalysis(params.content);

      if (eventId) {
        await persistCloudyAnalysisResult({
          eventId,
          userId: params.userId,
          result,
        });
      }

      return {
        eventId,
        result,
      };
    } catch (error) {
      if (eventId) {
        try {
          await persistCloudyFailureState({
            eventId,
            userId: params.userId,
          });
        } catch (persistError) {
          throw persistError;
        }
      }

      if (eventId) {
        return Promise.reject({
          error,
          eventId,
        });
      }

      throw error;
    }
  }

  async function startCloudyAnalysisInBackground(params: {
    userId: string;
    personId: string;
    content: string;
    displayDate: string;
    eventId: string;
  }) {
    try {
      const { result } = await analyzeCloudyEvent(params);
      setCloudyArchiveItems((current) =>
        current.map((entry) =>
          entry.id === params.eventId
            ? {
                ...entry,
                status: "ready",
                aiResponse: result,
              }
            : entry,
        ),
      );
    } catch (error) {
      setCloudyArchiveItems((current) =>
        current.map((entry) =>
          entry.id === params.eventId
            ? {
                ...entry,
                status: "failed",
              }
            : entry,
        ),
      );
      setMessage(toHumanErrorMessage(error, "这封回信暂时还没整理好，已经留在档案袋里了。"));
    } finally {
      setCloudyPendingEventId("");
    }
  }

  async function handleRetryInsight() {
    if (!session?.user.id || !timelineDetail) {
      return;
    }

    setDetailMessage("");
    applyInsightToLocalState(timelineDetail.id, "pending", null);
    detailInsightRetryRef.current.add(timelineDetail.id);
    try {
      await persistEventInsightState({
        eventId: timelineDetail.id,
        userId: session.user.id,
        status: "pending",
        report: null,
      });
    } catch {
      // Showing local pending state is better than blocking the retry path.
    }

    const report = await backfillEventInsight({
      eventId: timelineDetail.id,
      userId: session.user.id,
      content: detailContent.trim() || timelineDetail.content,
      reason: detailReason.trim() || timelineDetail.reason || "",
      displayDate: detailDisplayDate || timelineDetail.displayDate,
      personName: getSelectedPersonName(detailPersonId || timelineDetail.personId),
    });

    if (!report) {
      setDetailMessage(copy.insightFailed);
    }
  }

  useEffect(() => {
    if (!session?.user.id || !timelineDetail || detailEditing) {
      return;
    }

    if (
      timelineDetail.aiInsightStatus === "ready" &&
      !timelineDetail.aiInsightNeedsRefresh
    ) {
      return;
    }

    if (detailInsightRetryRef.current.has(timelineDetail.id)) {
      return;
    }

    detailInsightRetryRef.current.add(timelineDetail.id);
    void handleRetryInsight();
  }, [detailEditing, session?.user.id, timelineDetail]);

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

  function clearProfilePendingAvatar() {
    if (profileImagePreviewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(profileImagePreviewUrl);
    }

    setProfileImagePreviewUrl(null);
    setProfilePendingAvatarFile(null);
    setProfileSelectedImageName("");
  }

  function resetProfileState() {
    clearProfilePendingAvatar();
    setProfileExists(false);
    setProfileDisplayName("");
    setProfileSavedDisplayName("");
    setProfileAvatarUrl(null);
    setProfileAvatarRemoved(false);
    setProfileEditing(false);
    setProfileSaving(false);
    setProfileUploading(false);
  }

  function syncDefaultPersonNameLocally(defaultPersonId: string, nextName: string) {
    setPeople((current) =>
      current.map((person) =>
        person.id === defaultPersonId ? { ...person, name: nextName } : person,
      ),
    );
    setTimelineItems((current) =>
      current.map((item) =>
        item.personId === defaultPersonId ? { ...item, personName: nextName } : item,
      ),
    );
    setTimelineDetail((current) =>
      current && current.personId === defaultPersonId
        ? { ...current, personName: nextName }
        : current,
    );
  }

  function restoreDetailForm(nextDetail: TimelineEntry | null) {
    if (!nextDetail) {
      return;
    }

    setDetailTitle((nextDetail.title ?? "").trim());
    setDetailTitleTouched(false);
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

    return normalizeAuthErrorMessage(message);
  }

  function handleEmailChange(value: string) {
    setEmail(value);
    setErrors((current) => ({ ...current, email: "" }));
    if (retryAfterSeconds === 0) {
      setAuthMessage("");
    }
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setErrors((current) => ({ ...current, password: "" }));
    if (retryAfterSeconds === 0) {
      setAuthMessage("");
    }
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
    setUploading(true);

    try {
      const { publicUrl } = await uploadImageToStorage({
        storage: supabase.storage,
        bucket: imageBucket,
        userId: session.user.id,
        file,
      });
      setUploadedImageUrl(publicUrl);
      setMessage(copy.imageReady);
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.uploadFailed));
    } finally {
      setUploading(false);
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
    setDetailUploading(true);

    try {
      const { publicUrl } = await uploadImageToStorage({
        storage: supabase.storage,
        bucket: imageBucket,
        userId: session.user.id,
        file,
      });
      setDetailUploadedImageUrl(publicUrl);
      setDetailMessage(copy.imageReady);
    } catch (error) {
      setDetailMessage(toHumanErrorMessage(error, copy.uploadFailed));
    } finally {
      setDetailUploading(false);
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

  function handleProfileDisplayNameChange(value: string) {
    setProfileDisplayName(value);
  }

  function handleProfileAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    clearProfilePendingAvatar();
    setProfilePendingAvatarFile(file);
    setProfileSelectedImageName(file.name);
    setProfileImagePreviewUrl(URL.createObjectURL(file));
    setProfileAvatarRemoved(false);
    setMessage(copy.profileAvatarReady);
    event.target.value = "";
  }

  function handleProfileRemoveAvatar() {
    clearProfilePendingAvatar();
    setProfileAvatarRemoved(true);
    setMessage(copy.profileAvatarRemoved);
  }

  async function handleSaveProfile() {
    if (!session?.user.id) {
      setMessage(copy.unknownError);
      return;
    }

    const nextDisplayName = profileDisplayName.trim();

    if (!nextDisplayName) {
      setMessage(copy.profileNameRequired);
      return;
    }

    const defaultPerson = pickInitialPerson(people);

    if (!defaultPerson) {
      setMessage(copy.emptyPeople);
      return;
    }

    setProfileSaving(true);
    setProfileUploading(Boolean(profilePendingAvatarFile));
    setMessage("");

    const previousProfile = {
      exists: profileExists,
      displayName: profileSavedDisplayName,
      avatarUrl: profileAvatarUrl,
    };

    let nextAvatarUrl = profileAvatarRemoved ? null : profileAvatarUrl;

    try {
      if (profilePendingAvatarFile) {
        const { publicUrl } = await uploadImageToStorage({
          storage: supabase.storage,
          bucket: imageBucket,
          userId: session.user.id,
          file: profilePendingAvatarFile,
          pathPrefix: profileImagePathPrefix,
        });
        nextAvatarUrl = publicUrl;
      }

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: session.user.id,
          display_name: nextDisplayName,
          avatar_url: nextAvatarUrl,
        },
        { onConflict: "user_id" },
      );

      if (profileError) {
        throw profileError;
      }

      const { error: personError } = await supabase
        .from("persons")
        .update({ name: nextDisplayName })
        .match({ id: defaultPerson.id, user_id: session.user.id });

      if (personError) {
        if (previousProfile.exists) {
          await supabase.from("profiles").upsert(
            {
              user_id: session.user.id,
              display_name: previousProfile.displayName,
              avatar_url: previousProfile.avatarUrl,
            },
            { onConflict: "user_id" },
          );
        } else {
          await supabase.from("profiles").delete().match({ user_id: session.user.id });
        }

        throw personError;
      }

      setProfileExists(true);
      setProfileSavedDisplayName(nextDisplayName);
      setProfileDisplayName(nextDisplayName);
      setProfileAvatarUrl(nextAvatarUrl);
      setProfileAvatarRemoved(false);
      setProfileEditing(false);
      clearProfilePendingAvatar();
      syncDefaultPersonNameLocally(defaultPerson.id, nextDisplayName);
      setMessage(copy.profileSaveSuccess);
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setProfileSaving(false);
      setProfileUploading(false);
    }
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
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    }
    setMessage(
      `${
        recordCount > 0 ? copy.personDeletedWithRecords : copy.personDeleted
      }${personToDelete.name}`,
    );
    return { ok: true };
  }

  async function handleCloudySave() {
    if (!session?.user.id) {
      setMessage(copy.unknownError);
      return;
    }

    const defaultPersonId = getDefaultPersonId();
    if (!defaultPersonId) {
      setMessage(copy.emptyPeople);
      return;
    }

    const nextContent = content.trim();
    if (!nextContent) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const eventId = await persistCloudyPendingState({
        userId: session.user.id,
        personId: defaultPersonId,
        content: nextContent,
        displayDate,
        eventId: undefined,
      });
      const archiveItem: CloudyArchiveItem = {
        id: eventId,
        content: nextContent,
        personId: defaultPersonId,
        aiResponse: null,
        status: "pending",
        displayDate,
        createdAt: new Date().toISOString(),
      };

      setCloudyArchiveItems((current) => {
        const remaining = current.filter((entry) => entry.id !== eventId);
        return [archiveItem, ...remaining];
      });
      setCloudyPendingEventId("");
      setCloudyLetter(null);
      setCloudyLoading(false);
      setCloudyLoadingMessage("");
      setContent("");
      setMessage(cloudySavedCopy);

      void startCloudyAnalysisInBackground({
        userId: session.user.id,
        personId: defaultPersonId,
        content: nextContent,
        displayDate,
        eventId,
      });
    } catch (error) {
      setCloudyArchiveItems(previousCloudyArchiveItems);
      setSelectedCloudyArchiveItemId(previousSelectedCloudyArchiveItemId);
      setRetryingCloudyArchiveItemId(previousRetryingCloudyArchiveItemId);
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === "CLOUDY") {
      await handleCloudySave();
      return;
    }

    if (!session?.user.id || !selectedPersonId) {
      setMessage(copy.emptyPeople);
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
        userId: session.user.id,
        personId: selectedPersonId,
        content,
        reason,
        imageUrls: uploadedImageUrl ? [uploadedImageUrl] : [],
        displayDate,
      });
      const shouldGenerateAutoImage = !uploadedImageUrl;

      const selectedPersonName = getSelectedPersonName(selectedPersonId);
      const autoImageInsertPayload = {
        ...payload,
        ai_insight_status: "pending",
        ai_insight_payload: null,
        ...(shouldGenerateAutoImage
          ? {
              auto_image_status: "pending",
              auto_image_payload: null,
            }
          : {}),
      };
      let autoImageEnabled = shouldGenerateAutoImage;
      let { data, error } = await supabase
        .from("events")
        .insert(autoImageInsertPayload)
        .select("id")
        .single();

      if (error && shouldGenerateAutoImage && isMissingAutoImageSchemaError(error)) {
        autoImageEnabled = false;
        ({ data, error } = await supabase
          .from("events")
          .insert({
            ...payload,
            ai_insight_status: "pending",
            ai_insight_payload: null,
          })
          .select("id")
          .single());
      }

      if (error) {
        throw error;
      }

      const insertedEventId = (data as { id?: string } | null)?.id ?? "";

      handleCancel();
      setMessage(copy.saveSuccess);
      setActiveTab("timeline");
      syncHomeLocation("timeline", "", true);

      if (insertedEventId) {
        const optimisticEntry: TimelineEntry = {
          id: insertedEventId,
          title: null,
          content: payload.content,
          reason: payload.reason,
          imageUrl: uploadedImageUrl,
          displayDate: payload.display_date,
          createdAt: new Date().toISOString(),
          personId: payload.person_id,
          personName: selectedPersonName,
          aiInsightStatus: "pending",
          aiInsight: null,
          aiInsightNeedsRefresh: false,
          autoImageStatus: autoImageEnabled ? "pending" : null,
          autoImageAttribution: null,
        };

        setTimelineItems((current) => [optimisticEntry, ...current]);
        void fetchTimelineItems(session.user.id)
          .then((items) => setTimelineItems(items))
          .catch((nextError) => setMessage(toHumanErrorMessage(nextError, copy.unknownError)));

        void backfillMemoryTitle({
          eventId: insertedEventId,
          userId: session.user.id,
          content: payload.content,
          reason: payload.reason ?? "",
          displayDate: payload.display_date,
        });

        applyInsightToLocalState(insertedEventId, "pending", null);
        detailInsightRetryRef.current.add(insertedEventId);
        void backfillEventInsight({
          eventId: insertedEventId,
          userId: session.user.id,
          content: payload.content,
          reason: payload.reason ?? "",
          displayDate: payload.display_date,
          personName: selectedPersonName,
        });

        if (autoImageEnabled) {
          applyAutoImageToLocalState({
            eventId: insertedEventId,
            status: "pending",
            imageUrl: null,
            attribution: null,
          });
          void backfillAutoImage({
            eventId: insertedEventId,
            userId: session.user.id,
            content: payload.content,
            reason: payload.reason ?? "",
          });
        }
      }
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDetailSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await saveDetailDraft();
  }

  async function saveDetailDraft() {
    if (!session?.user.id || !timelineDetail || !detailPersonId) {
      setDetailMessage(copy.emptyPeople);
      return;
    }

    if (detailSaving) {
      return;
    }

    if (
      detailUploading ||
      (Boolean(detailSelectedImageName) &&
        detailImagePreviewUrl?.startsWith("blob:") &&
        !detailUploadedImageUrl)
    ) {
      setDetailMessage(copy.uploadPending);
      return;
    }

    setDetailSaving(true);
    setDetailMessage("");

    try {
      const payload = buildEventPayload({
        userId: session.user.id,
        personId: detailPersonId,
        content: detailContent,
        reason: detailReason,
        imageUrls: detailUploadedImageUrl ? [detailUploadedImageUrl] : [],
        displayDate: detailDisplayDate,
      });
      const detailNeedsInsightRefresh =
        timelineDetail.content !== payload.content ||
        (timelineDetail.reason ?? "") !== (payload.reason ?? "") ||
        timelineDetail.displayDate !== payload.display_date ||
        timelineDetail.personId !== payload.person_id;
      const detailImageChanged = detailUploadedImageUrl !== timelineDetail.imageUrl;

      const updatePayload: Record<string, unknown> = {
        person_id: payload.person_id,
        content: payload.content,
        reason: payload.reason,
        image_urls: payload.image_urls ?? serializeImageUrls([]),
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

      if (detailTitleTouched) {
        const trimmedTitle = detailTitle.trim();
        updatePayload.title = trimmedTitle ? trimmedTitle : null;
      }

      let { data, error } = await supabase
        .from("events")
        .update(updatePayload)
        .eq("id", timelineDetail.id)
        .eq("user_id", session.user.id)
        .select(detailEventSelect)
        .single();

      if (error && isMissingAutoImageSchemaError(error)) {
        const legacyPayload = { ...updatePayload };
        delete legacyPayload.auto_image_status;
        delete legacyPayload.auto_image_payload;

        ({ data, error } = await supabase
          .from("events")
          .update(legacyPayload)
          .eq("id", timelineDetail.id)
          .eq("user_id", session.user.id)
          .select(detailEventLegacySelect)
          .single());
      }

      if (error) {
        throw error;
      }

      const nextDetailRow = data as DetailEventRow;
      const nextDetail = mapDetailRowToTimelineEntry(nextDetailRow);

      setTimelineDetail(nextDetail);
      restoreDetailForm(nextDetail);
      setTimelineItems((current) =>
        current.map((item) =>
          item.id === nextDetail.id
            ? {
                ...item,
                title: nextDetail.title,
                content: nextDetail.content,
                reason: nextDetail.reason,
                imageUrl: nextDetail.imageUrl,
                displayDate: nextDetail.displayDate,
                personId: nextDetail.personId,
                personName: nextDetail.personName,
                autoImageStatus: nextDetail.autoImageStatus,
                autoImageAttribution: nextDetail.autoImageAttribution,
              }
            : item,
        ),
      );
      setDetailEditing(false);
      setDetailConfirmingDelete(false);
      setDetailMessage(copy.saveSuccess);

      if (detailNeedsInsightRefresh) {
        applyInsightToLocalState(nextDetail.id, "pending", null);
        detailInsightRetryRef.current.add(nextDetail.id);
        void backfillEventInsight({
          eventId: nextDetail.id,
          userId: session.user.id,
          content: payload.content,
          reason: payload.reason ?? "",
          displayDate: payload.display_date,
          personName: getSelectedPersonName(payload.person_id),
        });
      }

      if (!detailTitleTouched && !(nextDetail.title ?? "").trim()) {
        void backfillMemoryTitle({
          eventId: nextDetail.id,
          userId: session.user.id,
          content: payload.content,
          reason: payload.reason ?? "",
          displayDate: payload.display_date,
        });
      }
    } catch (error) {
      setDetailMessage(toHumanErrorMessage(error, copy.unknownError));
  } finally {
      setDetailSaving(false);
      setDetailUploading(false);
    }
  }

  function removeEventRecordFromLocalState(eventId: string) {
    setTimelineItems((current) => current.filter((item) => item.id !== eventId));
    setCloudyArchiveItems((current) => current.filter((item) => item.id !== eventId));
    setTimelineDetail((current) => (current?.id === eventId ? null : current));
    setSelectedTimelineEventId((current) => (current === eventId ? "" : current));
    setSelectedCloudyArchiveItemId((current) => (current === eventId ? "" : current));
    setRetryingCloudyArchiveItemId((current) => (current === eventId ? "" : current));
  }

  async function deleteEventRecord(eventId: string) {
    if (!session?.user.id) {
      return;
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", session.user.id);

    if (error) {
      throw error;
    }

  }

  async function handleDetailDelete() {
    if (!timelineDetail) {
      return;
    }

    setDetailDeleting(true);
    setDetailMessage("");

    try {
      await deleteEventRecord(timelineDetail.id);
      removeEventRecordFromLocalState(timelineDetail.id);
      setMessage("这件小美好已从时间线中轻轻放下。");
      setMessage("这条记录已被永久删除。");
      handleCloseTimelineDetail();
    } catch (error) {
      setDetailMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setDetailDeleting(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setPeople([]);
    setSelectedPersonId("");
    resetProfileState();
    setMode("JOY");
    setCloudyLetter(null);
    setCloudyLoading(false);
    setCloudyLoadingMessage("");
    setCloudyPendingEventId("");
    setCloudyRecoveryChecked(false);
    handleCancel();
  }

  async function handleRefreshApp() {
    if (typeof window === "undefined") {
      return;
    }

    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setMessage("当前离线，刷新更新需要网络连接。");
      return;
    }

    setMessage("正在刷新更新...");

    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations.map((registration) => registration.unregister()),
        );
      }

      if (typeof caches !== "undefined") {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map((key) => caches.delete(key)));
      }
    } catch {
      // Ignore cleanup failures and still attempt a hard reload.
    }

    const url = new URL(window.location.href);
    url.searchParams.set("__refresh", String(Date.now()));
    clearUpdateAvailableBuildId();
    window.location.replace(url.toString());
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

  function handleEnterCloudyMode() {
    handleCancel();
    setMessage("");
    setMode("CLOUDY");
    setCloudyLetter(null);
    setCloudyLoading(false);
    setCloudyLoadingMessage("");
  }

  function handleExitCloudyMode() {
    handleCancel();
    setMode("JOY");
    setCloudyLetter(null);
    setCloudyLoading(false);
    setCloudyLoadingMessage("");
    setCloudyPendingEventId("");
  }

  function handleCloudyLetterDismiss() {
    handleExitCloudyMode();
  }

  function handleTimelineTabChange(nextTab: HomeTab) {
    setActiveTab(nextTab);

    if (nextTab !== "timeline") {
      handleCloseCloudyArchive();
      setSelectedTimelineEventId("");
      setTimelineDetail(null);
      setDetailEditing(false);
      setDetailMessage("");
      setDetailLoading(false);
      setDetailImagePreviewUrl(null);
      setDetailConfirmingDelete(false);
      syncHomeLocation(nextTab, "", true);
      return;
    }

    syncHomeLocation("timeline", selectedTimelineEventId, true);
  }

  function handleOpenTimelineDetail(eventId: string) {
    const cachedDetail = timelineItems.find((item) => item.id === eventId) ?? null;

    handleCloseCloudyArchive();
    setActiveTab("timeline");
    setSelectedTimelineEventId(eventId);
    setDetailLoading(true);
    setTimelineDetail(cachedDetail);
    restoreDetailForm(cachedDetail);
    setDetailEditing(false);
    setDetailMessage("");
    syncHomeLocation("timeline", eventId);
  }

  function handleCloseTimelineDetail() {
    handleCloseCloudyArchive();
    setSelectedTimelineEventId("");
    setTimelineDetail(null);
    setDetailEditing(false);
    setDetailMessage("");
    setDetailLoading(false);
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

  async function loadCloudyArchive(userId: string) {
    setCloudyArchiveLoading(true);

    try {
      setCloudyArchiveItems(await fetchCloudyArchiveItems(userId));
      cloudyArchivePrefetchedUserRef.current = userId;
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setCloudyArchiveLoading(false);
    }
  }

  function handleCloseCloudyArchive() {
    setCloudyArchiveOpen(false);
    setSelectedCloudyArchiveItemId("");
    setRetryingCloudyArchiveItemId("");
    setCloudyArchiveDeleteMode(false);
    setPendingCloudyArchiveDeleteId("");
    setDeletingCloudyArchiveItemId("");
  }

  function handleBackToCloudyArchiveList() {
    setSelectedCloudyArchiveItemId("");
  }

  function handleOpenCloudyArchiveItem(itemId: string) {
    setSelectedCloudyArchiveItemId(itemId);
  }

  function handleCloudyArchiveDeleteModeToggle() {
    setCloudyArchiveDeleteMode((current) => !current);
    setPendingCloudyArchiveDeleteId("");
  }

  function handleRequestCloudyArchiveDelete(itemId: string) {
    if (!itemId || deletingCloudyArchiveItemId) {
      return;
    }

    setPendingCloudyArchiveDeleteId(itemId);
  }

  function handleCancelCloudyArchiveDelete() {
    setPendingCloudyArchiveDeleteId("");
  }

  async function handleConfirmCloudyArchiveDelete() {
    if (!pendingCloudyArchiveDeleteId) {
      return;
    }

    setPendingCloudyArchiveDeleteId("");
    await handleDeleteCloudyArchiveItem(pendingCloudyArchiveDeleteId);
  }

  async function handleDeleteCloudyArchiveItem(itemId: string) {
    if (!itemId) {
      return;
    }

    const previousCloudyArchiveItems = cloudyArchiveItems;
    const previousSelectedCloudyArchiveItemId = selectedCloudyArchiveItemId;
    const previousRetryingCloudyArchiveItemId = retryingCloudyArchiveItemId;

    setDeletingCloudyArchiveItemId(itemId);
    setMessage("");
    removeEventRecordFromLocalState(itemId);

    try {
      await deleteEventRecord(itemId);
      setMessage("这条记录已被永久删除。");
    } catch (error) {
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setDeletingCloudyArchiveItemId("");
    }
  }

  async function handleRetryCloudyArchiveItem(itemId: string) {
    if (!session?.user.id) {
      return;
    }

    const item = cloudyArchiveItems.find((entry) => entry.id === itemId);

    if (!item) {
      return;
    }

    setRetryingCloudyArchiveItemId(itemId);
    setMessage("");
    setCloudyArchiveItems((current) =>
      current.map((entry) =>
        entry.id === itemId
          ? {
              ...entry,
              status: "pending",
            }
          : entry,
      ),
    );

    try {
      const { result } = await analyzeCloudyEvent({
        userId: session.user.id,
        personId: item.personId || getDefaultPersonId(),
        content: item.content,
        displayDate: item.displayDate || todayString,
        eventId: item.id,
      });

      setCloudyArchiveItems((current) =>
        current.map((entry) =>
          entry.id === itemId
            ? {
                ...entry,
                status: "ready",
                aiResponse: result,
              }
            : entry,
        ),
      );
      setSelectedCloudyArchiveItemId(itemId);
    } catch (error) {
      setCloudyArchiveItems((current) =>
        current.map((entry) =>
          entry.id === itemId
            ? {
                ...entry,
                status: "failed",
              }
            : entry,
        ),
      );
      setMessage(toHumanErrorMessage(error, copy.unknownError));
    } finally {
      setRetryingCloudyArchiveItemId("");
    }
  }

  function handleOpenCloudyArchive() {
    startTransition(() => {
      setSelectedTimelineEventId("");
      setTimelineDetail(null);
      setDetailEditing(false);
      setDetailMessage("");
      setDetailLoading(false);
      setDetailConfirmingDelete(false);
      setCloudyArchiveOpen(true);
      setSelectedCloudyArchiveItemId("");
      setCloudyArchiveDeleteMode(false);
      setPendingCloudyArchiveDeleteId("");
      setDeletingCloudyArchiveItemId("");
      setMessage("");
    });

    if (session?.user.id) {
      void loadCloudyArchive(session.user.id);
    }
  }

  useEffect(() => {
    if (!session?.user.id) {
      cloudyArchivePrefetchedUserRef.current = "";
      return;
    }

    if (cloudyArchivePrefetchedUserRef.current === session.user.id) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const schedulePrefetch = () => {
      if (cloudyArchivePrefetchedUserRef.current === session.user.id) {
        return;
      }

      void loadCloudyArchive(session.user.id);
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(schedulePrefetch, {
        timeout: 1200,
      });

      return () => {
        window.cancelIdleCallback?.(idleId);
      };
    }

    const timeoutId = window.setTimeout(schedulePrefetch, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [session?.user.id]);

  function handleOpenCloudyArchivePlaceholder() {
    setMessage("解忧档案袋正在整理中。");
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
      setInsightMessage(toHumanErrorMessage(error, copy.unknownError));
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
  const filteredCloudyArchiveItems = cloudyArchiveItems;
  const timelineGroups = groupTimelineItemsByDate(filteredTimelineItems);
  const timelinePeopleFilters = [
    { id: "all", label: "\u5168\u90e8" },
    ...people.map((person) => ({ id: person.id, label: person.name })),
  ];
  const selectedCloudyArchiveItem =
    cloudyArchiveItems.find((item) => item.id === selectedCloudyArchiveItemId) ?? null;
  const selectedCloudyArchiveLetter = selectedCloudyArchiveItem
    ? parseCloudyLetter(selectedCloudyArchiveItem.aiResponse)
    : null;
  const timelineDetailDraft = timelineDetail
      ? {
          ...timelineDetail,
          title: detailEditing ? detailTitle : timelineDetail.title,
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
  const timelineOverlayContent = pendingCloudyArchiveDeleteId ? (
    <div
      data-testid="cloudy-archive-delete-dialog"
      className="joy-card w-full max-w-sm rounded-[1.4rem] p-5"
    >
      <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[var(--primary)]">
        确认永久删除这条记录
      </h3>
      <p className="mt-3 text-[0.9rem] leading-6 text-[var(--muted)]">
        永久删除后，这条避雨记录和对应回信都无法恢复，确认要继续吗？
      </p>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleCancelCloudyArchiveDelete}
          className="rounded-full px-4 py-2 text-[0.9rem] font-semibold text-[var(--muted)]"
        >
          先保留
        </button>
        <button
          type="button"
          data-testid="cloudy-archive-delete-dialog-confirm"
          onClick={handleConfirmCloudyArchiveDelete}
          disabled={Boolean(deletingCloudyArchiveItemId)}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-4 py-2.5 text-[0.9rem] font-bold text-white disabled:opacity-70"
        >
          {deletingCloudyArchiveItemId ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          确认删除
        </button>
      </div>
    </div>
  ) : detailConfirmingDelete ? (
    <div
      data-testid="detail-delete-confirm"
      className="joy-card w-full max-w-sm rounded-[1.4rem] p-5"
    >
      <h3 className="text-[1.1rem] font-black tracking-[-0.04em] text-[var(--primary)]">
        确认永久删除这条记录
      </h3>
      <p className="mt-3 text-[0.9rem] leading-6 text-[var(--muted)]">
        永久删除后将无法恢复，确认要继续吗？
      </p>
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setDetailConfirmingDelete(false)}
          className="rounded-full px-4 py-2 text-[0.9rem] font-semibold text-[var(--muted)]"
        >
          先保留
        </button>
        <button
          type="button"
          data-testid="detail-delete-confirm-action"
          onClick={handleDetailDelete}
          disabled={detailDeleting}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-4 py-2.5 text-[0.9rem] font-bold text-white disabled:opacity-70"
        >
          {detailDeleting ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
          确认删除
        </button>
      </div>
    </div>
  ) : null;

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

  if (!session) {
    return (
      <AuthScreen
        authMode={authMode}
        email={email}
        password={password}
        errors={errors}
        authMessage={authMessage}
        onAuthMessageClear={() => setAuthMessage("")}
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
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSubmit={handleAuthSubmit}
        onToggleMode={() => {
          setAuthMode((current) => (current === "sign-in" ? "sign-up" : "sign-in"));
          setAuthMessage("");
          setErrors({});
          setPassword("");
          setRetryAfterSeconds(0);
        }}
      />
    );
  }

  return (
    <main className="joy-grid h-dvh overflow-hidden sm:px-6 sm:py-6">
      <div className="flex h-full w-full min-h-0 justify-center">
        <div className="flex h-full min-h-0 w-full sm:max-w-[38rem] sm:min-w-[20rem]">
          {activeTab === "quick-entry" ? (
            <QuickEntry
              people={people}
              mode={mode}
              selectedPersonId={selectedPersonId}
              content={content}
              reason={reason}
              displayDate={displayDate}
              saving={saving}
              uploading={uploading}
              cloudyLoading={cloudyLoading}
              cloudyLoadingMessage={cloudyLoadingMessage}
              cloudyLetter={cloudyLetter}
              message={message}
              onMessageClear={() => setMessage("")}
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
              onEnterCloudyMode={handleEnterCloudyMode}
              onExitCloudyMode={handleExitCloudyMode}
              onCloudyLetterDismiss={handleCloudyLetterDismiss}
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
              onMessageClear={() => setMessage("")}
              shellTone={cloudyArchiveOpen ? "cloudy" : "warm"}
              topBarTone="warm"
              overlayContent={timelineOverlayContent}
              topBarTitle={
                cloudyArchiveOpen || selectedTimelineEventId ? "" : undefined
              }
              topBarLeftSlot={
                cloudyArchiveOpen ? (
                  <DetailTopBarBackButton
                    onBack={
                      selectedCloudyArchiveItem
                        ? handleBackToCloudyArchiveList
                        : handleCloseCloudyArchive
                    }
                  />
                ) : selectedTimelineEventId ? (
                  <DetailTopBarBackButton onBack={handleCloseTimelineDetail} />
                ) : undefined
              }
              topBarRightSlot={
                cloudyArchiveOpen && !selectedCloudyArchiveItem ? (
                  cloudyArchiveDeleteMode ? (
                    <button
                      type="button"
                      onClick={handleCloudyArchiveDeleteModeToggle}
                      disabled={Boolean(deletingCloudyArchiveItemId)}
                      className="joy-topbar-button"
                    >
                      完成
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCloudyArchiveDeleteModeToggle}
                      disabled={Boolean(deletingCloudyArchiveItemId)}
                      className="joy-topbar-button joy-topbar-button--danger"
                    >
                      删除
                    </button>
                  )
                ) : !cloudyArchiveOpen && timelineDetailDraft ? (
                  <DetailTopBarActionButtons
                    editing={detailEditing}
                    saving={detailSaving}
                    deleting={detailDeleting}
                    onEditToggle={handleDetailEditToggle}
                    onSaveRequest={() => {
                      void saveDetailDraft();
                    }}
                    onCancelEdit={handleDetailCancelEdit}
                    onDeleteRequest={() => setDetailConfirmingDelete(true)}
                  />
                ) : undefined
              }
              detailContent={
                cloudyArchiveOpen ? (
                  <CloudyArchiveView
                    items={filteredCloudyArchiveItems}
                    loading={cloudyArchiveLoading}
                    retryingId={retryingCloudyArchiveItemId}
                    selectedItem={selectedCloudyArchiveItem}
                    selectedLetter={selectedCloudyArchiveLetter}
                    deleteMode={cloudyArchiveDeleteMode}
                    deletingItemId={deletingCloudyArchiveItemId}
                    onBackToTimeline={handleCloseCloudyArchive}
                    onOpenItem={handleOpenCloudyArchiveItem}
                    onRetryItem={handleRetryCloudyArchiveItem}
                    onBackToArchive={handleBackToCloudyArchiveList}
                    onDeleteConfirm={handleRequestCloudyArchiveDelete}
                  />
                ) : timelineDetailDraft ? (
                  <EventDetailPanel
                    event={timelineDetailDraft}
                    people={people}
                    editing={detailEditing}
                    saving={detailSaving}
                    deleting={detailDeleting}
                    uploading={detailUploading}
                    confirmingDelete={detailConfirmingDelete}
                    message={detailMessage}
                    onMessageClear={() => setDetailMessage("")}
                    selectedImageName={detailSelectedImageName}
                    imagePreviewUrl={detailImagePreviewUrl}
                    onDeleteCancel={() => setDetailConfirmingDelete(false)}
                    onDeleteConfirm={handleDetailDelete}
                    onTitleChange={(value) => {
                      setDetailTitle(value);
                      setDetailTitleTouched(true);
                    }}
                    onContentChange={setDetailContent}
                    onReasonChange={setDetailReason}
                    onDateChange={setDetailDisplayDate}
                    onPersonChange={setDetailPersonId}
                    onImageChange={handleDetailImageChange}
                    onRemoveImage={handleDetailRemoveImage}
                    onRetryInsight={handleRetryInsight}
                    onSave={handleDetailSave}
                    onCancelEdit={handleDetailCancelEdit}
                  />
                ) : selectedTimelineEventId && detailLoading ? (
                  <div className="joy-card flex items-center gap-3 rounded-[2rem] px-6 py-5 text-sm text-[var(--muted)]">
                    <LoaderCircle className="size-4 animate-spin text-[var(--primary)]" />
                    {"\u6b63\u5728\u52a0\u8f7d\u4e2d"}
                  </div>
                ) : undefined
              }
              onPersonChange={setTimelinePersonId}
              onRangeChange={handleTimelineRangeChange}
              onCustomStartDateChange={setCustomStartDate}
              onCustomEndDateChange={setCustomEndDate}
              onSummaryClick={handleOpenInsightSummary}
              onCloudyArchiveOpen={handleOpenCloudyArchive}
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
              onMessageClear={() => setInsightMessage("")}
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
	              displayName={profileDisplayName}
	              avatarUrl={
	                profileAvatarRemoved ? null : profileImagePreviewUrl ?? profileAvatarUrl
	              }
	              selectedImageName={profileSelectedImageName}
	              activeTab={activeTab}
	              message={message}
	              editing={profileEditing}
	              saving={profileSaving}
	              uploading={profileUploading}
	              onMessageClear={() => setMessage("")}
	              onRefreshApp={handleRefreshApp}
	              onLogout={handleLogout}
	              onTabChange={handleTimelineTabChange}
	              onEditProfile={() => {
	                setProfileEditing(true);
	                setMessage("");
	              }}
	              onDisplayNameChange={handleProfileDisplayNameChange}
	              onAvatarSelect={handleProfileAvatarChange}
	              onAvatarRemove={handleProfileRemoveAvatar}
	              onSaveProfile={handleSaveProfile}
	            />
          )}
        </div>
      </div>
    </main>
  );
}
