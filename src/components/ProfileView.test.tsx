import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProfileView } from "./ProfileView";

describe("ProfileView", () => {
  it("defaults to a read-only profile card and only exposes editing through the top bar button", () => {
    const onEditProfile = vi.fn();
    const { container } = render(
      <ProfileView
        email="joy@example.com"
        displayName="Joy"
        avatarUrl="https://example.com/avatar.jpg"
        selectedImageName="avatar.jpg"
        activeTab="profile"
        message=""
        editing={false}
        saving={false}
        uploading={false}
        onRefreshApp={() => {}}
        onLogout={() => {}}
        onTabChange={() => {}}
        onEditProfile={onEditProfile}
        onDisplayNameChange={() => {}}
        onAvatarSelect={() => {}}
        onAvatarRemove={() => {}}
        onSaveProfile={() => {}}
      />,
    );

    expect(screen.getByTestId("profile-display-name")).toHaveTextContent("Joy");
    expect(screen.getByText("joy@example.com")).toBeInTheDocument();
    expect(screen.queryByTestId("profile-name-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("profile-avatar-camera-badge")).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-ui="profile-editorial-intro"]'),
    ).toHaveClass("bg-[rgba(251,245,240,0.92)]");
    expect(
      container.querySelector('[data-ui="profile-identity-card"]'),
    ).toHaveClass("bg-[rgba(255,250,246,0.96)]");
    expect(
      container.querySelector('[data-ui="app-topbar-trailing"] button'),
    ).toHaveTextContent("编辑");
    expect(screen.queryByTestId("profile-primary-action-slot")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "编辑" }));

    expect(onEditProfile).toHaveBeenCalledTimes(1);
  });

  it("shows the camera badge only while editing is enabled", () => {
    const onRefreshApp = vi.fn();
    const onLogout = vi.fn();
    const onTabChange = vi.fn();
    const onDisplayNameChange = vi.fn();
    const onAvatarSelect = vi.fn();
    const onAvatarRemove = vi.fn();
    const onSaveProfile = vi.fn();

    render(
      <ProfileView
        email="joy@example.com"
        displayName="Joy"
        avatarUrl="https://example.com/avatar.jpg"
        selectedImageName="avatar.jpg"
        activeTab="profile"
        message=""
        editing={true}
        saving={false}
        uploading={false}
        onRefreshApp={onRefreshApp}
        onLogout={onLogout}
        onTabChange={onTabChange}
        onEditProfile={vi.fn()}
        onDisplayNameChange={onDisplayNameChange}
        onAvatarSelect={onAvatarSelect}
        onAvatarRemove={onAvatarRemove}
        onSaveProfile={onSaveProfile}
      />,
    );

    expect(screen.getByDisplayValue("Joy")).toBeInTheDocument();
    expect(screen.getByTestId("profile-name-input")).toBeInTheDocument();
    expect(screen.getByText("avatar.jpg")).toBeInTheDocument();
    expect(screen.getByTestId("profile-avatar-camera-badge")).toBeInTheDocument();
    expect(screen.getByLabelText("更换头像")).toBeEnabled();
    expect(screen.getByRole("button", { name: "保存" })).toBeInTheDocument();

    fireEvent.change(screen.getByTestId("profile-name-input"), {
      target: { value: "Joy Chen" },
    });
    fireEvent.change(screen.getByLabelText("上传头像"), {
      target: {
        files: [new File(["avatar"], "next-avatar.jpg", { type: "image/jpeg" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByTestId("profile-refresh-action"));
    fireEvent.click(screen.getByTestId("profile-logout-action"));
    fireEvent.click(
      document.querySelector('[data-ui="app-bottom-nav"] button') as HTMLButtonElement,
    );

    expect(onDisplayNameChange).toHaveBeenCalledWith("Joy Chen");
    expect(onAvatarSelect).toHaveBeenCalled();
    expect(onAvatarRemove).toHaveBeenCalledTimes(0);
    expect(onSaveProfile).toHaveBeenCalledTimes(1);
    expect(onRefreshApp).toHaveBeenCalledTimes(1);
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(onTabChange).toHaveBeenCalledWith("quick-entry");
  });

  it("keeps the email field full width and renders logout as a standalone full-width action", () => {
    render(
      <ProfileView
        email="joy@example.com"
        displayName="Joy"
        avatarUrl={null}
        selectedImageName=""
        activeTab="profile"
        message=""
        editing={false}
        saving={false}
        uploading={false}
        onRefreshApp={() => {}}
        onLogout={() => {}}
        onTabChange={() => {}}
        onEditProfile={() => {}}
        onDisplayNameChange={() => {}}
        onAvatarSelect={() => {}}
        onAvatarRemove={() => {}}
        onSaveProfile={() => {}}
      />,
    );

    expect(screen.getByTestId("profile-email-field")).toHaveClass("w-full");
    expect(screen.getByTestId("profile-email-chip")).toHaveClass("flex", "w-full");
    expect(screen.getByTestId("profile-refresh-action")).toHaveClass("w-full");
    expect(screen.getByTestId("profile-logout-slot")).toHaveClass("mt-8");
    expect(screen.getByTestId("profile-logout-action")).toHaveClass(
      "w-full",
      "justify-center",
      "bg-[rgba(75,53,45,0.08)]",
      "text-[var(--primary)]",
      "border-[rgba(75,53,45,0.1)]",
    );
  });

  it("disables saving when the display name is blank or the profile is busy", () => {
    const onSaveProfile = vi.fn();

    const { rerender } = render(
      <ProfileView
        email="joy@example.com"
        displayName="   "
        avatarUrl={null}
        selectedImageName=""
        activeTab="profile"
        message=""
        editing={true}
        saving={false}
        uploading={false}
        onRefreshApp={() => {}}
        onLogout={() => {}}
        onTabChange={() => {}}
        onEditProfile={() => {}}
        onDisplayNameChange={() => {}}
        onAvatarSelect={() => {}}
        onAvatarRemove={() => {}}
        onSaveProfile={onSaveProfile}
      />,
    );

    expect(screen.getByRole("button", { name: "保存" })).toBeDisabled();

    rerender(
      <ProfileView
        email="joy@example.com"
        displayName="Joy"
        avatarUrl={null}
        selectedImageName=""
        activeTab="profile"
        message=""
        editing={true}
        saving={true}
        uploading={false}
        onRefreshApp={() => {}}
        onLogout={() => {}}
        onTabChange={() => {}}
        onEditProfile={() => {}}
        onDisplayNameChange={() => {}}
        onAvatarSelect={() => {}}
        onAvatarRemove={() => {}}
        onSaveProfile={onSaveProfile}
      />,
    );

    expect(screen.getByRole("button", { name: "保存中..." })).toBeDisabled();
  });
});
