import { render, screen, within } from "@testing-library/react";

import PearlDawnDetailedPreviewPage from "./page";

describe("/preview/palette-systems/pearl-dawn", () => {
  it("renders three complete Pearl Dawn directions with eight static screens each", () => {
    render(<PearlDawnDetailedPreviewPage />);

    expect(
      screen.getByRole("heading", { name: "Pearl Dawn · iPhone 17 Pro 详细静态预览" }),
    ).toBeInTheDocument();

    const directionCards = screen.getAllByTestId("pearl-dawn-direction-card");
    expect(directionCards).toHaveLength(3);

    directionCards.forEach((card) => {
      expect(within(card).getAllByTestId("pearl-dawn-screen-card")).toHaveLength(8);
    });
  });

  it("keeps every phone canvas on the shared iPhone 17 Pro contract", () => {
    render(<PearlDawnDetailedPreviewPage />);

    const phoneCanvases = screen.getAllByTestId("pearl-dawn-phone-canvas");
    expect(phoneCanvases).toHaveLength(24);

    phoneCanvases.forEach((canvas) => {
      expect(canvas).toHaveAttribute("data-phone-canvas", "iphone-17-pro");
      expect(canvas).toHaveAttribute("data-canvas-width", "402");
      expect(canvas).toHaveAttribute("data-canvas-height", "874");
      expect(canvas).toHaveAttribute("data-safe-top", "59");
      expect(canvas).toHaveAttribute("data-safe-side", "14");
      expect(canvas).toHaveAttribute("data-safe-bottom", "34");
    });
  });
});
