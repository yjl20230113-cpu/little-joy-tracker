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
        people={[{ id: "self", name: "自己", is_default: true }]}
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
      "h-[10.5rem]",
    );
    expect(screen.getByPlaceholderText("发生了什么？")).toHaveClass("text-[1.3rem]");
    expect(quickEntry.container.querySelector("form > .joy-blur-panel")).toHaveClass(
      "min-h-[3.75rem]",
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
                title: "缴纳水电费",
                content: "水电费到账了",
                reason: "轻了一口气",
                imageUrl: null,
                personName: "自己",
                createdAt: "2026-03-23T10:00:00.000Z",
              },
            ],
          },
        ]}
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

    expect(screen.getByText("2026年3月23日")).toHaveClass("text-[1.4rem]");
    expect(screen.getByRole("button", { name: /缴纳水电费/ })).toHaveClass(
      "rounded-[1.1rem]",
    );
    expect(
      screen.getByRole("button", { name: /缴纳水电费/ }).querySelector("div"),
    ).toHaveClass("size-[3.75rem]");
    timeline.unmount();

    const detail = render(
      <EventDetailPanel
        event={{
          id: "event-1",
          title: "离职决定已定",
          content: "今天正式把决定说出口了。",
          reason: "终于轻松一点",
          imageUrl: null,
          displayDate: "2026-03-23",
          createdAt: "2026-03-23T10:00:00.000Z",
          personName: "自己",
          personId: "self",
        }}
        people={[{ id: "self", name: "自己", is_default: true }]}
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

    expect(screen.getByText("离职决定已定")).toHaveClass("text-[1.625rem]");
    expect(screen.getByText("今天正式把决定说出口了。")).toHaveClass("text-[1rem]");
    expect(screen.getByText("终于轻松一点")).toHaveClass("text-[0.94rem]");
    detail.unmount();

    const insight = render(
      <InsightView
        activeTab="insight"
        peopleFilters={[{ id: "all", label: "全部" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        message=""
        emptyHint="先去记录一些小美好再来吧"
        generateDisabled={false}
        loading={false}
        report={{
          mood_weather: {
            title: "暖阳",
            icon: "Sun",
            description: "本阶段 85% 的时间，你处于明亮稳定的状态。",
          },
          keywords: ["散步", "咖啡", "风", "晚霞", "笑声"],
          personality: {
            title: "细节捕捉家",
            description: "你总能在普通的一天里发现轻盈的光。",
          },
          suggestions: [
            { title: "傍晚散步", content: "继续保留短暂步行。", icon: "Tree" },
            { title: "写下片刻", content: "把轻盈瞬间及时记下来。", icon: "Sparkles" },
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

    expect(screen.getByText("暖阳")).toHaveClass("text-[1.625rem]");
    insight.unmount();

    render(
      <ProfileView
        email="joy@example.com"
        activeTab="profile"
        message=""
        onLogout={() => {}}
        onTabChange={() => {}}
      />,
    );

    expect(screen.getByText("joy@example.com").closest("div")).toHaveClass("rounded-[0.9rem]");
  });
});
