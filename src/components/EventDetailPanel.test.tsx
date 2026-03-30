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

  it("does not render the delete confirmation inline inside the scrolling panel", () => {
    render(<EventDetailPanel {...baseProps} confirmingDelete />);

    expect(screen.queryByTestId("detail-delete-confirm")).not.toBeInTheDocument();
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
    expect(screen.queryByTestId("detail-editor-save")).not.toBeInTheDocument();
    expect(screen.queryByTestId("detail-editor-cancel")).not.toBeInTheDocument();
  });

  it("keeps the detail form editable while upload state is handled from the top bar", () => {
    render(
      <EventDetailPanel
        {...baseProps}
        editing
        uploading
      />,
    );

    expect(screen.queryByTestId("detail-editor-save")).not.toBeInTheDocument();
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

  it("anchors the detail date picker below the trigger and centered on the viewport", () => {
    render(<EventDetailPanel {...baseProps} editing />);

    const trigger = within(screen.getByTestId("detail-editor-date")).getByRole("button", {
      name: /2026\/03\/22/,
    });
    (trigger as unknown as { getBoundingClientRect: () => DOMRect }).getBoundingClientRect =
      () =>
        ({
          width: 120,
          height: 40,
          top: 160,
          left: 16,
          right: 136,
          bottom: 200,
          x: 16,
          y: 160,
          toJSON: () => ({}),
        }) as DOMRect;

    fireEvent.click(trigger);

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "fixed",
      "left-1/2",
      "-translate-x-1/2",
    );
    expect(screen.getByTestId("app-date-picker-panel").style.top).toBe("210px");
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

    expect(document.querySelector('[data-ui="detail-reading-shell"]')).toHaveClass(
      "space-y-5",
    );
    expect(screen.getByTestId("detail-ai-panel")).toHaveClass(
      "bg-[rgba(255,251,247,0.9)]",
      "border-[rgba(75,53,45,0.08)]",
    );
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

  it("shows the local placeholder image in read mode while auto-image is pending without a real photo", () => {
    render(
      <EventDetailPanel
        {...baseProps}
        imagePreviewUrl={null}
        event={{
          ...baseProps.event,
          imageUrl: null,
          aiInsightStatus: "pending",
          aiInsight: null,
          autoImageStatus: "pending",
          autoImageAttribution: null,
        }}
      />,
    );

    expect(screen.getByAltText(/Autumn's first tiny sprout/i)).toHaveAttribute(
      "src",
      "/auto-image-placeholder.svg",
    );
  });

  it("keeps read mode image-free after a user-deleted photo cleared auto-image state", () => {
    const { container } = render(
      <EventDetailPanel
        {...baseProps}
        imagePreviewUrl={null}
        event={{
          ...baseProps.event,
          imageUrl: null,
          autoImageStatus: null,
          autoImageAttribution: null,
        }}
      />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
  });
  it("shows the local placeholder in read mode when the image url is an empty string", () => {
    render(
      <EventDetailPanel
        {...baseProps}
        imagePreviewUrl={null}
        event={{
          ...baseProps.event,
          imageUrl: "",
          autoImageStatus: "pending",
          autoImageAttribution: null,
        }}
      />,
    );

    expect(screen.getByAltText(/Autumn's first tiny sprout/i)).toHaveAttribute(
      "src",
      "/auto-image-placeholder.svg",
    );
  });
});
