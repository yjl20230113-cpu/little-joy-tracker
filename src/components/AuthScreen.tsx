import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { AppToast } from "./AppToast";

type AuthScreenCopy = {
  signInTitle: string;
  signUpTitle: string;
  signInDescription: string;
  signUpDescription: string;
  emailLabel: string;
  passwordLabel: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signIn: string;
  signUp: string;
  processing: string;
  switchToSignUp: string;
  switchToSignIn: string;
};

type AuthScreenProps = {
  authMode: "sign-in" | "sign-up";
  email: string;
  password: string;
  errors: Record<string, string>;
  authMessage: string;
  onAuthMessageClear?: () => void;
  authLoading: boolean;
  retryAfterSeconds: number;
  copy: AuthScreenCopy;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
};

export function AuthScreen({
  authMode,
  email,
  password,
  errors,
  authMessage,
  onAuthMessageClear,
  authLoading,
  retryAfterSeconds,
  copy,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthScreenProps) {
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const isSignIn = authMode === "sign-in";
  const title = isSignIn ? copy.signInTitle : copy.signUpTitle;
  const description = isSignIn ? copy.signInDescription : copy.signUpDescription;
  const submitLabel = authLoading
    ? copy.processing
    : isSignIn
      ? copy.signIn
      : copy.signUp;
  const secondaryAction = isSignIn ? copy.switchToSignUp : copy.switchToSignIn;
  const heroTag = isSignIn ? "继续记录今天的小美好" : "把新的小美好安稳收进来";
  const helperChip = isSignIn ? "登录后继续写下今天的治愈瞬间" : "注册后自动进入记录页";

  function focusPasswordInput() {
    window.requestAnimationFrame(() => {
      passwordInputRef.current?.focus();
    });
  }

  function handleTogglePasswordVisibility() {
    setShowPassword((current) => !current);
    focusPasswordInput();
  }

  function handleClearPassword() {
    onPasswordChange("");
    setShowPassword(false);
    focusPasswordInput();
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  function handleFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    onSubmit();
  }

  return (
    <main className="joy-grid relative flex min-h-dvh overflow-hidden sm:min-h-screen sm:px-4 sm:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,166,92,0.24),transparent_26%),radial-gradient(circle_at_bottom,rgba(255,233,193,0.42),transparent_32%)]" />
      <div
        data-ui="auth-layout"
        className="flex min-h-dvh w-full items-start sm:mx-auto sm:min-h-0 sm:max-w-[30rem]"
      >
        <section
          data-ui="auth-panel"
          className="joy-card relative flex w-full flex-col justify-start rounded-none px-4 pb-6 pt-5.5 sm:rounded-[1.65rem] sm:px-4.5 sm:pb-5.5 sm:pt-4.5"
        >
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(255,178,118,0.22),transparent_58%)]" />

          <div className="relative space-y-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/92 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--primary)] shadow-[0_10px_18px_-18px_rgba(29,29,3,0.2)]">
                <span className="flex size-6.5 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)]">
                  <Sparkles className="size-3.5" />
                </span>
                Little Joy Tracker
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--primary-wash)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--primary)]">
                <ShieldCheck className="size-3.5" />
                Supabase Auth
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.25rem] border border-[rgba(255,184,120,0.34)] bg-[linear-gradient(180deg,rgba(255,231,210,0.78),rgba(255,255,255,0.9))] px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_14px_24px_-28px_rgba(168,90,24,0.28)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="inline-flex rounded-full bg-white/82 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-[var(--primary)]">
                    {heroTag}
                  </p>
                  <h2 className="mt-2.5 text-[1.625rem] font-black tracking-[-0.045em] text-[var(--primary)]">
                    {title}
                  </h2>
                  <p className="mt-2 max-w-[21rem] text-[0.9rem] leading-6 text-[var(--muted)]">
                    {description}
                  </p>
                </div>
                <div className="hidden shrink-0 whitespace-nowrap rounded-[1rem] bg-white/74 px-3 py-2 text-left text-[10px] font-semibold leading-5 text-[var(--primary)] sm:mr-2 sm:block">
                  <div>{helperChip}</div>
                  {retryAfterSeconds > 0 ? (
                    <div className="mt-1 text-[10px] text-[var(--primary)]/74">
                      请在 {retryAfterSeconds} 秒后重试
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <form className="space-y-2.5" onSubmit={handleFormSubmit}>
              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <Mail className="size-4" />
                  {copy.emailLabel}
                </span>
                <input
                  type="email"
                  value={email}
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  onChange={(event) => onEmailChange(event.target.value)}
                  onKeyDown={handleFieldKeyDown}
                  placeholder={copy.emailPlaceholder}
                  className="w-full rounded-[1rem] border border-[rgba(155,69,0,0.12)] bg-[rgba(255,255,255,0.94)] px-4 py-[0.6875rem] text-[0.96rem] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]"
                />
                <span className="mt-1.5 block min-h-4 text-xs text-[#ba1a1a]">
                  {errors.email}
                </span>
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--muted)]">
                  <ShieldCheck className="size-4" />
                  {copy.passwordLabel}
                </span>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete={isSignIn ? "current-password" : "new-password"}
                    autoCapitalize="none"
                    spellCheck={false}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    onKeyDown={handleFieldKeyDown}
                    placeholder={copy.passwordPlaceholder}
                    className="w-full rounded-[1rem] border border-[rgba(155,69,0,0.12)] bg-[rgba(255,255,255,0.94)] py-[0.6875rem] pl-4 pr-24 text-[0.96rem] text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.76)] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]"
                  />

                  <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                    {password ? (
                      <button
                        type="button"
                        aria-label="清空密码"
                        onPointerDown={(event) => event.preventDefault()}
                        onClick={handleClearPassword}
                        className="inline-flex size-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[rgba(255,255,255,0.78)] hover:text-[var(--primary)]"
                      >
                        <X className="size-4" />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      onPointerDown={(event) => event.preventDefault()}
                      onClick={handleTogglePasswordVisibility}
                      className="inline-flex size-9 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[rgba(255,255,255,0.78)] hover:text-[var(--primary)]"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                <span className="mt-1.5 block min-h-4 text-xs text-[#ba1a1a]">
                  {errors.password}
                </span>
              </label>

              <div className="flex flex-col gap-2.25 pt-1">
                <button
                  type="submit"
                  disabled={authLoading || retryAfterSeconds > 0}
                  className="inline-flex min-h-[2.9rem] items-center justify-center gap-2 rounded-[1.05rem] bg-[var(--primary-soft)] px-5 py-2.5 text-[0.95rem] font-extrabold text-white shadow-[0_10px_16px_-16px_rgba(255,140,66,0.46)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {authLoading ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  {submitLabel}
                </button>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={onToggleMode}
                  className="rounded-[1.05rem] border border-[rgba(155,69,0,0.12)] bg-white/88 px-5 py-2.5 text-[0.95rem] font-bold text-[var(--primary)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {secondaryAction}
                </button>
              </div>
            </form>

          </div>
        </section>
      </div>

      <AppToast message={authMessage} onClear={onAuthMessageClear} />
    </main>
  );
}
