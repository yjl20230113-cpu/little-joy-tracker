import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { useState } from "react";
import { vi } from "vitest";
import { AuthScreen } from "./AuthScreen";

describe("AuthScreen", () => {
  const baseCopy = {
    signInTitle: "欢迎回来",
    signUpTitle: "创建你的新账号",
    signInDescription: "输入邮箱和密码，直接回到你的速记页面。",
    signUpDescription: "第一次使用就在这里注册，成功后会直接进入应用。",
    emailLabel: "邮箱地址",
    passwordLabel: "密码",
    emailPlaceholder: "you@example.com",
    passwordPlaceholder: "请输入密码",
    signIn: "登录进入小美好",
    signUp: "注册并进入应用",
    processing: "处理中...",
    switchToSignUp: "还没有账号？去注册",
    switchToSignIn: "已有账号？去登录",
  };

  function renderAuthScreen(
    overrides: Partial<ComponentProps<typeof AuthScreen>> = {},
  ) {
    return render(
      <AuthScreen
        authMode="sign-in"
        email=""
        password=""
        errors={{}}
        authMessage=""
        authLoading={false}
        retryAfterSeconds={0}
        copy={baseCopy}
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => {}}
        onToggleMode={() => {}}
        {...overrides}
      />,
    );
  }

  it("renders a fully localized auth screen without the removed hint bar", () => {
    renderAuthScreen();

    expect(screen.getByText("Little Joy Tracker")).toBeInTheDocument();
    expect(screen.getByText("继续记录今天的小美好")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "欢迎回来" })).toBeInTheDocument();
    expect(
      screen.queryByText(/邮箱密码登录后可直接进入记录页/),
    ).not.toBeInTheDocument();
  });

  it("uses a shorter signup helper chip so it stays on one line", () => {
    renderAuthScreen({ authMode: "sign-up" });

    expect(screen.getByText("注册后自动进入记录页")).toBeInTheDocument();
  });

  it("keeps the sign-in helper chip on one line and nudges it inward", () => {
    renderAuthScreen();

    const helperChip = screen.getByText("登录后继续写下今天的治愈瞬间").parentElement;

    expect(helperChip).toHaveClass("whitespace-nowrap");
    expect(helperChip).toHaveClass("sm:mr-2");
  });

  it("submits from the keyboard when pressing Enter in the password field", () => {
    const onSubmit = vi.fn();

    renderAuthScreen({
      email: "joy@example.com",
      password: "secret123",
      onSubmit,
    });

    fireEvent.keyDown(screen.getByPlaceholderText("请输入密码"), {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("toggles password visibility without changing the value", () => {
    renderAuthScreen({ password: "secret123" });

    const passwordInput = screen.getByPlaceholderText("请输入密码");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "显示密码" }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "隐藏密码" })).toBeInTheDocument();
  });

  it("clears only the password value", () => {
    function Harness() {
      const [password, setPassword] = useState("secret123");

      return (
        <AuthScreen
          authMode="sign-in"
          email="joy@example.com"
          password={password}
          errors={{}}
          authMessage=""
          authLoading={false}
          retryAfterSeconds={0}
          copy={baseCopy}
          onEmailChange={() => {}}
          onPasswordChange={setPassword}
          onSubmit={() => {}}
          onToggleMode={() => {}}
        />
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "清空密码" }));

    expect(screen.getByPlaceholderText("请输入密码")).toHaveValue("");
  });

  it("switches the secondary action copy with auth mode", () => {
    const onToggleMode = vi.fn();

    renderAuthScreen({
      authMode: "sign-up",
      onToggleMode,
    });

    fireEvent.click(screen.getByRole("button", { name: "已有账号？去登录" }));

    expect(onToggleMode).toHaveBeenCalledTimes(1);
  });

  it("shows auth feedback as a centered toast and auto-hides it after three seconds", () => {
    vi.useFakeTimers();

    renderAuthScreen({
      authMessage: "登录成功，可以开始记录了。",
    });

    expect(screen.getByTestId("app-toast")).toHaveTextContent("登录成功，可以开始记录了。");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByTestId("app-toast")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
