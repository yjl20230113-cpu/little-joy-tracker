import { render, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import { vi } from "vitest";
import HomePage from "./page";

const getSessionMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const unsubscribeMock = vi.fn();

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
  },
}));

vi.mock("@/components/AuthScreen", () => ({
  AuthScreen: () => <div data-testid="auth-screen">auth screen</div>,
}));

describe("HomePage bootstrapping", () => {
  beforeEach(() => {
    getSessionMock.mockReset();
    onAuthStateChangeMock.mockReset();
    unsubscribeMock.mockReset();

    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: unsubscribeMock,
        },
      },
    });
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
});
