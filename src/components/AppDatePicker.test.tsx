import { fireEvent, render, screen } from "@testing-library/react";
import { AppDatePicker } from "./AppDatePicker";

describe("AppDatePicker", () => {
  it("supports a centered calendar panel alignment", () => {
    render(
      <AppDatePicker
        value="2026-03-23"
        onChange={() => {}}
        align="center"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /2026\/03\/23/ }));

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "left-1/2",
      "-translate-x-1/2",
    );
    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "w-[min(16rem,calc(100vw-2rem))]",
    );
  });
});
