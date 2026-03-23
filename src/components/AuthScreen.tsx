import { LoaderCircle, Mail, ShieldCheck, Sparkles } from "lucide-react";

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
  authLoading,
  retryAfterSeconds,
  copy,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}: AuthScreenProps) {
  return (
    <main className="joy-grid relative flex min-h-screen overflow-hidden px-0 py-0 sm:px-4 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,166,92,0.2),transparent_28%),radial-gradient(circle_at_bottom,rgba(255,233,193,0.36),transparent_32%)]" />
      <div
        data-ui="auth-layout"
        className="mx-auto flex min-h-screen w-full max-w-[32rem] items-start sm:min-h-0"
      >
        <section
          data-ui="auth-panel"
          className="joy-card relative flex w-full flex-col justify-start rounded-none px-5 pb-8 pt-7 sm:rounded-[2.2rem] sm:px-6 sm:pb-7 sm:pt-6"
        >
          <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(255,178,118,0.18),transparent_62%)]" />

          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/88 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-[var(--primary)] shadow-[0_10px_24px_-20px_rgba(29,29,3,0.28)]">
                <span className="flex size-7 items-center justify-center rounded-full bg-[var(--primary-wash)] text-[var(--primary)]">
                  <Sparkles className="size-3.5" />
                </span>
                Little Joy Tracker
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-wash)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--primary)]">
                <ShieldCheck className="size-3.5" />
                Supabase Auth
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(180deg,rgba(255,226,204,0.72),rgba(255,255,255,0.82))] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.56)]">
              <div className="translate-y-0 opacity-100 transition-all duration-300">
                <p className="inline-flex rounded-full bg-white/72 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-[var(--primary)]">
                  继续记录今天的小美好
                </p>
                <h2 className="mt-3 text-[1.9rem] font-black tracking-[-0.05em] text-[var(--primary)]">
                  {authMode === "sign-in" ? copy.signInTitle : copy.signUpTitle}
                </h2>
                <p className="mt-2 text-[0.96rem] leading-7 text-[var(--muted)]">
                  {authMode === "sign-in"
                    ? copy.signInDescription
                    : copy.signUpDescription}
                </p>
              </div>
            </div>

            <div className="space-y-3.5">
              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
                  <Mail className="size-4" />
                  {copy.emailLabel}
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder={copy.emailPlaceholder}
                  className="w-full rounded-[1.35rem] border border-[rgba(155,69,0,0.12)] bg-[rgba(255,255,255,0.92)] px-4 py-3.5 text-base text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]"
                />
                <span className="mt-1.5 block min-h-4 text-sm text-[#ba1a1a]">
                  {errors.email}
                </span>
              </label>

              <label className="block">
                <span className="mb-2 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[var(--muted)]">
                  <ShieldCheck className="size-4" />
                  {copy.passwordLabel}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder={copy.passwordPlaceholder}
                  className="w-full rounded-[1.35rem] border border-[rgba(155,69,0,0.12)] bg-[rgba(255,255,255,0.92)] px-4 py-3.5 text-base text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.74)] outline-none transition-shadow focus:shadow-[0_0_0_3px_rgba(255,140,66,0.12)]"
                />
                <span className="mt-1.5 block min-h-4 text-sm text-[#ba1a1a]">
                  {errors.password}
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                disabled={authLoading || retryAfterSeconds > 0}
                onClick={onSubmit}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[var(--primary-soft)] px-5 py-3.5 text-base font-extrabold text-white shadow-[0_18px_32px_-18px_rgba(255,140,66,0.9)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {authLoading ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Mail className="size-4" />
                )}
                {authLoading
                  ? copy.processing
                  : authMode === "sign-in"
                    ? copy.signIn
                    : copy.signUp}
              </button>

              <button
                type="button"
                disabled={authLoading}
                onClick={onToggleMode}
                className="rounded-full border border-[rgba(155,69,0,0.12)] bg-white/84 px-5 py-3.5 text-base font-bold text-[var(--primary)] transition-transform hover:-translate-y-0.5 disabled:opacity-70"
              >
                {authMode === "sign-in" ? copy.switchToSignUp : copy.switchToSignIn}
              </button>
            </div>

            <div className="rounded-[1.35rem] bg-[rgba(255,247,235,0.88)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
              邮箱密码登录后可直接进入记录页，流程不变，只优化了视觉密度。
            </div>

            <p className="min-h-5 text-sm text-[var(--muted)]">{authMessage}</p>
          </div>
        </section>
      </div>
    </main>
  );
}
