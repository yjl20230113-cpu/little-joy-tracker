import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { vi } from "vitest";
import HomePage from "./page";

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const unsubscribeMock = vi.fn();
const fromMock = vi.fn();
const generateMemoryTitlesMock = vi.fn();
const uploadImageToStorageMock = vi.fn();
const insertMock = vi.fn();
const updateMock = vi.fn();
const orMock = vi.fn();
const fetchMock = vi.fn();
const originalFetch = global.fetch;
const eqCalls: Array<{ table: string; field: string; value: unknown }> = [];

const session = {
  user: {
    id: "user-1",
  },
};

const peopleRows = [
  {
    id: "person-self",
    name: "Self",
    is_default: true,
  },
];

const baseEventRows = [
  {
    id: "event-1",
    title: "First journal day",
    content: "A quiet walk home together",
    reason: "The night breeze felt soft",
    event_type: "joy",
    ai_response: null,
    cloudy_analysis_status: null,
    image_urls: null,
    display_date: "2026-03-22",
    created_at: "2026-03-22T14:30:25+08:00",
    ai_insight_status: null,
    ai_insight_payload: null,
    persons: {
      id: "person-self",
      name: "Self",
    },
  },
];

const eventRows = baseEventRows.map((row) => ({
  ...row,
  persons: { ...row.persons },
}));

type DetailQueryResult = {
  data: {
    id: string;
    title: string;
    content: string;
    reason: string;
    image_urls: string | null;
    display_date: string;
    created_at: string;
    person_id: string;
    ai_insight_status?: "pending" | "ready" | "failed" | null;
    ai_insight_payload?: unknown;
    persons: {
      id: string;
      name: string;
    };
  };
  error: null;
};

let detailQueryResult: Promise<DetailQueryResult>;
let titleBackfillShouldAffectRow = true;
let insertSingleResults: Array<{
  data: { id: string } | null;
  error: { message: string } | null;
}> = [];

let failedCloudyRow: {
  id: string;
  content: string;
  person_id: string;
  ai_response: null;
  cloudy_analysis_status: "failed";
  display_date: string;
} | null = null;

let cloudyArchiveRows: Array<{
  id: string;
  content: string;
  person_id: string;
  ai_response: unknown;
  cloudy_analysis_status: "pending" | "ready" | "failed" | null;
  display_date: string;
  created_at: string;
}> = [];

function resetEventRows() {
  eventRows.splice(
    0,
    eventRows.length,
    ...baseEventRows.map((row) => ({
      ...row,
      persons: { ...row.persons },
    })),
  );
}

function createQueryBuilder(table: string) {
  const filters: Array<{ field: string; value: unknown }> = [];
  let orderCount = 0;
  let updatePayload: Record<string, unknown> | null = null;

  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((field: string, value: unknown) => {
      filters.push({ field, value });
      eqCalls.push({ table, field, value });
      return builder;
    }),
    limit: vi.fn(() => builder),
    or: vi.fn((value: string) => {
      orMock(value);
      return builder;
    }),
    order: vi.fn(() => {
      orderCount += 1;

      if (table === "persons" && orderCount === 1) {
        return Promise.resolve({
          data: peopleRows,
          error: null,
        });
      }

      if (
        table === "events" &&
        !filters.some((filter) => filter.field === "id")
      ) {
        if (
          filters.some(
            (filter) => filter.field === "event_type" && filter.value === "cloudy",
          ) &&
          !filters.some(
            (filter) =>
              filter.field === "cloudy_analysis_status" && filter.value === "failed",
          )
        ) {
          return Promise.resolve({
            data: cloudyArchiveRows,
            error: null,
          });
        }

        if (orderCount === 1) {
          return builder;
        }

        if (orderCount === 2) {
          return Promise.resolve({
            data: eventRows,
            error: null,
          });
        }
      }

      throw new Error(`Unexpected order query for ${table}`);
    }),
    insert: vi.fn((payload: unknown) => {
      insertMock(payload);
      return {
        select: vi.fn(() => ({
          single: vi.fn(async () => {
            const nextResult = insertSingleResults.shift() ?? {
              data: { id: "event-created" },
              error: null,
            };

            return nextResult;
          }),
        })),
      };
    }),
    update: vi.fn((payload: unknown) => {
      updatePayload =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;
      updateMock(payload);
      return builder;
    }),
    maybeSingle: vi.fn(() => {
      if (table === "profiles") {
        return Promise.resolve({
          data: null,
          error: null,
        });
      }

      if (
        table === "events" &&
        filters.some((filter) => filter.field === "event_type" && filter.value === "cloudy") &&
        filters.some(
          (filter) =>
            filter.field === "cloudy_analysis_status" && filter.value === "failed",
        )
      ) {
        return Promise.resolve({
          data: failedCloudyRow,
          error: null,
        });
      }

      if (table === "events" && updatePayload?.title) {
        return Promise.resolve({
          data: titleBackfillShouldAffectRow
            ? { id: "event-created", title: updatePayload.title }
            : null,
          error: null,
        });
      }

      throw new Error(`Unexpected maybeSingle query for ${table}`);
    }),
    single: vi.fn(() => {
      if (table === "events" && filters.some((filter) => filter.field === "id")) {
        return detailQueryResult;
      }

      throw new Error(`Unexpected single query for ${table}`);
    }),
  };

  return builder;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
      onAuthStateChange: (...args: unknown[]) => onAuthStateChangeMock(...args),
    },
    from: (...args: unknown[]) => fromMock(...args),
  },
}));

vi.mock("@/lib/memory-title-client", () => ({
  generateMemoryTitles: (...args: unknown[]) => generateMemoryTitlesMock(...args),
}));

vi.mock("@/lib/image-upload", () => ({
  uploadImageToStorage: (...args: unknown[]) => uploadImageToStorageMock(...args),
}));

vi.mock("@/components/AuthScreen", () => ({
  AuthScreen: () => <div data-testid="auth-screen">auth screen</div>,
}));

vi.mock("@/components/QuickEntry", () => ({
  QuickEntry: ({
    mode,
    selectedPersonId,
    content,
    displayDate,
    cloudyLetter,
    cloudyLoadingMessage,
    onEnterCloudyMode,
    onCloudyLetterDismiss,
    onContentChange,
    onDateChange,
    onImageChange,
    onTabChange,
    onSave,
  }: {
    mode: "JOY" | "CLOUDY";
    selectedPersonId: string;
    content: string;
    displayDate: string;
    cloudyLetter: { hug: string; analysis: string; light: string } | null;
    cloudyLoadingMessage: string;
    onEnterCloudyMode: () => void;
    onCloudyLetterDismiss: () => void;
    onContentChange: (value: string) => void;
    onDateChange: (value: string) => void;
    onImageChange: (event: {
      target: {
        files?: File[];
        value: string;
      };
    }) => void;
    onTabChange: (tab: "quick-entry" | "timeline" | "insight" | "profile") => void;
    onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  }) => (
    <form data-testid="quick-entry" onSubmit={onSave}>
      <div data-testid="mode">{mode}</div>
      <div data-testid="selected-person">{selectedPersonId}</div>
      <div data-testid="content">{content}</div>
      <div data-testid="display-date">{displayDate}</div>
      <button type="button" onClick={onEnterCloudyMode}>
        enter-cloudy
      </button>
      <button type="button" onClick={() => onTabChange("timeline")}>
        go-timeline
      </button>
      <button
        type="button"
        onClick={() => onContentChange("A quiet walk home together")}
      >
        set-content
      </button>
      <button type="button" onClick={() => onDateChange("2025-03-12")}>
        set-cloudy-date
      </button>
      <button
        type="button"
        onClick={() =>
          onImageChange({
            target: {
              files: [new File(["image"], "cover.jpg", { type: "image/jpeg" })],
              value: "",
            },
          })
        }
      >
        set-image
      </button>
      {cloudyLoadingMessage ? (
        <div data-testid="cloudy-loading">{cloudyLoadingMessage}</div>
      ) : null}
      {cloudyLetter ? (
        <>
          <div data-testid="cloudy-letter">{cloudyLetter.hug}</div>
          <button type="button" onClick={onCloudyLetterDismiss}>
            dismiss-letter
          </button>
        </>
      ) : null}
      <button type="submit">save-entry</button>
    </form>
  ),
}));

vi.mock("@/components/ProfileView", () => ({
  ProfileView: () => <div data-testid="profile-view">profile view</div>,
}));

vi.mock("@/components/InsightView", () => ({
  InsightView: ({
    customStartDate,
    customEndDate,
    onGenerate,
  }: {
    customStartDate: string;
    customEndDate: string;
    onGenerate: () => void;
  }) => (
    <div data-testid="insight-view">
      <div data-testid="insight-start-date">{customStartDate}</div>
      <div data-testid="insight-end-date">{customEndDate}</div>
      <button type="button" onClick={onGenerate}>
        generate-summary
      </button>
    </div>
  ),
}));

vi.mock("@/components/DetailTopBarControls", () => ({
  DetailTopBarBackButton: () => <button type="button">back</button>,
  DetailTopBarActionButtons: () => <div data-testid="detail-actions">actions</div>,
}));

vi.mock("@/components/EventDetailPanel", () => ({
  EventDetailPanel: ({
    event,
  }: {
    event: {
      title?: string | null;
      content: string;
      aiInsightStatus?: string | null;
    };
  }) => (
    <div data-testid="event-detail-panel">
      <p>{event.title}</p>
      <p>{event.content}</p>
      <p data-testid="event-detail-ai-status">{event.aiInsightStatus ?? "none"}</p>
    </div>
  ),
}));

vi.mock("@/components/TimelineView", () => ({
  TimelineView: ({
    groups,
    customStartDate,
    customEndDate,
    detailContent,
    onCustomStartDateChange,
    onCustomEndDateChange,
    onEventOpen,
    onSummaryClick,
    onCloudyArchiveOpen,
    onTabChange,
  }: {
    groups: Array<{ items: Array<{ id: string }> }>;
    customStartDate: string;
    customEndDate: string;
    detailContent?: React.ReactNode;
    onCustomStartDateChange: (value: string) => void;
    onCustomEndDateChange: (value: string) => void;
    onEventOpen: (eventId: string) => void;
    onSummaryClick: () => void;
    onCloudyArchiveOpen?: () => void;
    onTabChange: (tab: "quick-entry" | "timeline" | "insight" | "profile") => void;
  }) => (
    <div data-testid="timeline-view">
      <div data-testid="timeline-start-date">{customStartDate}</div>
      <div data-testid="timeline-end-date">{customEndDate}</div>
      <button type="button" onClick={() => onTabChange("quick-entry")}>
        go-quick-entry
      </button>
      <button
        type="button"
        onClick={() => onCustomStartDateChange("2026-03-20")}
      >
        set-timeline-start
      </button>
      <button
        type="button"
        onClick={() => onCustomEndDateChange("2026-03-22")}
      >
        set-timeline-end
      </button>
      <button type="button" onClick={onSummaryClick}>
        open-insight-summary
      </button>
      <button type="button" onClick={onCloudyArchiveOpen}>
        open-cloudy-archive
      </button>
      {groups[0]?.items[0] ? (
        <button
          type="button"
          onClick={() => onEventOpen(groups[0].items[0].id)}
        >
          open-event-1
        </button>
      ) : (
        <div data-testid="timeline-items-pending">timeline-items-pending</div>
      )}
      <div data-testid="detail-mode">{detailContent ? "detail" : "list"}</div>
      {detailContent}
    </div>
  ),
}));

describe("HomePage bootstrapping", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    unsubscribeMock.mockReset();
    fromMock.mockReset();
    generateMemoryTitlesMock.mockReset();
    insertMock.mockReset();
    updateMock.mockReset();
    orMock.mockReset();
    uploadImageToStorageMock.mockReset();
    fetchMock.mockReset();
    eqCalls.length = 0;
    global.fetch = fetchMock as typeof fetch;
    resetEventRows();
    titleBackfillShouldAffectRow = true;
    insertSingleResults = [];
    failedCloudyRow = null;
    cloudyArchiveRows = [];
    eventRows[0].ai_insight_status = null;
    eventRows[0].ai_insight_payload = null;

    detailQueryResult = Promise.resolve({
      data: {
        id: "event-1",
        title: "First journal day",
        content: "A quiet walk home together",
        reason: "The night breeze felt soft",
        image_urls: null,
        display_date: "2026-03-22",
        created_at: "2026-03-22T14:30:25+08:00",
        person_id: "person-self",
        ai_insight_status: null,
        ai_insight_payload: null,
        persons: {
          id: "person-self",
          name: "Self",
        },
      },
      error: null,
    });

    fromMock.mockImplementation((table: string) => createQueryBuilder(table));
    generateMemoryTitlesMock.mockResolvedValue(["春日晚风"]);
    uploadImageToStorageMock.mockResolvedValue({
      publicUrl: "https://cdn.example.com/cover.jpg",
    });

    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("falls back to the auth screen when getting the initial Supabase session fails", async () => {
    getSessionMock.mockRejectedValueOnce(new Error("Supabase unavailable"));

    render(<HomePage />);

    expect(screen.getByText("正在连接 Supabase...")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("auth-screen")).toBeInTheDocument();
    });
  });

  it("stops booting and falls back to the auth screen when the initial session request hangs", async () => {
    vi.useFakeTimers();
    getSessionMock.mockImplementationOnce(
      () => new Promise(() => undefined),
    );

    render(<HomePage />);

    expect(screen.getByText("正在连接 Supabase...")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByTestId("auth-screen")).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("shows timeline detail immediately from cached list data while the fresh detail request is still pending", async () => {
    window.history.replaceState({}, "", "/?tab=timeline");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    eventRows[0].ai_insight_status = "pending";
    eventRows[0].ai_insight_payload = null;

    detailQueryResult = new Promise<DetailQueryResult>(() => undefined);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "open-event-1" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "open-event-1" }));

    expect(screen.getByTestId("detail-mode")).toHaveTextContent("detail");
    expect(screen.getByTestId("event-detail-panel")).toHaveTextContent("First journal day");
    expect(screen.getByTestId("event-detail-panel")).toHaveTextContent(
      "A quiet walk home together",
    );
    expect(screen.getByTestId("event-detail-ai-status")).toHaveTextContent("pending");
  });

  it("keeps the timeline date range when opening insight auto-analysis from the log view", async () => {
    window.history.replaceState({}, "", "/?tab=timeline");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    eventRows.push({
      id: "event-2",
      title: "Older memory",
      content: "An older memory outside the selected range",
      reason: "Still a good day",
      image_urls: null,
      display_date: "2026-03-10",
      created_at: "2026-03-10T08:30:00+08:00",
      ai_insight_status: null,
      ai_insight_payload: null,
      persons: {
        id: "person-self",
        name: "Self",
      },
    });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        mood_weather: {
          title: "Warm Sun",
          icon: "Sun",
          score: 85,
          description: "Bright and steady.",
        },
        keywords: ["walk", "breeze", "sunlight", "calm", "home"],
        personality: {
          title: "Detail Collector",
          description: "You notice small moments and keep them close.",
        },
        suggestions: [
          {
            title: "Evening walk",
            content: "Keep a short walk after dinner.",
            icon: "TreePine",
          },
          {
            title: "Quick note",
            content: "Write down one bright moment each day.",
            icon: "Sparkles",
          },
        ],
      }),
    } as Response);

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "open-insight-summary" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "set-timeline-start" }));
    fireEvent.click(screen.getByRole("button", { name: "set-timeline-end" }));

    await waitFor(() => {
      expect(screen.getByTestId("timeline-start-date")).toHaveTextContent("2026-03-20");
      expect(screen.getByTestId("timeline-end-date")).toHaveTextContent("2026-03-22");
    });

    fireEvent.click(screen.getByRole("button", { name: "open-insight-summary" }));

    await waitFor(() => {
      expect(screen.getByTestId("insight-view")).toBeInTheDocument();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/summary",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    expect(screen.getByTestId("insight-start-date")).toHaveTextContent("2026-03-20");
    expect(screen.getByTestId("insight-end-date")).toHaveTextContent("2026-03-22");

    const summaryCall = fetchMock.mock.calls.find(
      ([input]) => String(input) === "/api/summary",
    );
    const requestInit = summaryCall?.[1] as RequestInit | undefined;
    const requestBody = JSON.parse(String(requestInit?.body ?? "{}")) as {
      events: Array<{ content: string }>;
    };

    expect(requestBody.events).toHaveLength(1);
    expect(requestBody.events[0]?.content).toBe("A quiet walk home together");
  });

  it("inserts immediately, then backfills the AI title (4-6 chars) after save", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    generateMemoryTitlesMock.mockResolvedValueOnce(["春日晚风"]);
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes("/api/generate-auto-image")) {
        return new Promise(() => undefined);
      }

      if (String(input).includes("/api/event-insight")) {
        return new Promise(() => undefined);
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-person")).toHaveTextContent("person-self");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-content" }));
    fireEvent.click(screen.getByRole("button", { name: "save-entry" }));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalled();
    });

    const inserted = insertMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(inserted).toBeTruthy();
    expect(inserted.content).toBe("A quiet walk home together");
    expect("title" in inserted).toBe(false);
    expect(inserted.ai_insight_status).toBe("pending");
    expect(inserted.ai_insight_payload).toBeNull();
    expect(inserted.auto_image_status).toBe("pending");
    expect(inserted.auto_image_payload).toBeNull();

    await waitFor(() => {
      expect(generateMemoryTitlesMock).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/generate-auto-image",
        expect.objectContaining({
          method: "POST",
        }),
      );
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "春日晚风",
        }),
      );
      expect(orMock).toHaveBeenCalledWith('title.is.null,title.eq.\"\"');
    });

    // Should only start generating title after the insert succeeded.
    expect(insertMock.mock.invocationCallOrder[0]).toBeLessThan(
      generateMemoryTitlesMock.mock.invocationCallOrder[0],
    );
  });

  it("saves immediately even when AI title generation is slow", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    generateMemoryTitlesMock.mockImplementationOnce(() => new Promise(() => {}));
    fetchMock.mockImplementation(() => new Promise(() => {}));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-person")).toHaveTextContent("person-self");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-content" }));
    fireEvent.click(screen.getByRole("button", { name: "save-entry" }));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalled();
    });
  });

  it("falls back to a plain save when the auto image schema is unavailable", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    insertSingleResults = [
      {
        data: null,
        error: {
          message:
            "Could not find the 'auto_image_payload' column of 'events' in the schema cache",
        },
      },
      {
        data: { id: "event-created" },
        error: null,
      },
    ];
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes("/api/event-insight")) {
        return new Promise(() => undefined);
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-person")).toHaveTextContent("person-self");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-content" }));
    fireEvent.click(screen.getByRole("button", { name: "save-entry" }));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalledTimes(2);
    });

    const firstInserted = insertMock.mock.calls[0]?.[0] as Record<string, unknown>;
    const secondInserted = insertMock.mock.calls[1]?.[0] as Record<string, unknown>;

    expect(firstInserted.auto_image_status).toBe("pending");
    expect(firstInserted.auto_image_payload).toBeNull();
    expect(secondInserted.auto_image_status).toBeUndefined();
    expect(secondInserted.auto_image_payload).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/generate-auto-image",
      expect.anything(),
    );
  });

  it("skips auto-image generation when the user uploaded a photo before saving", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes("/api/event-insight")) {
        return new Promise(() => undefined);
      }

      throw new Error(`Unexpected fetch: ${String(input)}`);
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-person")).toHaveTextContent("person-self");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-content" }));
    fireEvent.click(screen.getByRole("button", { name: "set-image" }));

    await waitFor(() => {
      expect(uploadImageToStorageMock).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "save-entry" }));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalled();
    });

    const inserted = insertMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(inserted.image_urls).toBe("[\"https://cdn.example.com/cover.jpg\"]");
    expect(inserted.auto_image_status).toBeUndefined();
    expect(inserted.auto_image_payload).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/generate-auto-image",
      expect.anything(),
    );
  });

  it("saves a cloudy record immediately and keeps the reply in the archive flow", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    fetchMock.mockImplementation(() => new Promise(() => undefined));

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-person")).toHaveTextContent("person-self");
    });

    fireEvent.click(screen.getByRole("button", { name: "enter-cloudy" }));
    expect(screen.getByTestId("mode")).toHaveTextContent("CLOUDY");

    fireEvent.click(screen.getByRole("button", { name: "set-cloudy-date" }));
    fireEvent.click(screen.getByRole("button", { name: "set-content" }));
    fireEvent.click(screen.getByRole("button", { name: "save-entry" }));

    await waitFor(() => {
      expect(insertMock).toHaveBeenCalled();
    });

    const inserted = insertMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(inserted.event_type).toBe("cloudy");
    expect(inserted.person_id).toBe("person-self");
    expect(inserted.display_date).toBe("2025-03-12");
    expect(inserted.ai_response).toBeNull();
    expect(inserted.cloudy_analysis_status).toBe("pending");

    await waitFor(() => {
      expect(screen.getByTestId("mode")).toHaveTextContent("CLOUDY");
      expect(screen.getByTestId("content")).toBeEmptyDOMElement();
      expect(screen.queryByTestId("cloudy-loading")).not.toBeInTheDocument();
      expect(screen.queryByTestId("cloudy-letter")).not.toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/cloudy-analysis",
      expect.objectContaining({
        method: "POST",
      }),
    );
  });

  it("keeps cloudy draft state when switching tabs away and back", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("selected-person")).toHaveTextContent("person-self");
    });

    fireEvent.click(screen.getByRole("button", { name: "enter-cloudy" }));
    fireEvent.click(screen.getByRole("button", { name: "set-content" }));

    expect(screen.getByTestId("mode")).toHaveTextContent("CLOUDY");
    expect(screen.getByTestId("content")).toHaveTextContent("A quiet walk home together");

    fireEvent.click(screen.getByRole("button", { name: "go-timeline" }));

    await waitFor(() => {
      expect(screen.getByTestId("timeline-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "go-quick-entry" }));

    await waitFor(() => {
      expect(screen.getByTestId("quick-entry")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mode")).toHaveTextContent("CLOUDY");
    expect(screen.getByTestId("content")).toHaveTextContent("A quiet walk home together");
  });

  it("retries the latest failed cloudy record on return and keeps the timeline query joy-only", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    failedCloudyRow = {
      id: "cloudy-failed-1",
      content: "今天真的有点撑不住。",
      person_id: "person-self",
      ai_response: null,
      cloudy_analysis_status: "failed",
      display_date: "2026-03-22",
    };
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes("/api/cloudy-analysis")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            hug: "我知道你已经撑得很久了。",
            analysis: "乌云只是暂时挡住了天光。",
            light: "摸一摸杯壁的温度，让手心先回到这里。",
          }),
        });
      }

      return new Promise(() => undefined);
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_response: {
            hug: "我知道你已经撑得很久了。",
            analysis: "乌云只是暂时挡住了天光。",
            light: "摸一摸杯壁的温度，让手心先回到这里。",
          },
          cloudy_analysis_status: "ready",
        }),
      );
    });

    expect(screen.queryByTestId("cloudy-letter")).not.toBeInTheDocument();
    expect(
      eqCalls.some(
        (call) =>
          call.table === "events" &&
          call.field === "event_type" &&
          call.value === "joy",
      ),
    ).toBe(true);
  });

  it("opens the cloudy archive inside timeline and shows stored ready letters without refetching", async () => {
    window.history.replaceState({}, "", "/?tab=timeline");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    cloudyArchiveRows = [
      {
        id: "cloudy-ready-1",
        content: "今天在会议上突然被点名，心里一直在发沉。",
        person_id: "person-self",
        ai_response: {
          hug: "我听见那一下的慌乱。",
          analysis: "那不是你不够好，只是场面太急了。",
          light: "先去窗边站一分钟。",
        },
        cloudy_analysis_status: "ready",
        display_date: "2026-03-26",
        created_at: "2026-03-26T11:20:00+08:00",
      },
    ];

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("timeline-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "open-cloudy-archive" }));

    await waitFor(() => {
      expect(screen.getByText("解忧档案袋")).toBeInTheDocument();
      expect(screen.getByText("今天在会议上突然被点名，心里一直在发沉。")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /今天在会议上突然被点名/ }),
    );

    await waitFor(() => {
      expect(screen.getByText("抱抱")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "回到档案袋" })).toBeInTheDocument();
    });

    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/cloudy-analysis",
      expect.anything(),
    );
  });

  it("retries a failed cloudy archive record in place without inserting a new event", async () => {
    window.history.replaceState({}, "", "/?tab=timeline");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    cloudyArchiveRows = [
      {
        id: "cloudy-failed-archive-1",
        content: "今天整个人像被阴雨泡皱了。",
        person_id: "person-self",
        ai_response: null,
        cloudy_analysis_status: "failed",
        display_date: "2026-03-26",
        created_at: "2026-03-26T08:00:00+08:00",
      },
    ];
    fetchMock.mockImplementation((input: RequestInfo | URL) => {
      if (String(input).includes("/api/cloudy-analysis")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            hug: "我知道你今天走得很重。",
            analysis: "这不是你的错，只是身体在提醒你慢一点。",
            light: "去洗手台用冷水拍拍脸。",
          }),
        });
      }

      return new Promise(() => undefined);
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("timeline-view")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "open-cloudy-archive" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "重试回信" })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "重试回信" }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: "cloudy",
          content: "今天整个人像被阴雨泡皱了。",
          cloudy_analysis_status: "pending",
        }),
      );
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_response: {
            hug: "我知道你今天走得很重。",
            analysis: "这不是你的错，只是身体在提醒你慢一点。",
            light: "去洗手台用冷水拍拍脸。",
          },
          cloudy_analysis_status: "ready",
        }),
      );
    });

    expect(insertMock).not.toHaveBeenCalled();
  });
});
