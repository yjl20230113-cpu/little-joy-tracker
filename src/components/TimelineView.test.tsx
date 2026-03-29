import { fireEvent, render, screen } from "@testing-library/react";

import { TimelineView } from "./TimelineView";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

describe("TimelineView", () => {
  it("shows grouped events and lets the user open a detail view", () => {
    const onEventOpen = vi.fn();

    render(
      <TimelineView
        activeTab="timeline"
        groups={[
          {
            date: "2026-03-22",
            items: [
              {
                id: "event-1",
                title: "晨光散步",
                content: "今天去散步，感觉很轻。",
                reason: "The night breeze felt soft",
                imageUrl: "https://example.com/sky.jpg",
                displayDate: "2026-03-22",
                createdAt: "2026-03-22T14:30:25+08:00",
                personName: "Self",
                personId: "person-self",
              },
            ],
          },
        ]}
        peopleFilters={[
          { id: "all", label: "All" },
          { id: "person-self", label: "Self" },
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
        onEventOpen={onEventOpen}
      />,
    );

    expect(screen.getByText(/2026/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /All/i })).toBeInTheDocument();
    expect(screen.getByText("14:30")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /晨光散步/i }));

    expect(onEventOpen).toHaveBeenCalledWith("event-1");
  });

  it("renders the healing empty state when no event matches the filters", () => {
    render(
      <TimelineView
        activeTab="timeline"
        groups={[]}
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="month"
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

    expect(
      screen.getByText("这里空空的，快去记录一件小美好吧~"),
    ).toBeInTheDocument();
  });

  it("keeps the timeline shell mounted while swapping the middle content to detail mode", () => {
    render(
      <TimelineView
        activeTab="timeline"
        groups={[
          {
            date: "2026-03-22",
            items: [
              {
                id: "event-1",
                title: "晨光散步",
                content: "今天去散步，感觉很轻。",
                reason: "The night breeze felt soft",
                imageUrl: null,
                displayDate: "2026-03-22",
                createdAt: "2026-03-22T14:30:25+08:00",
                personName: "Self",
                personId: "person-self",
              },
            ],
          },
        ]}
        peopleFilters={[
          { id: "all", label: "All" },
          { id: "person-self", label: "Self" },
        ]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        message=""
        topBarTitle=""
        topBarLeftSlot={<button type="button">返回</button>}
        topBarRightSlot={
          <>
            <button type="button">编辑</button>
            <button type="button">删除</button>
          </>
        }
        detailContent={
          <div data-testid="timeline-detail-panel">
            <p>detail body</p>
          </div>
        }
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onSummaryClick={() => {}}
        onTabChange={() => {}}
        onEventOpen={() => {}}
      />,
    );

    expect(screen.getByTestId("timeline-detail-panel")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "返回" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
    expect(screen.queryByText("Little Joy Tracker")).not.toBeInTheDocument();
    expect(document.querySelector('[data-ui="app-topbar"]')).toBeInTheDocument();
    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /All/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /A quiet walk home together/i })).not.toBeInTheDocument();
  });

  it("renders the local placeholder image when a record has no real photo", () => {
    render(
      <TimelineView
        activeTab="timeline"
        groups={[
          {
            date: "2026-03-22",
            items: [
              {
                id: "event-1",
                title: "湖面微光",
                content: "今天的风像水面一样轻",
                reason: null,
                imageUrl: null,
                displayDate: "2026-03-22",
                createdAt: "2026-03-22T14:30:25+08:00",
                personName: "Self",
                personId: "person-self",
                autoImageStatus: null,
                autoImageAttribution: null,
              },
            ],
          },
        ]}
        peopleFilters={[{ id: "all", label: "All" }]}
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

    expect(screen.getByAltText("今天的风像水面一样轻")).toHaveAttribute(
      "src",
      "/auto-image-placeholder.svg",
    );
  });

  it("still renders the local placeholder when the image url is an empty string", () => {
    render(
      <TimelineView
        activeTab="timeline"
        groups={[
          {
            date: "2026-03-22",
            items: [
              {
                id: "event-1",
                title: "空白封面",
                content: "这条记录没有真实图片",
                reason: null,
                imageUrl: "",
                displayDate: "2026-03-22",
                createdAt: "2026-03-22T14:30:25+08:00",
                personName: "Self",
                personId: "person-self",
                autoImageStatus: null,
                autoImageAttribution: null,
              },
            ],
          },
        ]}
        peopleFilters={[{ id: "all", label: "All" }]}
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

    expect(screen.getByAltText("这条记录没有真实图片")).toHaveAttribute(
      "src",
      "/auto-image-placeholder.svg",
    );
  });

  it("shows a secondary archive entry for the cloudy archive bag", () => {
    const onCloudyArchiveOpen = vi.fn();

    render(
      <TimelineView
        activeTab="timeline"
        groups={[]}
        peopleFilters={[{ id: "all", label: "All" }]}
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
        onCloudyArchiveOpen={onCloudyArchiveOpen}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "解忧档案袋" }));

    expect(onCloudyArchiveOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps the archive entry horizontally inset like the summary button", () => {
    const { container } = render(
      <TimelineView
        activeTab="timeline"
        groups={[]}
        peopleFilters={[{ id: "all", label: "All" }]}
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
        onCloudyArchiveOpen={() => {}}
      />,
    );

    expect(
      container.querySelector('[data-ui="cloudy-archive-entry-wrap"]'),
    ).toHaveClass("px-2.5");
  });

  it("keeps the people, date, summary, and archive rows on the same vertical rhythm", () => {
    const { container } = render(
      <TimelineView
        activeTab="timeline"
        groups={[]}
        peopleFilters={[{ id: "all", label: "All" }]}
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
        onCloudyArchiveOpen={() => {}}
      />,
    );

    expect(container.querySelector('[data-ui="timeline-filters"]')).toHaveClass(
      "space-y-2.5",
    );
    expect(container.querySelector('[data-ui="timeline-list-stack"]')).toHaveClass(
      "space-y-2.5",
    );
  });

  it("supports a cloudy shell tone and viewport overlay content", () => {
    render(
      <TimelineView
        activeTab="timeline"
        groups={[]}
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        message=""
        shellTone="cloudy"
        topBarTone="warm"
        navTone="warm"
        overlayContent={<div data-testid="timeline-overlay">confirm dialog</div>}
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onSummaryClick={() => {}}
        onTabChange={() => {}}
        onEventOpen={() => {}}
      />,
    );

    expect(document.querySelector('[data-ui="timeline-view-shell"]')).toHaveAttribute(
      "data-shell-tone",
      "cloudy",
    );
    expect(document.querySelector('[data-ui="app-topbar"]')).toHaveAttribute(
      "data-tone",
      "warm",
    );
    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toHaveAttribute(
      "data-tone",
      "warm",
    );
    expect(screen.getByTestId("timeline-overlay")).toBeInTheDocument();
  });
});
