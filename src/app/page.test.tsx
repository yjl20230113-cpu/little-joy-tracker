import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { vi } from "vitest";
import HomePage from "./page";

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const unsubscribeMock = vi.fn();
const fromMock = vi.fn();
const generateMemoryTitlesMock = vi.fn();
const insertMock = vi.fn();
const updateMock = vi.fn();
const orMock = vi.fn();
const fetchMock = vi.fn();
const originalFetch = global.fetch;

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

const eventRows = [
  {
    id: "event-1",
    title: "First journal day",
    content: "A quiet walk home together",
    reason: "The night breeze felt soft",
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

function createQueryBuilder(table: string) {
  const filters: Array<{ field: string; value: unknown }> = [];
  let orderCount = 0;
  let updatePayload: Record<string, unknown> | null = null;

  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((field: string, value: unknown) => {
      filters.push({ field, value });
      return builder;
    }),
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
          single: vi.fn(async () => ({
            data: { id: "event-created" },
            error: null,
          })),
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

vi.mock("@/components/AuthScreen", () => ({
  AuthScreen: () => <div data-testid="auth-screen">auth screen</div>,
}));

vi.mock("@/components/QuickEntry", () => ({
  QuickEntry: ({
    selectedPersonId,
    onContentChange,
    onSave,
  }: {
    selectedPersonId: string;
    onContentChange: (value: string) => void;
    onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  }) => (
    <form data-testid="quick-entry" onSubmit={onSave}>
      <div data-testid="selected-person">{selectedPersonId}</div>
      <button
        type="button"
        onClick={() => onContentChange("A quiet walk home together")}
      >
        set-content
      </button>
      <button type="submit">save-entry</button>
    </form>
  ),
}));

vi.mock("@/components/ProfileView", () => ({
  ProfileView: () => <div data-testid="profile-view">profile view</div>,
}));

vi.mock("@/components/InsightView", () => ({
  InsightView: () => <div data-testid="insight-view">insight view</div>,
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
    detailContent,
    onEventOpen,
  }: {
    groups: Array<{ items: Array<{ id: string }> }>;
    detailContent?: React.ReactNode;
    onEventOpen: (eventId: string) => void;
  }) => (
    <div data-testid="timeline-view">
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
    fetchMock.mockReset();
    global.fetch = fetchMock as typeof fetch;
    titleBackfillShouldAffectRow = true;
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

  it("inserts immediately, then backfills the AI title (4-6 chars) after save", async () => {
    window.history.replaceState({}, "", "/?tab=quick-entry");
    getSessionMock.mockResolvedValueOnce({
      data: {
        session,
      },
    });
    generateMemoryTitlesMock.mockResolvedValueOnce(["春日晚风"]);

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

    await waitFor(() => {
      expect(generateMemoryTitlesMock).toHaveBeenCalled();
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
});
