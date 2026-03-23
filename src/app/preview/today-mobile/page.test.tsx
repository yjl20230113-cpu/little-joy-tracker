import { fireEvent, render, screen } from "@testing-library/react";
import TodayMobilePreviewPage from "./page";

describe("/preview/today-mobile", () => {
  it("renders the isolated today mobile preview with demo content", () => {
    render(<TodayMobilePreviewPage />);

    expect(screen.getByRole("heading", { name: "心情驿站" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("搜索今天的心情")).toBeInTheDocument();
    expect(screen.getByText("每天三件开心事")).toBeInTheDocument();
    expect(screen.getByText("感恩日记")).toBeInTheDocument();
    expect(screen.getByText("每日一句")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "记录" })).toBeInTheDocument();
  });

  it("keeps bottom navigation interactions local to the preview page", () => {
    render(<TodayMobilePreviewPage />);

    const todayButton = screen.getByRole("button", { name: "今日" });
    const trailButton = screen.getByRole("button", { name: "足迹" });

    expect(todayButton).toHaveAttribute("data-active", "true");
    expect(trailButton).toHaveAttribute("data-active", "false");

    fireEvent.click(trailButton);

    expect(todayButton).toHaveAttribute("data-active", "false");
    expect(trailButton).toHaveAttribute("data-active", "true");
  });
});
