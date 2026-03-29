import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { vi } from "vitest";

import { DetailTopBarActionButtons } from "./DetailTopBarControls";

describe("DetailTopBarActionButtons", () => {
  it("shows edit and delete actions in read mode", () => {
    render(
      <DetailTopBarActionButtons
        editing={false}
        saving={false}
        deleting={false}
        onEditToggle={() => {}}
        onSaveRequest={() => {}}
        onCancelEdit={() => {}}
        onDeleteRequest={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
  });

  it("switches to save and cancel-edit actions in editing mode", () => {
    const onCancelEdit = vi.fn();
    const onSaveRequest = vi.fn();

    render(
      <DetailTopBarActionButtons
        editing
        saving={false}
        deleting={false}
        onEditToggle={() => {}}
        onSaveRequest={onSaveRequest}
        onCancelEdit={onCancelEdit}
        onDeleteRequest={() => {}}
      />,
    );

    const saveButton = screen.getByRole("button", { name: "保存修改" });

    expect(saveButton).toHaveAttribute("type", "button");
    expect(screen.getByRole("button", { name: "取消编辑" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "删除" })).not.toBeInTheDocument();

    fireEvent.click(saveButton);
    fireEvent.click(screen.getByRole("button", { name: "取消编辑" }));

    expect(onSaveRequest).toHaveBeenCalledTimes(1);
    expect(onCancelEdit).toHaveBeenCalledTimes(1);
  });

  it("does not auto-submit when switching from edit to editing mode", () => {
    const onSubmit = vi.fn();

    function Harness() {
      const [editing, setEditing] = useState(false);
      const [saving, setSaving] = useState(false);

      return (
        <>
          <DetailTopBarActionButtons
            editing={editing}
            saving={saving}
            deleting={false}
            onEditToggle={() => setEditing(true)}
            onSaveRequest={() => {
              onSubmit();
              setSaving(true);
            }}
            onCancelEdit={() => setEditing(false)}
            onDeleteRequest={() => {}}
          />
          <form id="detail-editor-form" />
        </>
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "编辑" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "保存修改" })).toBeInTheDocument();
  });
});
