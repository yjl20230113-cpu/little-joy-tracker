import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { QuickEntry } from "./QuickEntry";

describe("QuickEntry", () => {
  it("opens a bottom action sheet for camera and gallery selection", () => {
    const { container } = render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content="walk together"
        reason="soft wind"
        displayDate="2026-03-22"
        saving={false}
        uploading={false}
        message="已连接 Supabase"
        selectedImageName="sunset.jpg"
        imagePreviewUrl="https://example.com/sunset.jpg"
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByText("Little Joy Tracker")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("发生了什么？")).toHaveValue("walk together");
    expect(screen.getByPlaceholderText("为什么觉得美好？")).toHaveValue("soft wind");
    expect(container.querySelector('[data-ui="app-topbar"]')).toBeInTheDocument();
    expect(container.querySelector('[data-ui="app-bottom-nav"]')).toBeInTheDocument();
    expect(container.querySelector(".joy-app-content")).toBeInTheDocument();

    fireEvent.click(container.querySelector('[data-ui="quick-entry-media-trigger"]') as Element);

    expect(screen.getByText("选择一种方式")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "拍照" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "从手机相册选择" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "移除当前照片" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "取消" }).at(-1)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /记录给：/ }));

    expect(screen.getByText("新建人员")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存到小美好" })).toBeInTheDocument();
  });

  it("shows a sending state while uploading or saving", () => {
    const { container } = render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-22"
        saving={false}
        uploading
        message=""
        selectedImageName="sunset.jpg"
        imagePreviewUrl="https://example.com/sunset.jpg"
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "发送中..." })).toBeDisabled();
    expect(container.querySelector('[data-ui="quick-entry-media-trigger"]')).toBeDisabled();
  });

  it("does not render the bottom status row when there is no message", () => {
    const { container } = render(
      <QuickEntry
        people={[]}
        selectedPersonId=""
        content=""
        reason=""
        displayDate="2026-03-22"
        saving={false}
        uploading={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: /记录给：/ })).toBeInTheDocument();
    expect(container.querySelector('[data-ui="quick-entry-message"]')).not.toBeInTheDocument();
  });

  it("lets the bottom navigation switch to the profile tab", () => {
    const onTabChange = vi.fn();

    render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-22"
        saving={false}
        uploading={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={onTabChange}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "个人中心" }));

    expect(onTabChange).toHaveBeenCalledWith("profile");
  });

  it("does not render a composer cancel button in the footer actions", () => {
    const { container } = render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-22"
        saving={false}
        uploading={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    const footer = container.querySelector("form > .joy-blur-panel");

    expect(footer?.querySelector('button[type="submit"]')).toBeInTheDocument();
    expect(footer?.textContent).not.toContain("取消");
  });

  it("closes the action sheet when cancel is tapped", () => {
    const { container } = render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-22"
        saving={false}
        uploading={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    fireEvent.click(container.querySelector('[data-ui="quick-entry-media-trigger"]') as Element);
    expect(screen.getByText("选择一种方式")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "取消" }).at(-1) as Element);

    expect(screen.queryByText("选择一种方式")).not.toBeInTheDocument();
  });

  it("shows remove image only when there is an image to clear", () => {
    const onRemoveImage = vi.fn();
    const { container } = render(
      <QuickEntry
        people={[{ id: "person-1", name: "自己", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-22"
        saving={false}
        uploading={false}
        message=""
        selectedImageName="memory.jpg"
        imagePreviewUrl="https://example.com/memory.jpg"
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={onRemoveImage}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    fireEvent.click(container.querySelector('[data-ui="quick-entry-media-trigger"]') as Element);
    fireEvent.click(screen.getByRole("button", { name: "移除当前照片" }));

    expect(onRemoveImage).toHaveBeenCalledTimes(1);
  });

  it("centers the calendar panel on the date trigger", () => {
    render(
      <QuickEntry
        people={[{ id: "person-1", name: "Self", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-23"
        saving={false}
        uploading={false}
        message=""
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /2026\/03\/23/ }));

    expect(screen.getByTestId("app-date-picker-panel")).toHaveClass(
      "left-1/2",
      "-translate-x-1/2",
    );
  });

  it("shows message as a centered toast and auto-hides it after three seconds", () => {
    vi.useFakeTimers();

    render(
      <QuickEntry
        people={[{ id: "person-1", name: "Self", is_default: true }]}
        selectedPersonId="person-1"
        content=""
        reason=""
        displayDate="2026-03-23"
        saving={false}
        uploading={false}
        message="这件小美好已被珍藏 ✨"
        selectedImageName=""
        imagePreviewUrl={null}
        activeTab="quick-entry"
        onPersonChange={() => {}}
        onTabChange={() => {}}
        onCreatePerson={async () => true}
        onDeletePerson={async () => ({ ok: true })}
        onContentChange={() => {}}
        onReasonChange={() => {}}
        onDateChange={() => {}}
        onImageChange={() => {}}
        onRemoveImage={() => {}}
        onSave={(event) => event.preventDefault()}
        onCancel={() => {}}
      />,
    );

    expect(screen.getByTestId("app-toast")).toHaveTextContent("这件小美好已被珍藏 ✨");

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.queryByTestId("app-toast")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
