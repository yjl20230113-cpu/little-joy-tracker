import { render, screen } from "@testing-library/react";
import BottomNavTonesPreviewPage from "./page";

describe("/preview/bottom-nav-tones", () => {
  it("renders three full-page palette candidates for visual comparison", () => {
    render(<BottomNavTonesPreviewPage />);

    expect(screen.getByRole("heading", { name: "整体页面配色预览" })).toBeInTheDocument();
    expect(screen.getByText("A · Cream Dawn")).toBeInTheDocument();
    expect(screen.getByText("B · Paper Bloom")).toBeInTheDocument();
    expect(screen.getByText("C · Apricot Haze")).toBeInTheDocument();
    expect(screen.getAllByTestId("bottom-nav-preview-card")).toHaveLength(3);
  });
});
