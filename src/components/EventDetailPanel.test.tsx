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
    onContentChange: vi.fn(),
    onReasonChange: vi.fn(),
    onDateChange: vi.fn(),
    onPersonChange: vi.fn(),
    onImageChange: vi.fn(),
    onRemoveImage: vi.fn(),
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
    expect(screen.getByTestId("detail-editor-save")).toBeInTheDocument();
    expect(screen.getByTestId("detail-editor-cancel")).toBeInTheDocument();
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
      />,
    );

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.queryByText("暂时没有图片，但这个瞬间一样很亮。")).not.toBeInTheDocument();
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
      />,
    );

    fireEvent.click(
      screen.getByTestId("detail-editor-media").querySelector("button") as Element,
    );

    expect(screen.getByText("选择一种方式")).toBeInTheDocument();
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
});
