import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import type { CloudyAnalysisResult } from "../lib/cloudy-analysis";
import { CloudyArchiveView, type CloudyArchiveItem } from "./CloudyArchiveView";

const baseItems: CloudyArchiveItem[] = [
  {
    id: "cloudy-ready",
    content: "开会时被突然否定，心里一直坠着。",
    createdAt: "2026-03-26T10:30:00+08:00",
    displayDate: "2026-03-26",
    personId: "person-self",
    status: "ready",
    aiResponse: {
      hug: "我听见那一下的失重感。",
      analysis: "那不是你的价值被抹掉，只是别人的慌乱碰到了你。",
      light: "去窗边站一分钟，让眼睛看一看远处。",
    },
  },
  {
    id: "cloudy-failed",
    content: "今天像是被潮湿的棉被裹住了。",
    createdAt: "2026-03-25T22:10:00+08:00",
    displayDate: "2026-03-25",
    personId: "person-self",
    status: "failed",
    aiResponse: null,
  },
];

describe("CloudyArchiveView", () => {
  it("renders the archive list with summaries, timestamps, and status actions", () => {
    const onOpenItem = vi.fn();
    const onRetryItem = vi.fn();

    render(
      <CloudyArchiveView
        items={baseItems}
        loading={false}
        retryingId=""
        selectedItem={null}
        selectedLetter={null}
        onBackToTimeline={() => {}}
        onOpenItem={onOpenItem}
        onRetryItem={onRetryItem}
        onBackToArchive={() => {}}
      />,
    );

    expect(screen.getByText("解忧档案袋")).toBeInTheDocument();
    expect(screen.getByText("开会时被突然否定，心里一直坠着。")).toBeInTheDocument();
    expect(screen.getByText("今天像是被潮湿的棉被裹住了。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /开会时被突然否定/ }));
    fireEvent.click(screen.getByRole("button", { name: "重试回信" }));

    expect(onOpenItem).toHaveBeenCalledWith("cloudy-ready");
    expect(onRetryItem).toHaveBeenCalledWith("cloudy-failed");
  });

  it("renders the stored healing letter when a ready record is selected", () => {
    const selectedLetter: CloudyAnalysisResult = {
      hug: "我听见那一下的失重感。",
      analysis: "那不是你的价值被抹掉，只是别人的慌乱碰到了你。",
      light: "去窗边站一分钟，让眼睛看一看远处。",
    };

    render(
      <CloudyArchiveView
        items={baseItems}
        loading={false}
        retryingId=""
        selectedItem={baseItems[0]}
        selectedLetter={selectedLetter}
        onBackToTimeline={() => {}}
        onOpenItem={() => {}}
        onRetryItem={() => {}}
        onBackToArchive={() => {}}
      />,
    );

    expect(screen.getByText("抱抱")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "回到档案袋" })).toBeInTheDocument();
  });
});
