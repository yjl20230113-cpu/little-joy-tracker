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

  it("shows a compact today label and a smaller panel in compact mode", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23T08:00:00.000Z"));

    render(
      <AppDatePicker
        value="2026-03-23"
        onChange={() => {}}
        align="right"
        compact
        enableTextInput
      />,
    );

    expect(screen.getByTestId("app-date-picker-trigger")).toHaveTextContent("今天 3-23");

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "w-[min(13.5rem,calc(100vw-1.5rem))]",
    );
    expect(screen.getByTestId("app-date-picker-input")).toHaveValue("2026-03-23");

    vi.useRealTimers();
  });

  it("accepts direct YYYY-MM-DD input in compact mode", () => {
    const onChange = vi.fn();

    render(
      <AppDatePicker
        value="2026-03-23"
        onChange={onChange}
        compact
        enableTextInput
      />,
    );

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));
    fireEvent.change(screen.getByTestId("app-date-picker-input"), {
      target: { value: "2026-03-25" },
    });
    fireEvent.keyDown(screen.getByTestId("app-date-picker-input"), {
      key: "Enter",
      code: "Enter",
    });

    expect(onChange).toHaveBeenCalledWith("2026-03-25");
  });

  it("still allows choosing a date from the calendar grid", () => {
    const onChange = vi.fn();

    render(
      <AppDatePicker
        value="2026-03-23"
        onChange={onChange}
        compact
        enableTextInput
      />,
    );

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));
    fireEvent.click(screen.getByRole("button", { name: "选择 2026-03-24" }));

    expect(onChange).toHaveBeenCalledWith("2026-03-24");
  });
});
