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
    expect(screen.getByText("Little Joy Tracker")).toHaveClass("text-[1.3rem]");
  });
});
