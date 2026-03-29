import { fireEvent, render, screen } from "@testing-library/react";
import { AppBottomNav } from "./AppBottomNav";

describe("AppBottomNav", () => {
  it("renders the shared app navigation and reports tab changes", () => {
    const onTabChange = vi.fn();

    render(<AppBottomNav activeTab="timeline" onTabChange={onTabChange} />);

    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toHaveAttribute(
      "data-tone",
      "default",
    );
    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toHaveClass(
      "bg-[rgba(255,251,231,0.96)]",
    );
    expect(document.querySelector('[data-ui="app-bottom-nav"]')).not.toHaveClass(
      "joy-blur-panel",
    );

    expect(screen.getByRole("button", { name: "每日悦点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "心绪日志" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByRole("button", { name: "治愈社区" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "治愈社区" }));

    expect(onTabChange).toHaveBeenCalledWith("insight");
  });

  it("supports a warm tone for archive-specific bottom nav styling", () => {
    render(<AppBottomNav activeTab="timeline" onTabChange={() => {}} tone="warm" />);

    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toHaveAttribute(
      "data-tone",
      "warm",
    );
    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toHaveClass(
      "bg-[rgba(255,251,231,0.96)]",
    );
  });

  it("supports preview-only surface and active item color overrides", () => {
    render(
      <AppBottomNav
        activeTab="timeline"
        onTabChange={() => {}}
        surfaceClassName="bg-[rgba(255,252,238,0.97)] border-[rgba(205,162,101,0.1)]"
        activeItemClassName="bg-[rgba(255,225,210,0.74)]"
      />,
    );

    expect(document.querySelector('[data-ui="app-bottom-nav"]')).toHaveClass(
      "bg-[rgba(255,252,238,0.97)]",
      "border-[rgba(205,162,101,0.1)]",
    );
    expect(
      document.querySelector('[data-ui="app-bottom-nav"] button[data-active="true"]'),
    ).toHaveClass("bg-[rgba(255,225,210,0.74)]");
  });
});
