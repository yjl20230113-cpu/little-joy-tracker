import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import HomePage from "./page";

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const unsubscribeMock = vi.fn();
const fromMock = vi.fn();
const profileUpsertMock = vi.fn();
const personUpdateMock = vi.fn();

const session = {
  user: {
    id: "user-1",
    email: "joy@example.com",
  },
};

const peopleRows = [
  {
    id: "person-self",
    name: "自己",
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
    persons: {
      id: "person-self",
      name: "自己",
    },
  },
];

let profileRow:
  | {
      user_id: string;
      display_name: string;
      avatar_url: string | null;
    }
  | null;

function createQueryBuilder(table: string) {
  const filters: Record<string, unknown> = {};
  let operation: "select" | "update" | null = null;

  const builder = {
    select: vi.fn(() => {
      operation = "select";
      return builder;
    }),
    eq: vi.fn((field: string, value: unknown) => {
      filters[field] = value;
      return builder;
    }),
    maybeSingle: vi.fn(() => {
      if (table !== "profiles" || operation !== "select") {
        throw new Error(`Unexpected maybeSingle query for ${table}`);
      }

      return Promise.resolve({
        data: profileRow,
        error: null,
      });
    }),
    order: vi.fn(() => {
      if (table === "persons") {
        return Promise.resolve({
          data: peopleRows,
          error: null,
        });
      }

      if (table === "events") {
        return builder;
      }

      throw new Error(`Unexpected order query for ${table}`);
    }),
    upsert: vi.fn((payload: unknown) => {
      if (table !== "profiles") {
        throw new Error(`Unexpected upsert query for ${table}`);
      }

      profileUpsertMock(payload);
      return Promise.resolve({ error: null });
    }),
    update: vi.fn((payload: unknown) => {
      if (table !== "persons") {
        throw new Error(`Unexpected update query for ${table}`);
      }

      operation = "update";
      personUpdateMock(payload);
      return builder;
    }),
    match: vi.fn((value: Record<string, unknown>) => {
      Object.assign(filters, value);

      if (table === "persons" && operation === "update") {
        peopleRows[0] = {
          ...peopleRows[0],
          ...(personUpdateMock.mock.calls.at(-1)?.[0] as { name?: string }),
        };

        return Promise.resolve({ error: null });
      }

      throw new Error(`Unexpected match query for ${table}`);
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
      signOut: vi.fn(),
    },
    from: (...args: unknown[]) => fromMock(...args),
    storage: {},
  },
}));

vi.mock("@/components/AuthScreen", () => ({
  AuthScreen: () => <div data-testid="auth-screen">auth screen</div>,
}));

vi.mock("@/components/QuickEntry", () => ({
  QuickEntry: () => <div data-testid="quick-entry">quick entry</div>,
}));

vi.mock("@/components/InsightView", () => ({
  InsightView: () => <div data-testid="insight-view">insight view</div>,
}));

vi.mock("@/components/TimelineView", () => ({
  TimelineView: () => <div data-testid="timeline-view">timeline view</div>,
}));

vi.mock("@/components/DetailTopBarControls", () => ({
  DetailTopBarBackButton: () => <button type="button">back</button>,
  DetailTopBarActionButtons: () => <div data-testid="detail-actions">actions</div>,
}));

vi.mock("@/components/EventDetailPanel", () => ({
  EventDetailPanel: () => <div data-testid="event-detail-panel">detail panel</div>,
}));

vi.mock("@/components/ProfileView", () => ({
  ProfileView: ({
    displayName,
    avatarUrl,
    email,
    editing,
    saving,
    onEditProfile,
    onDisplayNameChange,
    onSaveProfile,
  }: {
    displayName: string;
    avatarUrl: string | null;
    email: string;
    editing: boolean;
    saving: boolean;
    onEditProfile: () => void;
    onDisplayNameChange: (value: string) => void;
    onSaveProfile: () => void;
  }) => (
    <div data-testid="profile-view">
      <div data-testid="profile-email">{email}</div>
      <div data-testid="profile-name">{displayName}</div>
      <div data-testid="profile-avatar">{avatarUrl ?? "no-avatar"}</div>
      <div data-testid="profile-editing">{editing ? "editing" : "readonly"}</div>
      <div data-testid="profile-saving">{saving ? "saving" : "idle"}</div>
      <button type="button" onClick={onEditProfile}>
        edit-profile
      </button>
      <button type="button" onClick={() => onDisplayNameChange("Joy Chen")}>
        change-name
      </button>
      <button type="button" onClick={onSaveProfile}>
        save-profile
      </button>
    </div>
  ),
}));

describe("HomePage profile flow", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    unsubscribeMock.mockReset();
    fromMock.mockReset();
    profileUpsertMock.mockReset();
    personUpdateMock.mockReset();

    peopleRows[0] = {
      id: "person-self",
      name: "自己",
      is_default: true,
    };
    profileRow = {
      user_id: "user-1",
      display_name: "Joy",
      avatar_url: "https://example.com/avatar.jpg",
    };

    getSessionMock.mockResolvedValue({
      data: {
        session,
      },
    });
    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });
    fromMock.mockImplementation((table: string) => createQueryBuilder(table));
  });

  it("loads the persisted profile into the profile view", async () => {
    window.history.replaceState({}, "", "/?tab=profile");

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("profile-name")).toHaveTextContent("Joy");
    });

    expect(screen.getByTestId("profile-email")).toHaveTextContent("joy@example.com");
    expect(screen.getByTestId("profile-name")).toHaveTextContent("Joy");
    expect(screen.getByTestId("profile-avatar")).toHaveTextContent(
      "https://example.com/avatar.jpg",
    );
  });

  it("saves the profile and syncs the default person name", async () => {
    window.history.replaceState({}, "", "/?tab=profile");

    render(<HomePage />);

    await waitFor(() => {
      expect(screen.getByTestId("profile-name")).toHaveTextContent("Joy");
    });

    expect(screen.getByTestId("profile-editing")).toHaveTextContent("readonly");
    fireEvent.click(screen.getByRole("button", { name: "edit-profile" }));
    await waitFor(() => {
      expect(screen.getByTestId("profile-editing")).toHaveTextContent("editing");
    });
    fireEvent.click(screen.getByRole("button", { name: "change-name" }));
    fireEvent.click(screen.getByRole("button", { name: "save-profile" }));

    await waitFor(() => {
      expect(profileUpsertMock).toHaveBeenCalled();
      expect(profileUpsertMock.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          user_id: "user-1",
          display_name: "Joy Chen",
          avatar_url: "https://example.com/avatar.jpg",
        }),
      );
    });

    expect(personUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Joy Chen",
      }),
    );
    expect(screen.getByTestId("profile-name")).toHaveTextContent("Joy Chen");
    expect(screen.getByTestId("profile-editing")).toHaveTextContent("readonly");
  });
});
