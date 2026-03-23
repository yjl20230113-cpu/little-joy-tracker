import { fireEvent, render, screen } from "@testing-library/react";
import { AuthScreen } from "./AuthScreen";

describe("AuthScreen", () => {
  const baseCopy = {
    signInTitle: "欢迎回来",
    signUpTitle: "创建你的小美好账号",
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

  it("renders a denser top-aligned auth layout with a brand header", () => {
    const { container } = render(
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
      />,
    );

    const layout = container.querySelector('[data-ui="auth-layout"]');
    const panel = container.querySelector('[data-ui="auth-panel"]');

    expect(screen.getByText("Little Joy Tracker")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "欢迎回来" })).toBeInTheDocument();
    expect(layout).toHaveClass("max-w-[32rem]");
    expect(layout).toHaveClass("items-start");
    expect(panel).toHaveClass("justify-start");
  });

  it("switches the secondary action copy with auth mode", () => {
    const onToggleMode = vi.fn();

    render(
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
        onToggleMode={onToggleMode}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "还没有账号？去注册" }));

    expect(onToggleMode).toHaveBeenCalledTimes(1);
  });
});
