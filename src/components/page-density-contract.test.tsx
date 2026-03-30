import { render, screen } from "@testing-library/react";
import { EventDetailPanel } from "./EventDetailPanel";
import { InsightView } from "./InsightView";
import { ProfileView } from "./ProfileView";
import { QuickEntry } from "./QuickEntry";
import { TimelineView } from "./TimelineView";

describe("page density contract", () => {
  it("keeps record, timeline, detail, insight, and profile layouts on the tighter iPhone scale", () => {
    const quickEntry = render(
      <QuickEntry
        people={[{ id: "self", name: "Self", is_default: true }]}
        selectedPersonId="self"
        content=""
        reason=""
        displayDate="2026-03-23"
        saving={false}
        uploading={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    expect(quickEntry.container.querySelector('[data-ui="quick-entry-media"]')).toHaveClass(
      "h-[7.6rem]",
    );
    expect(quickEntry.container.querySelector('[data-ui="quick-entry-toolbar"]')).toHaveClass(
      "justify-start",
    );
    expect(quickEntry.container.querySelector('[data-ui="quick-entry-person-trigger"]')).toHaveClass(
      "min-h-9",
    );
    expect(quickEntry.container.querySelector('[data-ui="quick-entry-date"]')).toHaveClass(
      "min-h-9",
    );
    expect(screen.getByPlaceholderText("发生了什么？")).toHaveClass("text-[1.18rem]");
    expect(quickEntry.container.querySelector('[data-ui="quick-entry-footer"]')).toHaveClass(
      "min-h-[3rem]",
      "py-1",
    );
    quickEntry.unmount();

    const timeline = render(
      <TimelineView
        activeTab="timeline"
        groups={[
          {
            date: "2026-03-23",
            items: [
              {
                id: "event-1",
                title: "First journal day",
                content: "Today I started using the app.",
                reason: "It feels light and easy.",
                imageUrl: null,
                personName: "Self",
                createdAt: "2026-03-23T10:00:00.000Z",
              },
            ],
          },
        ]}
        peopleFilters={[
          { id: "all", label: "All" },
          { id: "self", label: "Self" },
        ]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        message=""
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onSummaryClick={() => {}}
        onTabChange={() => {}}
        onEventOpen={() => {}}
      />,
    );

    expect(screen.getByText(/2026/)).toHaveClass("text-[1.2rem]");
    expect(screen.getByRole("button", { name: /First journal day/i })).toHaveClass(
      "rounded-[1.15rem]",
    );
    expect(
      screen.getByRole("button", { name: /First journal day/i }).querySelector("div"),
    ).toHaveClass("size-[3.5rem]");
    expect(screen.getByTestId("timeline-summary-button")).toHaveClass("w-full");
    timeline.unmount();

    const detail = render(
      <EventDetailPanel
        event={{
          id: "event-1",
          title: "A clear decision",
          content: "Today I finally said the decision out loud.",
          reason: "I can breathe more easily now.",
          imageUrl: null,
          displayDate: "2026-03-23",
          createdAt: "2026-03-23T10:00:00.000Z",
          personName: "Self",
          personId: "self",
        }}
        people={[{ id: "self", name: "Self", is_default: true }]}
        editing={false}
        saving={false}
        deleting={false}
        uploading={false}
        confirmingDelete={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        onDeleteCancel={() => {}}
        onDeleteConfirm={() => {}}
        onTitleChange={() => {}}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onPersonChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancelEdit={() => {}}
      />,
    );

    expect(screen.getByText("A clear decision")).toHaveClass("text-[1.5rem]");
    expect(screen.getByText("Today I finally said the decision out loud.")).toHaveClass(
      "text-[0.96rem]",
    );
    expect(screen.getByText("I can breathe more easily now.")).toHaveClass(
      "text-[0.9rem]",
    );
    detail.unmount();

    const insight = render(
      <InsightView
        activeTab="insight"
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        message=""
        emptyHint="Add some memories first."
        generateDisabled={false}
        loading={false}
        report={{
          mood_weather: {
            title: "Warm Sun",
            icon: "Sun",
            score: 85,
            description: "This week, 85% of the time felt bright and steady.",
          },
          keywords: ["walk", "coffee", "breeze", "smile", "sunlight"],
          personality: {
            title: "Detail Collector",
            description: "You notice small moments and keep them close.",
          },
          suggestions: [
            { title: "Evening walk", content: "Keep a short walk after dinner.", icon: "Tree" },
            { title: "Quick note", content: "Write down one bright moment each day.", icon: "Sparkles" },
          ],
        }}
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onGenerate={() => {}}
        onShare={() => {}}
        onTabChange={() => {}}
      />,
    );

    expect(screen.getByText("Warm Sun")).toHaveClass("text-[1.5rem]");
    insight.unmount();

    render(
      <ProfileView
        email="joy@example.com"
        displayName="Joy"
        avatarUrl={null}
        selectedImageName=""
        activeTab="profile"
        message=""
        editing={false}
        saving={false}
        uploading={false}
        onRefreshApp={() => {}}
        onLogout={() => {}}
        onTabChange={() => {}}
        onEditProfile={() => {}}
        onDisplayNameChange={() => {}}
        onAvatarSelect={() => {}}
        onAvatarRemove={() => {}}
        onSaveProfile={() => {}}
      />,
    );

    expect(screen.getByTestId("profile-email-chip")).toHaveClass("w-full");
    expect(screen.getByTestId("profile-display-name")).toHaveClass("text-[1rem]");
    expect(screen.getByTestId("profile-logout-slot")).toHaveClass("mt-8");
    expect(screen.getByTestId("profile-logout-action")).toHaveClass(
      "bg-[rgba(255,252,248,0.9)]",
      "text-[var(--primary)]",
    );
  });
});
