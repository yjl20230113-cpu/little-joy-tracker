import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";
import { vi } from "vitest";

import type { CloudyAnalysisResult } from "../lib/cloudy-analysis";
import { CloudyArchiveView, type CloudyArchiveItem } from "./CloudyArchiveView";

const baseItems: CloudyArchiveItem[] = [
  {
    id: "cloudy-ready",
    content: "今天在会议上突然被点名，心里一直在发沉。",
    createdAt: "2026-03-26T10:30:00+08:00",
    displayDate: "2026-03-26",
    personId: "person-self",
    status: "ready",
    aiResponse: {
      themeTitle: "缝隙里的光",
      hug: "我听见了那一下坠下去的失重感。",
      analysis: "那不是你的价值被抹掉，只是别人的慌乱碰到了你。",
      light: "去窗边站一分钟，让眼睛看一看远处。",
    },
  },
  {
    id: "cloudy-failed",
    content: "今天整个人像被阴雨泡皱了。",
    createdAt: "2026-03-25T22:10:00+08:00",
    displayDate: "2026-03-25",
    personId: "person-dad",
    status: "failed",
    aiResponse: null,
  },
];

function renderArchive(
  overrideProps: Partial<ComponentProps<typeof CloudyArchiveView>> = {},
) {
  const props: ComponentProps<typeof CloudyArchiveView> = {
    items: baseItems,
    loading: false,
    retryingId: "",
    selectedItem: null,
    selectedLetter: null,
    deleteMode: false,
    deletingItemId: "",
    onBackToTimeline: () => {},
    onOpenItem: () => {},
    onRetryItem: () => {},
    onBackToArchive: () => {},
    onDeleteConfirm: () => {},
    ...overrideProps,
  };

  return render(<CloudyArchiveView {...props} />);
}

describe("CloudyArchiveView", () => {
  it("renders a grouped archive timeline without the old filter block", () => {
    const { container } = renderArchive();

    expect(screen.getByText("解忧档案袋")).toBeInTheDocument();
    expect(container.querySelector('[data-ui="cloudy-archive-intro"]')).toHaveClass(
      "bg-[linear-gradient(180deg,rgba(247,243,246,0.96),rgba(241,236,243,0.98))]",
    );
    expect(container.querySelector('[data-ui="cloudy-archive-card"]')).toHaveClass(
      "bg-[linear-gradient(180deg,rgba(247,243,246,0.96),rgba(241,236,243,0.98))]",
    );
    expect(screen.queryByTestId("timeline-filters")).not.toBeInTheDocument();
    expect(screen.getByText("今天在会议上突然被点名，心里一直在发沉。")).toBeInTheDocument();
    expect(screen.getByText("今天整个人像被阴雨泡皱了。")).toBeInTheDocument();
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(1);
  });

  it("calls the open and retry handlers from archive cards in normal mode", () => {
    const onOpenItem = vi.fn();
    const onRetryItem = vi.fn();

    renderArchive({ onOpenItem, onRetryItem });

    fireEvent.click(
      screen.getByRole("button", { name: "今天在会议上突然被点名，心里一直在发沉。" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "重试回信" }));

    expect(onOpenItem).toHaveBeenCalledWith("cloudy-ready");
    expect(onRetryItem).toHaveBeenCalledWith("cloudy-failed");
  });

  it("places the ready action in the header row so the content can use the full card width", () => {
    renderArchive();

    const readyButton = screen.getByRole("button", { name: "查看回信" });
    const readyCard = readyButton.closest("article");

    expect(readyCard).not.toBeNull();
    expect(readyButton).toHaveClass("bg-[rgba(75,53,45,0.9)]", "text-[#fff8f4]");

    const header = readyCard?.querySelector('[data-ui="cloudy-archive-card-header"]');
    const content = readyCard?.querySelector('[data-ui="cloudy-archive-card-content"]');

    expect(header).not.toBeNull();
    expect(content).not.toBeNull();
    expect(
      within(header as HTMLElement).getByRole("button", { name: "查看回信" }),
    ).toBeInTheDocument();
    expect(
      within(content as HTMLElement).queryByRole("button", { name: "查看回信" }),
    ).not.toBeInTheDocument();
  });

  it("switches cards into per-item delete mode without rendering a bottom confirm bar", () => {
    const onDeleteConfirm = vi.fn();

    renderArchive({
      deleteMode: true,
      onDeleteConfirm,
    });

    fireEvent.click(screen.getByTestId("cloudy-archive-delete-card-cloudy-failed"));

    expect(onDeleteConfirm).toHaveBeenCalledWith("cloudy-failed");
    expect(screen.queryByTestId("cloudy-archive-delete-confirm")).not.toBeInTheDocument();
  });

  it("renders the stored healing letter when a ready record is selected", () => {
    const selectedLetter: CloudyAnalysisResult = {
      themeTitle: "缝隙里的光",
      hug: "我听见了那一下坠下去的失重感。",
      analysis: "那不是你的价值被抹掉，只是别人的慌乱碰到了你。",
      light: "去窗边站一分钟，让眼睛看一看远处。",
    };

    renderArchive({
      selectedItem: baseItems[0],
      selectedLetter,
    });

    expect(screen.getByText("情绪镜像")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "回到档案袋" })).toBeInTheDocument();
  });
});
