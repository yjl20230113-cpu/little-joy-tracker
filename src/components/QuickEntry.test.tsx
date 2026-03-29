import type { FormEvent } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import type { CloudyAnalysisResult } from "../lib/cloudy-analysis";
import { QuickEntry } from "./QuickEntry";

describe("QuickEntry", () => {
  const baseProps = {
    people: [{ id: "person-1", name: "Self", is_default: true }],
    mode: "JOY" as const,
    selectedPersonId: "person-1",
    content: "",
    reason: "",
    displayDate: "2026-03-23",
    saving: false,
    uploading: false,
    cloudyLoading: false,
    cloudyLoadingMessage: "",
    cloudyLetter: null as CloudyAnalysisResult | null,
    message: "",
    selectedImageName: "",
    imagePreviewUrl: null as string | null,
    activeTab: "quick-entry" as const,
    onPersonChange: () => {},
    onTabChange: () => {},
    onCreatePerson: async () => true,
    onDeletePerson: async () => ({ ok: true }),
    onContentChange: () => {},
    onReasonChange: () => {},
    onDateChange: () => {},
    onImageChange: () => {},
    onRemoveImage: () => {},
    onSave: (event: FormEvent<HTMLFormElement>) => event.preventDefault(),
    onCancel: () => {},
    onEnterCloudyMode: () => {},
    onExitCloudyMode: () => {},
    onCloudyLetterDismiss: () => {},
  };

  it("renders a compact top toolbar with person and date controls", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23T08:00:00.000Z"));

    const { container } = render(<QuickEntry {...baseProps} />);

    expect(
      container.querySelector('[data-ui="quick-entry-toolbar"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-person-trigger"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-date"]'),
    ).toBeInTheDocument();
    expect(screen.getByTestId("app-date-picker-trigger")).toHaveTextContent("03-23");

    vi.useRealTimers();
  });

  it("opens a bottom action sheet for camera and gallery selection", () => {
    const { container } = render(
      <QuickEntry
        {...baseProps}
        content="walk together"
        reason="soft wind"
        message="Connected"
        selectedImageName="sunset.jpg"
        imagePreviewUrl="https://example.com/sunset.jpg"
      />,
    );

    fireEvent.click(
      container.querySelector('[data-ui="quick-entry-media-trigger"]') as Element,
    );

    expect(screen.getByRole("button", { name: "拍照" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "从手机相册选择" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "移除当前照片" })).toBeInTheDocument();
  });

  it("opens the lighter person menu from the top toolbar", () => {
    const { container } = render(<QuickEntry {...baseProps} />);

    fireEvent.click(
      container.querySelector('[data-ui="quick-entry-person-trigger"]') as Element,
    );

    expect(
      container.querySelector('[data-ui="quick-entry-person-menu"]'),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /创建/i })).toBeInTheDocument();
  });

  it("shows an upload-specific action label while the image is uploading", () => {
    const { container } = render(
      <QuickEntry
        {...baseProps}
        uploading
        selectedImageName="sunset.jpg"
        imagePreviewUrl="https://example.com/sunset.jpg"
      />,
    );

    const submitButton = container.querySelector(
      '[data-ui="quick-entry-footer"] button[type="submit"]',
    );

    expect(submitButton).toBeDisabled();
    expect(
      container.querySelector('[data-ui="quick-entry-media-trigger"]'),
    ).toBeDisabled();
  });

  it("shows a save-specific action label while the entry is being saved", () => {
    const { container } = render(<QuickEntry {...baseProps} saving />);
    const submitButton = container.querySelector(
      '[data-ui="quick-entry-footer"] button[type="submit"]',
    );

    expect(submitButton).toBeDisabled();
  });

  it("keeps the floating save rail separate from the bottom nav", () => {
    const { container } = render(<QuickEntry {...baseProps} />);
    const footer = container.querySelector('[data-ui="quick-entry-footer"]');

    expect(footer?.querySelector('button[type="submit"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-save-rail"]'),
    ).toBeInTheDocument();
    expect(
      footer?.querySelector('[data-testid="app-date-picker-trigger"]'),
    ).not.toBeInTheDocument();
  });

  it("lets the bottom navigation switch to the profile tab", () => {
    const onTabChange = vi.fn();

    render(<QuickEntry {...baseProps} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole("button", { name: "个人中心" }));

    expect(onTabChange).toHaveBeenCalledWith("profile");
  });

  it("closes the action sheet when cancel is tapped", () => {
    const { container } = render(<QuickEntry {...baseProps} />);

    fireEvent.click(
      container.querySelector('[data-ui="quick-entry-media-trigger"]') as Element,
    );
    expect(screen.getByRole("button", { name: "从手机相册选择" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "取消" }).at(-1) as Element);

    expect(
      screen.queryByRole("button", { name: "从手机相册选择" }),
    ).not.toBeInTheDocument();
  });

  it("shows remove image only when there is an image to clear", () => {
    const onRemoveImage = vi.fn();
    const { container } = render(
      <QuickEntry
        {...baseProps}
        selectedImageName="memory.jpg"
        imagePreviewUrl="https://example.com/memory.jpg"
        onRemoveImage={onRemoveImage}
      />,
    );

    fireEvent.click(
      container.querySelector('[data-ui="quick-entry-media-trigger"]') as Element,
    );
    fireEvent.click(screen.getByRole("button", { name: "移除当前照片" }));

    expect(onRemoveImage).toHaveBeenCalledTimes(1);
  });

  it("centers the compact calendar panel on the top-row date trigger", () => {
    render(<QuickEntry {...baseProps} />);

    fireEvent.click(screen.getByTestId("app-date-picker-trigger"));

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "left-1/2",
      "-translate-x-1/2",
    );
  });

  it("does not render an inline AI preview area on the entry page", () => {
    render(<QuickEntry {...baseProps} />);

    expect(screen.queryByTestId("quick-entry-insight-trigger")).not.toBeInTheDocument();
    expect(screen.queryByTestId("quick-entry-insight-panel")).not.toBeInTheDocument();
  });

  it("shows the softened helper copy in the empty upload area", () => {
    render(<QuickEntry {...baseProps} />);

    expect(
      screen.getByText(
        "这一刻还没来得及拍照也没关系。先记下它，保存后小美好会悄悄配上一张刚刚好的画面。",
      ),
    ).toBeInTheDocument();
  });

  it("shows message as a centered toast and auto-hides it after three seconds", () => {
    vi.useFakeTimers();

    render(<QuickEntry {...baseProps} message="saved" />);

    expect(screen.getByTestId("app-toast")).toHaveTextContent("saved");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByTestId("app-toast")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders a visible joy-side button to enter the rain shelter", () => {
    render(<QuickEntry {...baseProps} />);

    expect(screen.getByRole("button", { name: "进入小烦恼" })).toBeInTheDocument();
  });

  it("switches to the cloudy composer while keeping the bottom nav and footer action rail", () => {
    const { container } = render(
      <QuickEntry {...baseProps} mode="CLOUDY" content="Today feels heavy." />,
    );
    const cloudySurface = container.querySelector('[data-ui="cloudy-mode-surface"]');
    const footer = container.querySelector('[data-ui="quick-entry-footer"]');
    const navSupport = container.querySelector('[data-ui="quick-entry-nav-support"]');

    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(cloudySurface).toHaveClass("bg-[#eadfff]");
    expect(footer).toHaveClass("bg-[#eadfff]");
    expect(navSupport).toHaveClass("bg-[#eadfff]");
    expect(container.querySelector('[data-ui="cloudy-date"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-media"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-person-trigger"]'),
    ).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-footer"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="app-bottom-nav"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="quick-entry-footer"] button[type="submit"]'),
    ).toBeInTheDocument();
  });

  it("places the cloudy date picker between the top bar and the input card", () => {
    const { container } = render(<QuickEntry {...baseProps} mode="CLOUDY" />);
    const cloudyDate = container.querySelector('[data-ui="cloudy-date"]');
    const textbox = screen.getByRole("textbox");

    expect(cloudyDate).toBeInTheDocument();
    expect(
      cloudyDate?.compareDocumentPosition(textbox) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("shows the updated cloudy labels and the healing letter card", () => {
    render(
      <QuickEntry
        {...baseProps}
        mode="CLOUDY"
        content="今天有点灰。"
        cloudyLoading
        cloudyLoadingMessage="已放入档案袋，回信会稍后安静落下。"
        cloudyLetter={{
          themeTitle: "允许一切发生",
          hug: "我听见你在强撑。",
          analysis: "这不是你的全部。",
          light: "先把窗帘拉开一点。",
        }}
      />,
    );

    expect(screen.getByText("已放入档案袋，回信会稍后安静落下。")).toBeInTheDocument();
    expect(screen.getByText("抱抱")).toBeInTheDocument();
    expect(screen.getByText("拆解")).toBeInTheDocument();
    expect(screen.getByText("光亮")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "放入档案袋" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "回到小美好" })).toHaveLength(2);
  });
});
