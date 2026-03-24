import { render } from "@testing-library/react";
import { InsightView } from "./InsightView";
import { QuickEntry } from "./QuickEntry";
import { TimelineView } from "./TimelineView";

describe("app shell consistency", () => {
  it("keeps the three main tabs on the same full-width shell", () => {
    const quickEntry = render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-22"
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

    const timeline = render(
      <TimelineView
        activeTab="timeline"
        groups={[]}
        peopleFilters={[{ id: "all", label: "全部" }]}
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

    const insight = render(
      <InsightView
        activeTab="insight"
        peopleFilters={[{ id: "all", label: "全部" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        message=""
        emptyHint=""
        generateDisabled={false}
        loading={false}
        report={null}
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onGenerate={() => {}}
        onShare={() => {}}
        onTabChange={() => {}}
      />,
    );

    expect(quickEntry.container.firstElementChild).toHaveClass("w-full");
    expect(timeline.container.firstElementChild).toHaveClass("w-full");
    expect(insight.container.firstElementChild).toHaveClass("w-full");
  });
});
