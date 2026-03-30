import { fireEvent, render, screen } from "@testing-library/react";
import { TimelineFilters } from "./TimelineFilters";

describe("TimelineFilters", () => {
  it("shows start and end date pickers instead of preset range buttons", () => {
    const { container } = render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="threeMonths"
        customStartDate="2026-03-01"
        customEndDate="2026-03-25"
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
        onSummaryClick={() => {}}
      />,
    );

    expect(screen.getAllByTestId("app-date-picker-trigger")).toHaveLength(2);
    expect(screen.getAllByTestId("app-date-picker-trigger")[0]).toHaveTextContent("26-03-01");
    expect(screen.getAllByTestId("app-date-picker-trigger")[1]).toHaveTextContent("26-03-25");
    expect(container.querySelector('[data-ui="timeline-filters"]')).toHaveClass(
      "bg-[rgba(255,250,247,0.82)]",
    );
    expect(container.querySelector('[data-ui="timeline-filters-range-row"]')).toHaveClass(
      "grid-cols-2",
    );
    expect(
      screen.queryByRole("button", {
        name: /\u4e00\u5468|\u4e00\u4e2a\u6708|\u4e09\u4e2a\u6708/,
      }),
    ).not.toBeInTheDocument();
  });

  it("lets the user update both start and end dates", () => {
    const onCustomStartDateChange = vi.fn();
    const onCustomEndDateChange = vi.fn();

    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="threeMonths"
        customStartDate="2026-03-01"
        customEndDate="2026-03-25"
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={onCustomStartDateChange}
        onCustomEndDateChange={onCustomEndDateChange}
        onSummaryClick={() => {}}
      />,
    );

    const [startTrigger, endTrigger] = screen.getAllByTestId("app-date-picker-trigger");

    fireEvent.click(startTrigger);
    fireEvent.click(screen.getByRole("button", { name: "\u9009\u62e9 2026-03-02" }));
    fireEvent.click(endTrigger);
    fireEvent.click(screen.getByRole("button", { name: "\u9009\u62e9 2026-03-24" }));

    expect(onCustomStartDateChange).toHaveBeenCalledWith("2026-03-02");
    expect(onCustomEndDateChange).toHaveBeenCalledWith("2026-03-24");
  });

  it("anchors both date pickers below the trigger and centers them on the viewport", () => {
    render(
      <TimelineFilters
        peopleFilters={[{ id: "all", label: "All" }]}
        selectedPersonId="all"
        selectedRange="week"
        customStartDate="2026-03-01"
        customEndDate="2026-03-25"
        onPersonChange={() => {}}
        onRangeChange={() => {}}
        onCustomStartDateChange={() => {}}
        onCustomEndDateChange={() => {}}
      />,
    );

    const [startTrigger, endTrigger] = screen.getAllByTestId("app-date-picker-trigger");
    (startTrigger as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect =
      () =>
        ({
          width: 120,
          height: 40,
          top: 80,
          left: 16,
          right: 136,
          bottom: 120,
          x: 16,
          y: 80,
          toJSON: () => ({}),
        }) as DOMRect;
    (endTrigger as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect =
      () =>
        ({
          width: 120,
          height: 40,
          top: 140,
          left: 160,
          right: 280,
          bottom: 180,
          x: 160,
          y: 140,
          toJSON: () => ({}),
        }) as DOMRect;

    fireEvent.click(startTrigger);

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "fixed",
      "left-1/2",
      "-translate-x-1/2",
    );
    expect(screen.getByTestId("app-date-picker-panel").style.top).toBe("130px");

    fireEvent.mouseDown(document.body);
    fireEvent.click(endTrigger);

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "fixed",
      "left-1/2",
      "-translate-x-1/2",
    );
    expect(screen.getByTestId("app-date-picker-panel").style.top).toBe("190px");
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
      "grid-cols-2",
    );
    expect(screen.getByTestId("timeline-summary-button")).toHaveClass(
      "w-full",
      "bg-[rgba(255,243,237,0.92)]",
    );
  });

  it("shows label-only placeholders when the date range is empty", () => {
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
        onSummaryClick={() => {}}
      />,
    );

    const [startTrigger, endTrigger] = screen.getAllByTestId("app-date-picker-trigger");

    expect(startTrigger).toHaveTextContent("开始日期");
    expect(startTrigger).not.toHaveTextContent("请选择日期");
    expect(endTrigger).toHaveTextContent("结束日期");
    expect(endTrigger).not.toHaveTextContent("请选择日期");
  });
});
