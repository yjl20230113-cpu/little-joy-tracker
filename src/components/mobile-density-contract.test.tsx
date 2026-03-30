import { render, screen } from "@testing-library/react";
import { BookOpen, Sparkles } from "lucide-react";
import { AppBottomNav } from "./AppBottomNav";
import { AppTopBar } from "./AppTopBar";
import { AuthScreen } from "./AuthScreen";
import { TimelineFilters } from "./TimelineFilters";

describe("mobile density contract", () => {
  it("uses tighter iPhone-sized chrome across shared components", () => {
    const { container } = render(
      <div>
        <AppTopBar
          title="Little Joy Tracker"
          leadingIcon={Sparkles}
          trailingIcon={BookOpen}
        />
        <AppBottomNav
          activeTab="timeline"
          onTabChange={() => {}}
          labels={{
            record: "Daily Joy",
            timeline: "Mood Log",
            insight: "Healing Hub",
            profile: "Profile",
          }}
        />
        <TimelineFilters
          peopleFilters={[
            { id: "all", label: "All" },
            { id: "self", label: "Self" },
          ]}
          selectedPersonId="all"
          selectedRange="week"
          customStartDate=""
          customEndDate=""
          onPersonChange={() => {}}
          onRangeChange={() => {}}
          onCustomStartDateChange={() => {}}
          onCustomEndDateChange={() => {}}
          showSummaryButton={false}
        />
        <AuthScreen
          authMode="sign-in"
          email=""
          password=""
          errors={{}}
          authMessage=""
          authLoading={false}
          retryAfterSeconds={0}
          copy={{
            signInTitle: "Welcome back",
            signUpTitle: "Create account",
            signInDescription: "Use email and password to continue.",
            signUpDescription: "Create an account and enter directly.",
            emailLabel: "Email",
            passwordLabel: "Password",
            emailPlaceholder: "you@example.com",
            passwordPlaceholder: "Enter password",
            signIn: "Sign in",
            signUp: "Sign up",
            processing: "Processing...",
            switchToSignUp: "Create account",
            switchToSignIn: "Back to sign in",
          }}
          onEmailChange={() => {}}
          onPasswordChange={() => {}}
          onSubmit={() => {}}
          onToggleMode={() => {}}
        />
      </div>,
    );

    expect(container.querySelector('[data-ui="app-topbar"]')).toHaveClass(
      "min-h-[3.6rem]",
    );
    expect(container.querySelector('[data-ui="app-topbar-title"]')).toHaveClass(
      "text-[0.96rem]",
    );

    expect(container.querySelector('[data-ui="app-bottom-nav"]')).toHaveClass("px-2");
    expect(screen.getByRole("button", { name: "Mood Log" })).toHaveClass("h-[3.72rem]");
    expect(screen.getByRole("button", { name: "Mood Log" })).toHaveClass("w-[90%]");
    expect(screen.getByRole("button", { name: "Mood Log" })).toHaveClass("text-[0.62rem]");
    expect(screen.getByRole("button", { name: "Mood Log" })).toHaveClass("font-medium");
    expect(screen.getByRole("button", { name: "Daily Joy" })).toHaveClass("font-normal");

    const filterPanel = container.querySelector('[data-ui="timeline-filters"]');
    expect(filterPanel).toHaveClass("rounded-[1.15rem]");
    expect(container.querySelector('[data-ui="timeline-filters-range-row"]')).toHaveClass(
      "grid-cols-2",
    );
    expect(filterPanel?.querySelector("button")).toHaveClass("px-3", "py-1.5");

    expect(container.querySelector('[data-ui="auth-panel"]')).toHaveClass("px-4");
    expect(screen.getByRole("heading", { name: "Welcome back" })).toHaveClass(
      "text-[1.625rem]",
    );
    expect(screen.getByPlaceholderText("you@example.com")).toHaveClass("py-[0.6875rem]");
  });
});
