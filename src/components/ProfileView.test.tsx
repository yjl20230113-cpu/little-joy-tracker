import { fireEvent, render, screen } from "@testing-library/react";
import { ProfileView } from "./ProfileView";

describe("ProfileView", () => {
  it("shows the email card and logout action in a dedicated page", () => {
    const onLogout = vi.fn();
    const onTabChange = vi.fn();

    render(
      <ProfileView
        email="joy@example.com"
        activeTab="profile"
        message="今天也要好好照顾自己"
        onLogout={onLogout}
        onTabChange={onTabChange}
      />,
    );

    expect(screen.getByText("joy@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "退出登录" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "个人中心" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "退出登录" }));
    fireEvent.click(screen.getByRole("button", { name: "每日悦点" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith("quick-entry");
  });
});
