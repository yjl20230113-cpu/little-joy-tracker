import { fireEvent, render, screen } from "@testing-library/react";
import { TimelineView } from "./TimelineView";

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
                content: "今天去散步，感觉很好。",
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

    expect(screen.getByText(/~/)).toBeInTheDocument();
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
                content: "今天去散步，感觉很好。",
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
        topBarLeftSlot={
          <button type="button">
            返回
          </button>
        }
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
    expect(
      screen.queryByRole("button", { name: /A quiet walk home together/i }),
    ).not.toBeInTheDocument();
  });
});
