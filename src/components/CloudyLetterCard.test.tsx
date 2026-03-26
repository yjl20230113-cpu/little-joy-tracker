import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { CloudyLetterCard } from "./CloudyLetterCard";

describe("CloudyLetterCard", () => {
  it("renders the three healing sections and the updated joy footer action", () => {
    render(
      <CloudyLetterCard
        letter={{
          hug: "我听见你把很多委屈都悄悄咽回去了。",
          analysis: "今天的风太硬，不等于你不够稳。",
          light: "先摸一摸杯壁的温度，让身体先回到这里。",
        }}
        onFooterAction={() => {}}
      />,
    );

    expect(screen.getByText("抱抱")).toBeInTheDocument();
    expect(screen.getByText("拆解")).toBeInTheDocument();
    expect(screen.getByText("光亮")).toBeInTheDocument();
    expect(
      screen.getByText("我听见你把很多委屈都悄悄咽回去了。"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "回到小美好" })).toBeInTheDocument();
  });

  it("supports an archive footer action label", () => {
    const onFooterAction = vi.fn();

    render(
      <CloudyLetterCard
        letter={{
          hug: "我在。",
          analysis: "慢一点没有关系。",
          light: "看一分钟窗边的光。",
        }}
        footerActionLabel="回到档案袋"
        onFooterAction={onFooterAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "回到档案袋" }));

    expect(onFooterAction).toHaveBeenCalledTimes(1);
  });
});
