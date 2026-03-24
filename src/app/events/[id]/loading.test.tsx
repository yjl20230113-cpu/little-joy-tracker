import { render, screen } from "@testing-library/react";
import Loading from "./loading";

describe("Event detail route loading", () => {
  it("shows a clear loading message during route transition", () => {
    render(<Loading />);

    expect(screen.getByText("正在加载中")).toBeInTheDocument();
  });
});
