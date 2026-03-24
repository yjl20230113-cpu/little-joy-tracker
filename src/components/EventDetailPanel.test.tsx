import type { FormEvent } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { EventDetailPanel } from "./EventDetailPanel";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: Record<string, unknown>) => <img alt="" {...props} />,
}));

describe("EventDetailPanel", () => {
  const baseProps = {
    event: {
      id: "event-1",
      content: "Autumn's first tiny sprout",
      reason: "It reminded me that growth begins with finding light.",
      imageUrl: "https://example.com/sprout.jpg",
      displayDate: "2026-03-22",
      createdAt: "2026-03-22T14:30:25+08:00",
      personName: "Self",
      personId: "person-self",
      aiInsightStatus: "ready" as const,
      aiInsight: {
        unseen_joy: {
          title: "The care behind the pause",
          content: "You may not have written it directly, but the sprout also held a quiet return to hope.",
        },
        highlight: {
          title: "Growth gets noticed",
          content: "The tiny sprout also reads like a record of hope beginning again. The entry looks light on the surface, but it carries patience for small change.",
        },
        gentle_reflection:
          "The tiny sprout also reads like a record of hope beginning again. The entry looks light on the surface, but it carries patience for small change.",
        emotion_signal: {
          title: "Emotion lifts",
          content: "Paying attention to the sprout suggests you are ready to believe change can happen.",
        },
        relationship_signal: {
          title: "Life feels closer again",
          content: "The moment is less about one person and more about reconnecting with the world.",
        },
        value_signal: {
          title: "Slow growth matters",
          content: "You seem to care about what is just beginning, not only what is already blooming.",
        },
      },
    },
    people: [
      { id: "person-self", name: "Self", is_default: true },
      { id: "person-dad", name: "Dad", is_default: false },
    ],
    editing: false,
    saving: false,
    deleting: false,
    uploading: false,
    confirmingDelete: false,
    message: "",
    selectedImageName: "",
    imagePreviewUrl: "https://example.com/sprout.jpg",
    onDeleteCancel: vi.fn(),
    onDeleteConfirm: vi.fn(),
    onTitleChange: vi.fn(),
    onContentChange: vi.fn(),
    onReasonChange: vi.fn(),
    onDateChange: vi.fn(),
    onPersonChange: vi.fn(),
    onImageChange: vi.fn(),
    onRemoveImage: vi.fn(),
    onRetryInsight: vi.fn(),
    onSave: (event: FormEvent<HTMLFormElement>) => event.preventDefault(),
    onCancelEdit: vi.fn(),
  };

  it("asks for confirmation before deleting the record", () => {
    render(<EventDetailPanel {...baseProps} confirmingDelete />);

    expect(screen.getByTestId("detail-delete-confirm")).toBeInTheDocument();
    expect(baseProps.onDeleteConfirm).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("detail-delete-confirm-action"));

    expect(baseProps.onDeleteConfirm).toHaveBeenCalledTimes(1);
  });

  it("shows record-style editing controls when editing is enabled", () => {
    render(
      <EventDetailPanel
        {...baseProps}
        editing
        imagePreviewUrl={null}
      />,
    );

    expect(screen.getByTestId("detail-editor-form")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-media")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-person-trigger")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-date")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-title")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-save")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-cancel")).toBeInTheDocument();
  });

  it("shows an upload-specific action label while a detail image is uploading", () => {
    render(
      <EventDetailPanel
        {...baseProps}
        editing
        uploading
      />,
    );

    expect(screen.getByTestId("detail-editor-save")).toHaveTextContent("正在处理图片...");
    expect(screen.getByTestId("detail-editor-save")).toBeDisabled();
  });

  it("hides the media block in read mode when there is no image", () => {
    const { container } = render(
      <EventDetailPanel
        {...baseProps}
        imagePreviewUrl={null}
        event={{
          ...baseProps.event,
          imageUrl: null,
        }}
      />
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });

  it("does not render the old inline detail header controls", () => {
    render(<EventDetailPanel {...baseProps} />);

    expect(screen.queryByTestId("detail-delete-trigger")).not.toBeInTheDocument();
  });

  it("uses the same bottom image action sheet in edit mode", () => {
    const onRemoveImage = vi.fn();

    render(
      <EventDetailPanel
        {...baseProps}
        editing
        onRemoveImage={onRemoveImage}
      />
    );

    fireEvent.click(
      screen.getByTestId("detail-editor-media").querySelector("button") as Element,
    );

    expect(screen.getByRole("button", { name: "拍照" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "从手机相册选择" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "移除当前照片" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "移除当前照片" }));

    expect(onRemoveImage).toHaveBeenCalledTimes(1);
  });
  it("uses the same image trigger content shape as quick entry when an image exists", () => {
    render(<EventDetailPanel {...baseProps} editing />);

    const media = screen.getByTestId("detail-editor-media");
    const trigger = media.querySelector("button");

    expect(trigger).toBeInTheDocument();
    expect(trigger?.querySelector("div")).not.toBeInTheDocument();
    expect(trigger?.querySelector("span")).toBeInTheDocument();
  });

  it("centers the calendar panel on the detail date trigger", () => {
    render(<EventDetailPanel {...baseProps} editing />);

    fireEvent.click(
      within(screen.getByTestId("detail-editor-date")).getByRole("button", {
        name: /2026\/03\/22/,
      }),
    );

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "left-1/2",
      "-translate-x-1/2",
    );
  });

  it("lets the user edit the title in detail mode", () => {
    const onTitleChange = vi.fn();

    render(
      <EventDetailPanel
        {...baseProps}
        editing
        onTitleChange={onTitleChange}
      />,
    );

    fireEvent.change(screen.getByTestId("detail-editor-title"), {
      target: { value: "鎵嬪姩鏍囬" },
    });

    expect(onTitleChange).toHaveBeenCalledWith("鎵嬪姩鏍囬");
  });
  it("renders the persisted single-record AI cards in read mode", () => {
    render(<EventDetailPanel {...baseProps} />);

    expect(screen.getByTestId("detail-ai-panel")).toHaveTextContent("The care behind the pause");
    expect(screen.getByTestId("detail-ai-panel")).toHaveTextContent("Growth gets noticed");
    expect(screen.getByTestId("detail-ai-panel")).toHaveTextContent("Emotion lifts");
    expect(screen.getByTestId("detail-ai-panel")).toHaveTextContent("Life feels closer again");
    expect(screen.getByTestId("detail-ai-panel")).toHaveTextContent("Slow growth matters");
    expect(screen.queryByText("温柔解读")).not.toBeInTheDocument();
  });

  it("shows unseen joy before the main highlight in the AI section", () => {
    render(<EventDetailPanel {...baseProps} />);

    const aiPanelText = screen.getByTestId("detail-ai-panel").textContent ?? "";
    expect(aiPanelText.indexOf("The care behind the pause")).toBeLessThan(
      aiPanelText.indexOf("Growth gets noticed"),
    );
  });

  it("shows a pending state while single-record AI analysis is still running", () => {
    render(
      <EventDetailPanel
        {...baseProps}
        event={{
          ...baseProps.event,
          aiInsightStatus: "pending",
          aiInsight: null,
        }}
      />,
    );

    expect(screen.getByTestId("detail-ai-pending")).toBeInTheDocument();
  });

  it("offers a retry action when the single-record AI analysis failed", () => {
    const onRetryInsight = vi.fn();

    render(
      <EventDetailPanel
        {...baseProps}
        onRetryInsight={onRetryInsight}
        event={{
          ...baseProps.event,
          aiInsightStatus: "failed",
          aiInsight: null,
        }}
      />,
    );

    fireEvent.click(screen.getByTestId("detail-ai-retry"));

    expect(onRetryInsight).toHaveBeenCalledTimes(1);
  });
});
