import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import EventDetailPage from "./page";

const getSessionMock = vi.fn();
const fromMock = vi.fn();
const updateMock = vi.fn();
const fetchMock = vi.fn();
const originalFetch = global.fetch;

const replaceMock = vi.fn();
const pushMock = vi.fn();

const baseInsightPayload = {
  unseen_joy: {
    title: "你没意识到的小幸福",
    content: "你愿意把这件小事写下来，本身就在说明你还保留着发现美好的能力。",
  },
  highlight: {
    title: "亮点",
    content: "你没有只记录发生了什么，也留下了自己被触动的方式，这让平凡的一刻变得更亮。",
  },
  gentle_reflection:
    "你没有只记录发生了什么，也留下了自己被触动的方式，这让平凡的一刻变得更亮。",
  emotion_signal: {
    title: "情绪被安放",
    content: "这条记录里有一种慢下来后被轻轻接住的感觉。",
  },
  relationship_signal: {
    title: "和世界重新靠近",
    content: "你在这件事里重新和周围的人与环境建立了细小连接。",
  },
  value_signal: {
    title: "珍惜细小变化",
    content: "你看重的不只是结果，也是在意那些慢慢发生的变化。",
  },
};

const eventRow = {
  id: "event-1",
  title: "春日晚风",
  content: "我和自己散步回家，路上风很轻。",
  reason: "突然觉得今天没有那么赶了。",
  image_urls: "[\"https://images.unsplash.com/photo-1\"]",
  display_date: "2026-03-24",
  created_at: "2026-03-24T00:18:00+08:00",
  person_id: "person-self",
  ai_insight_status: "ready",
  ai_insight_payload: baseInsightPayload,
  auto_image_status: "ready",
  auto_image_payload: {
    source: "unsplash",
    photoId: "photo-1",
    query: "calm water ripples",
    keywords: ["calm water ripples"],
    photoPageUrl: "https://unsplash.com/photos/photo-1",
    photographerName: "A Photographer",
    photographerProfileUrl: "https://unsplash.com/@photographer",
    downloadLocation: "https://api.unsplash.com/photos/photo-1/download",
  },
  persons: {
    id: "person-self",
    name: "自己",
  },
};

const peopleRows = [{ id: "person-self", name: "自己", is_default: true }];

function createQueryBuilder(table: string) {
  const filters: Array<{ field: string; value: unknown }> = [];
  let updatePayload: Record<string, unknown> | null = null;

  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn((field: string, value: unknown) => {
      filters.push({ field, value });
      return builder;
    }),
    order: vi.fn(() => Promise.resolve({ data: peopleRows, error: null })),
    update: vi.fn((payload: unknown) => {
      updatePayload =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : null;
      updateMock(payload);
      return builder;
    }),
    or: vi.fn(() => builder),
    maybeSingle: vi.fn(() =>
      Promise.resolve({
        data: { id: "event-1", title: "春日晚风" },
        error: null,
      }),
    ),
    single: vi.fn(() => {
      if (table === "events" && !updatePayload) {
        return Promise.resolve({
          data: eventRow,
          error: null,
        });
      }

      if (table === "events" && updatePayload) {
        return Promise.resolve({
          data: {
            ...eventRow,
            ...updatePayload,
            ai_insight_status:
              (updatePayload.ai_insight_status as string | undefined) ?? eventRow.ai_insight_status,
            ai_insight_payload:
              updatePayload.ai_insight_payload !== undefined
                ? updatePayload.ai_insight_payload
                : eventRow.ai_insight_payload,
          },
          error: null,
        });
      }

      throw new Error(`Unexpected single query for ${table}`);
    }),
  };

  return builder;
}

vi.mock("next/navigation", () => ({
  useParams: () => ({
    id: "event-1",
  }),
  useRouter: () => ({
    replace: replaceMock,
    push: pushMock,
  }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => getSessionMock(...args),
    },
    from: (...args: unknown[]) => fromMock(...args),
    storage: {},
  },
}));

vi.mock("@/lib/memory-title-client", () => ({
  generateMemoryTitles: vi.fn(async () => ["春日晚风"]),
}));

vi.mock("@/lib/image-upload", () => ({
  uploadImageToStorage: vi.fn(),
}));

vi.mock("@/components/DetailTopBarControls", () => ({
  DetailTopBarBackButton: () => <button type="button">back</button>,
  DetailTopBarActionButtons: ({
    onEditToggle,
  }: {
    onEditToggle: () => void;
  }) => (
    <button type="button" onClick={onEditToggle}>
      toggle-edit
    </button>
  ),
}));

vi.mock("@/components/TimelineView", () => ({
  TimelineView: ({
    detailContent,
    topBarRightSlot,
  }: {
    detailContent?: React.ReactNode;
    topBarRightSlot?: React.ReactNode;
  }) => (
    <div data-testid="timeline-view">
      {topBarRightSlot}
      {detailContent}
    </div>
  ),
}));

vi.mock("@/components/EventDetailPanel", () => ({
  EventDetailPanel: ({
    event,
    editing,
    onContentChange,
    onRemoveImage,
    onSave,
  }: {
    event: {
      title?: string | null;
      content: string;
      aiInsightStatus?: string | null;
      aiInsight?: { highlight?: { title?: string } } | null;
    };
    editing: boolean;
    onContentChange: (value: string) => void;
    onRemoveImage: () => void;
    onSave: (event: React.FormEvent<HTMLFormElement>) => void;
  }) => (
    <form data-testid="event-detail-panel" onSubmit={onSave}>
      <p>{event.title}</p>
      <p>{event.content}</p>
      <p data-testid="event-detail-ai-status">{event.aiInsightStatus ?? "none"}</p>
      <p data-testid="event-detail-ai-title">{event.aiInsight?.highlight?.title ?? ""}</p>
      {editing ? (
        <button
          type="button"
          onClick={() => onContentChange("编辑后的内容")}
        >
          change-content
        </button>
      ) : null}
      {editing ? (
        <button type="button" onClick={onRemoveImage}>
          remove-image
        </button>
      ) : null}
      {editing ? <button type="submit">save-detail</button> : null}
    </form>
  ),
}));

describe("EventDetailPage", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    fromMock.mockReset();
    updateMock.mockReset();
    fetchMock.mockReset();
    replaceMock.mockReset();
    pushMock.mockReset();
    global.fetch = fetchMock as typeof fetch;

    getSessionMock.mockResolvedValue({
      data: {
        session: {
          user: {
            id: "user-1",
          },
        },
      },
    });

    fromMock.mockImplementation((table: string) => createQueryBuilder(table));
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("reuses the persisted AI result instead of regenerating it on every revisit", async () => {
    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("event-detail-ai-status")).toHaveTextContent("ready");
    });

    expect(screen.getByTestId("event-detail-ai-title")).toHaveTextContent("亮点");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("marks AI as pending again after an edit so the waiting state can be shown after save", async () => {
    fetchMock.mockImplementation(() => new Promise(() => undefined));

    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("event-detail-ai-status")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "toggle-edit" }));
    fireEvent.click(screen.getByRole("button", { name: "change-content" }));
    fireEvent.click(screen.getByRole("button", { name: "save-detail" }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ai_insight_status: "pending",
          ai_insight_payload: null,
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("event-detail-ai-status")).toHaveTextContent("pending");
    });
  });

  it("clears auto-image persistence when the user removes the image while editing", async () => {
    render(<EventDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("event-detail-ai-status")).toHaveTextContent("ready");
    });

    fireEvent.click(screen.getByRole("button", { name: "toggle-edit" }));
    fireEvent.click(screen.getByRole("button", { name: "remove-image" }));
    fireEvent.click(screen.getByRole("button", { name: "save-detail" }));

    await waitFor(() => {
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          image_urls: null,
          auto_image_status: null,
          auto_image_payload: null,
        }),
      );
    });
  });
});
