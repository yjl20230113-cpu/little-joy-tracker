import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { AppDatePicker } from "./AppDatePicker";

describe("AppDatePicker", () => {
  it("supports a centered calendar panel alignment", () => {
    render(<AppDatePicker value="2026-03-23" onChange={() => {}} align="center" />);

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "left-1/2",
      "-translate-x-1/2",
    );
  });

  it("can center the panel on the viewport while anchoring below the trigger", () => {
    render(
      <AppDatePicker
        value="2026-03-23"
        onChange={() => {}}
        placement="bottom"
        centerPanelOnViewport
      />,
    );

    const trigger = screen.getByTestId("app-date-picker-trigger");
    (trigger as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect =
      () =>
        ({
          width: 100,
          height: 40,
          top: 80,
          left: 12,
          right: 112,
          bottom: 120,
          x: 12,
          y: 80,
          toJSON: () => ({}),
        }) as DOMRect;

    fireEvent.click(trigger);

    const panel = screen.getByTestId("app-date-picker-panel");
    expect(panel).toHaveClass("fixed", "left-1/2", "-translate-x-1/2");
    expect(panel.style.top).toBe("130px");
  });

  it("shows a compact today label and a smaller panel in compact mode", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23T08:00:00.000Z"));

    render(<AppDatePicker value="2026-03-23" onChange={() => {}} align="right" compact />);

    expect(screen.getByTestId("app-date-picker-trigger")).toHaveTextContent("今天-03-23");

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "w-[min(13.5rem,calc(100vw-1.5rem))]",
    );

    vi.useRealTimers();
  });

  it("shows label-only empty state and short-year date when configured", () => {
    const { rerender } = render(
      <AppDatePicker
        value=""
        onChange={() => {}}
        compact
        buttonLabel="开始日期"
        buttonLabelMode="empty-only"
        compactDisplayStyle="short-year"
        showTodayPrefix={false}
      />,
    );

    expect(screen.getByTestId("app-date-picker-trigger")).toHaveTextContent("开始日期");
    expect(screen.getByTestId("app-date-picker-trigger")).not.toHaveTextContent("请选择日期");

    rerender(
      <AppDatePicker
        value="2025-03-12"
        onChange={() => {}}
        compact
        buttonLabel="开始日期"
        buttonLabelMode="empty-only"
        compactDisplayStyle="short-year"
        showTodayPrefix={false}
      />,
    );

    expect(screen.getByTestId("app-date-picker-trigger")).toHaveTextContent("25-03-12");
    expect(screen.getByTestId("app-date-picker-trigger")).not.toHaveTextContent("开始日期");
  });

  it("still allows choosing a date from the calendar grid", () => {
    const onChange = vi.fn();

    render(<AppDatePicker value="2026-03-23" onChange={onChange} compact />);

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));
    fireEvent.click(screen.getByRole("button", { name: "选择 2026-03-24" }));

    expect(onChange).toHaveBeenCalledWith("2026-03-24");
  });
});
