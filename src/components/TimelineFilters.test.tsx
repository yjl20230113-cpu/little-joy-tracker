import { fireEvent, render, screen } from "@testing-library/react";
import { TimelineFilters } from "./TimelineFilters";

describe("TimelineFilters", () => {
  it("shows a past three months button instead of a custom date picker", () => {
    const onRangeChange = vi.fn();

    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="threeMonths"
        customStartDate=""
        customEndDate=""
        onPersonChange={() => {}}
        onRangeChange={onRangeChange}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onSummaryClick={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /过去三个月/ })).toBeInTheDocument();
    expect(screen.queryByTestId("app-date-picker-panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /过去三个月/ }));

    expect(onRangeChange).toHaveBeenCalledWith("threeMonths");
  });

  it("can hide the AI summary button when requested", () => {
    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        showSummaryButton={false}
      />,
    );

    expect(screen.queryByRole("button", { name: /AI/i })).not.toBeInTheDocument();
  });

  it("triggers summary generation when the button is clicked", () => {
    const onSummaryClick = vi.fn();

    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate=""
        customEndDate=""
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onSummaryClick={onSummaryClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /AI/i }));

    expect(onSummaryClick).toHaveBeenCalledTimes(1);
  });

  it("places the AI summary action on its own full-width row", () => {
    const { container } = render(
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
        onSummaryClick={() => {}}
      />,
    );

    expect(container.querySelector('[data-ui="timeline-filters-range-row"]')).toHaveClass(
      "grid-cols-3",
    );
    expect(screen.getByTestId("timeline-summary-button")).toHaveClass("w-full");
  });
});
