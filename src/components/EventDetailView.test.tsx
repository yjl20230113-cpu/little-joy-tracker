import { fireEvent, render, screen } from "@testing-library/react";
import { EventDetailView } from "./EventDetailView";

describe("EventDetailView", () => {
  it("shows a fixed top bar with back, edit, delete, and bottom navigation", () => {
    const onBack = vi.fn();
    const onEditToggle = vi.fn();
    const onDelete = vi.fn();
    const onTabChange = vi.fn();

    render(
      <EventDetailView
        title="小美好详情"
        backLabel="返回时间线"
        activeTab="timeline"
        editing={false}
        saving={false}
        deleting={false}
        message=""
        createdAtText="记录于 2026-03-22 21:10:45"
        personName="自己"
        displayDate="2026-03-22"
        content="一起散步回家"
        reason="晚风很温柔"
        onBack={onBack}
        onEditToggle={onEditToggle}
        onDelete={onDelete}
        onTabChange={onTabChange}
      />,
    );

    expect(screen.getByRole("button", { name: "返回时间线" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "编辑" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "删除" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "每日悦点" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "心绪日志" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "治愈社区" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "个人中心" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回时间线" }));
    fireEvent.click(screen.getByRole("button", { name: "编辑" }));
    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    fireEvent.click(screen.getByRole("button", { name: "每日悦点" }));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onEditToggle).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith("quick-entry");
  });
});
