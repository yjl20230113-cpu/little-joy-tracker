import { render, screen } from "@testing-library/react";
import { BookOpen, Sparkles } from "lucide-react";
import { AppTopBar } from "./AppTopBar";

describe("AppTopBar", () => {
  it("renders the shared compact chrome for page headers", () => {
    const { container } = render(
      <AppTopBar
        title="Little Joy Tracker"
        leadingIcon={Sparkles}
        trailingIcon={BookOpen}
      />,
    );

    expect(container.querySelector('[data-ui="app-topbar"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="app-topbar-leading"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="app-topbar-trailing"]'),
    ).toBeInTheDocument();
    expect(screen.getByText("Little Joy Tracker")).toHaveClass("text-[1rem]");
  });

  it("renders a title accessory next to the brand without replacing the right slot", () => {
    render(
      <AppTopBar
        title="Little Joy Tracker"
        leadingIcon={Sparkles}
        titleAccessory={<button type="button">enter-cloudy</button>}
        rightSlot={<button type="button">back-to-joy</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "enter-cloudy" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "back-to-joy" })).toBeInTheDocument();
  });
});
