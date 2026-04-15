import { act, fireEvent, render, screen } from "@testing-library/react";
import { InsightView } from "./InsightView";

describe("InsightView", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  const baseProps = {
    activeTab: "insight" as const,
    peopleFilters: [
      { id: "all", label: "全部" },
      { id: "person-self", label: "自己" },
    ],
    selectedPersonId: "all",
    selectedRange: "week" as const,
    customStartDate: "",
    customEndDate: "",
    message: "",
    generateDisabled: false,
    loading: false,
    report: null,
    onPersonChange: () => {},
    onRangeChange: () => {},
    onCustomStartDateChange: () => {},
    onCustomEndDateChange: () => {},
    onGenerate: () => {},
    onShare: () => {},
    onTabChange: () => {},
  };

  it("shows an empty state and disables generation when there is no data", () => {
    const { container } = render(
      <InsightView
        {...baseProps}
        generateDisabled
        emptyHint="先去记录一些小美好再来吧"
      />,
    );

    expect(
      container.querySelector('[data-ui="insight-editorial-intro"]'),
    ).toHaveClass("bg-[rgba(251,245,240,0.92)]");
    expect(document.querySelector("button[disabled]")).toBeDisabled();
  });

  it("restores the preset range buttons between the people row and date pickers", () => {
    const onRangeChange = vi.fn();
    const { container } = render(
      <InsightView
        {...baseProps}
        emptyHint=""
        onRangeChange={onRangeChange}
      />,
    );

    const filters = container.querySelector('[data-ui="timeline-filters"]');
    const peopleRow = container.querySelector('[data-ui="timeline-filters-people-row"]');
    const presetsRow = container.querySelector('[data-ui="timeline-filters-presets-row"]');
    const datesRow = container.querySelector('[data-ui="timeline-filters-range-row"]');

    expect(presetsRow).toHaveClass("grid-cols-3");
    expect(presetsRow).toHaveClass("gap-2");
    expect(screen.getByRole("button", { name: "一周" })).toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("button", { name: "一个月" })).toHaveClass("whitespace-nowrap");
    expect(screen.getByRole("button", { name: "三个月" })).toHaveClass("whitespace-nowrap");
    expect(filters?.children[0]).toBe(peopleRow);
    expect(filters?.children[1]).toBe(presetsRow);
    expect(filters?.children[2]).toBe(datesRow);

    fireEvent.click(screen.getByRole("button", { name: "三个月" }));

    expect(onRangeChange).toHaveBeenCalledWith("threeMonths");
  });

  it("renders the report score from mood_weather.score instead of parsing the description", async () => {
    vi.useFakeTimers();
    const onShare = vi.fn();

    render(
      <InsightView
        {...baseProps}
        emptyHint=""
        onShare={onShare}
        report={{
          mood_weather: {
            title: "灿烂",
            icon: "Sun",
            score: 85,
            description: "本阶段你处于被暖光轻轻托住的状态。你的成长表现为韧性。",
          },
          keywords: ["晚风", "散步", "晚霞", "热可可", "拥抱"],
          personality: {
            title: "细节捕捉大师",
            description: "你总能看见生活里那些被忽略的微光。",
          },
          suggestions: [
            {
              title: "傍晚散步",
              content: "当晚风出现时，你的心也跟着慢慢松下来。",
              icon: "TreePine",
            },
            {
              title: "热可可时间",
              content: "给自己留一个小小的热饮仪式，让温柔有回响。",
              icon: "Coffee",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("灿烂")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(screen.getByText("85%")).toBeInTheDocument();
    expect(screen.getByText("细节捕捉大师")).toBeInTheDocument();
    expect(screen.getByText("晚风")).toBeInTheDocument();
    expect(screen.getByText("傍晚散步")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存/分享报告" }));

    expect(onShare).toHaveBeenCalled();
  });

  it("keeps the top bar and bottom nav visible while showing an in-content loading mask", () => {
    render(<InsightView {...baseProps} emptyHint="" loading />);

    const overlay = screen.getByTestId("insight-loading-overlay");
    const topBar = document.querySelector('[data-ui="app-topbar"]');
    const bottomNav = document.querySelector('[data-ui="app-bottom-nav"]');

    expect(screen.getByText("AI 正在翻看你们的回忆...")).toBeInTheDocument();
    expect(screen.getByText("Little Joy Tracker")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "治愈社区" })).toBeInTheDocument();
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass("bg-[rgba(247,240,235,0.8)]");
    expect(topBar && overlay.contains(topBar)).toBe(false);
    expect(bottomNav && overlay.contains(bottomNav)).toBe(false);
  });
});
