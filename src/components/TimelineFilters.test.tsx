import { fireEvent, render, screen } from "@testing-library/react";
import { TimelineFilters } from "./TimelineFilters";

describe("TimelineFilters", () => {
  it("shows a past three months button instead of the custom date picker", () => {
    const onRangeChange = vi.fn();

    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "全部" }]}
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

    expect(screen.getByRole("button", { name: "过去三个月" })).toBeInTheDocument();
    expect(screen.queryByTestId("app-date-picker-panel")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /自定义/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "过去三个月" }));

    expect(onRangeChange).toHaveBeenCalledWith("threeMonths");
  });

  it("can hide the AI summary button when requested", () => {
    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "全部" }]}
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

    expect(screen.queryByRole("button", { name: /AI .*报告/ })).not.toBeInTheDocument();
  });

  it("triggers summary generation when the button is clicked", () => {
    const onSummaryClick = vi.fn();

    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "全部" }]}
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

    fireEvent.click(screen.getByRole("button", { name: /AI .*报告/ }));

    expect(onSummaryClick).toHaveBeenCalledTimes(1);
  });
});
