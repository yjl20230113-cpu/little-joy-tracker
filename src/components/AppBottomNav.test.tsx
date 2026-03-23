import { fireEvent, render, screen } from "@testing-library/react";
import { AppBottomNav } from "./AppBottomNav";

describe("AppBottomNav", () => {
  it("renders the shared app navigation and reports tab changes", () => {
    const onTabChange = vi.fn();

    render(<AppBottomNav activeTab="timeline" onTabChange={onTabChange} />);

    expect(screen.getByRole("button", { name: "每日悦点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "心绪日志" })).toHaveAttribute(
      "data-active",
      "true",
    );
    expect(screen.getByRole("button", { name: "治愈社区" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "治愈社区" }));

    expect(onTabChange).toHaveBeenCalledWith("insight");
  });
});
