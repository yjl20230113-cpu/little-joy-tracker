import { render, screen, within } from "@testing-library/react";

import PaletteSystemsPreviewPage from "./page";

describe("/preview/palette-systems", () => {
  it("renders five palette directions with eight screen blueprints each", () => {
    render(<PaletteSystemsPreviewPage />);

    expect(
      screen.getByRole("heading", { name: "Little Joy Tracker 配色与结构比稿" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A. Cream Air")).toBeInTheDocument();
    expect(screen.getByText("B. Pearl Dawn")).toBeInTheDocument();
    expect(screen.getByText("C. Sage Light")).toBeInTheDocument();
    expect(screen.getByText("D. Lake Mist")).toBeInTheDocument();
    expect(screen.getByText("E. Rose Sand")).toBeInTheDocument();

    const paletteCards = screen.getAllByTestId("palette-system-card");
    expect(paletteCards).toHaveLength(5);

    paletteCards.forEach((card) => {
      expect(within(card).getAllByTestId("screen-blueprint-card")).toHaveLength(8);
    });
  });

  it("marks the reference-driven concept and keeps joy/cloudy contrast visible", () => {
    render(<PaletteSystemsPreviewPage />);

    expect(screen.getByText("参考图气质方案")).toBeInTheDocument();
    expect(screen.getAllByText("小美好")).not.toHaveLength(0);
    expect(screen.getAllByText("小烦恼")).not.toHaveLength(0);
  });

  it("links Pearl Dawn to the detailed preview route", () => {
    render(<PaletteSystemsPreviewPage />);

    expect(
      screen.getByRole("link", { name: "查看 Pearl Dawn 详细预览" }),
    ).toHaveAttribute("href", "/preview/palette-systems/pearl-dawn");
  });
});
