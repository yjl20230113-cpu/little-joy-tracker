import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { CloudyLetterCard } from "./CloudyLetterCard";

describe("CloudyLetterCard", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
  });

  it("renders the renamed healing sections and formats long content into structured blocks", () => {
    render(
      <CloudyLetterCard
        letter={{
          themeTitle: "此路，亦是风景",
          hug:
            "我完全理解你此刻的失落与摇摆。当身边人的道路被社会清晰地标上“成功”的刻度，而自己的前方却是一片需要自己摸索的迷雾时，那种“被落下”的恍惚感和对未来的不确定感，确实会像潮水一样涌来。你并非脆弱，而是在他人的确定性面前，更深地触碰到了自己选择的重量。",
          analysis:
            "你描述了一种深刻的认知模式：将“结果不够好”等同于“当初的选择是错的”。然而，人生的道路并不是一条预设终点的单行线。真正的“退路”，或许并非地理上的撤回，而是内心的一种能力。你不是失败的人，你只是在经历一个尚未走完的切片。",
          light:
            "现在，让我们暂时把这份烦恼放下。选定今天的日期。去寻找一件哪怕只有针尖大小的好事。写下几句简单的文字，或者拍下一张照片上传。",
        }}
        onFooterAction={() => {}}
      />,
    );

    expect(screen.getByText("情绪镜像")).toBeInTheDocument();
    expect(screen.getByText("温和重构")).toBeInTheDocument();
    expect(screen.getByText("好事记录")).toBeInTheDocument();
    expect(screen.getByText("此路，亦是风景")).toBeInTheDocument();
    expect(screen.getByText("选定今天的日期")).toContainHTML("strong");
    expect(screen.getAllByRole("list").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "回到小美好" })).toBeInTheDocument();
  });

  it("automatically bolds key phrases in the empathy and reframe sections", () => {
    const { container } = render(
      <CloudyLetterCard
        letter={{
          themeTitle: "允许一切发生",
          hug:
            "我能理解你这种“被落下”的恍惚，也能理解那种对未来失去掌控感的慌张。你不是脆弱，你只是被比较这阵风吹得太久了。",
          analysis:
            "你把“结果不够好”直接等同于“当初的选择是错的”，这会让每一步都像在审判自己。可你不是失败的人，你只是在经历一个尚未展开完的阶段。",
          light: "把今天的一件好事写下来。",
        }}
        onFooterAction={() => {}}
      />,
    );

    const strongTexts = Array.from(container.querySelectorAll("strong")).map((node) =>
      node.textContent?.trim(),
    );

    expect(strongTexts).toEqual(
      expect.arrayContaining([
        "被落下",
        "失去掌控感",
        "结果不够好",
        "当初的选择是错的",
        "不是失败的人",
      ]),
    );
  });

  it("turns list-like prose into a structured list instead of loose paragraphs", () => {
    render(
      <CloudyLetterCard
        letter={{
          themeTitle: "慢一点也没关系",
          hug: "你现在很累，这种累不是矫情。",
          analysis:
            "可以先把注意力放回三个落点：1. 先看见情绪，不急着反驳自己。2. 再把“我完了”改写成“我现在很难”。3. 最后只做一个五分钟内能完成的小动作。",
          light: "记录今天的一件好事。",
        }}
        onFooterAction={() => {}}
      />,
    );

    const analysisSection = screen
      .getByText("温和重构")
      .closest("section");

    expect(analysisSection).not.toBeNull();

    const list = within(analysisSection as HTMLElement).getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("先看见情绪");
    expect(items[1]).toHaveTextContent("我现在很难");
    expect(items[2]).toHaveTextContent("五分钟内能完成的小动作");
  });

  it("highlights poetic anchor phrases that match the healing-letter tone", () => {
    const { container } = render(
      <CloudyLetterCard
        letter={{
          themeTitle: "缝隙里的光",
          hug:
            "当自己的前方像一片需要自己摸索的迷雾时，那种不确定感确实会像潮水一样涌来。你并不脆弱，你只是被比较这阵风吹得太久了。",
          analysis:
            "人生并不是一条预设了终点的单行线，而是一片需要你亲自探索的旷野。你现在经历的，更像是一个尚未走完的切片，而不是被盖章的人生结论。",
          light:
            "现在，试着选定今天的日期。去找一件针尖大小的好事，也许是窗外一缕恰好落在书桌上的阳光，把这份微小的当下写下来。",
        }}
        onFooterAction={() => {}}
      />,
    );

    const strongTexts = Array.from(container.querySelectorAll("strong")).map((node) =>
      node.textContent?.trim(),
    );

    expect(strongTexts).toEqual(
      expect.arrayContaining([
        "需要自己摸索的迷雾",
        "像潮水一样涌来",
        "被比较这阵风吹得太久",
        "预设了终点的单行线",
        "需要你亲自探索的旷野",
        "尚未走完的切片",
        "选定今天的日期",
        "针尖大小的好事",
        "微小的当下",
      ]),
    );
  });

  it("supports subtle and editorial emphasis styles", () => {
    const letter = {
      themeTitle: "允许一切发生",
      hug:
        "当自己的前方像一片需要自己摸索的迷雾时，那种不确定感确实会像潮水一样涌来。你并不脆弱，你只是被比较这阵风吹得太久了。",
      analysis:
        "人生并不是一条预设了终点的单行线，而是一片需要你亲自探索的旷野。你不是失败的人，你只是在经历一个尚未走完的切片。",
      light:
        "现在，试着选定今天的日期。去找一件针尖大小的好事，把这份微小的当下写下来。",
    };

    const subtle = render(
      <CloudyLetterCard
        letter={letter}
        emphasisStyle="subtle"
        onFooterAction={() => {}}
      />,
    );

    const subtleStrongTexts = Array.from(
      subtle.container.querySelectorAll("strong"),
    ).map((node) => node.textContent?.trim());

    expect(subtleStrongTexts).toEqual(
      expect.arrayContaining(["不确定感", "不是失败的人", "选定今天的日期"]),
    );
    expect(subtleStrongTexts).not.toEqual(
      expect.arrayContaining(["需要自己摸索的迷雾", "像潮水一样涌来", "需要你亲自探索的旷野"]),
    );

    subtle.unmount();

    const editorial = render(
      <CloudyLetterCard
        letter={letter}
        emphasisStyle="editorial"
        onFooterAction={() => {}}
      />,
    );

    const editorialStrongTexts = Array.from(
      editorial.container.querySelectorAll("strong"),
    ).map((node) => node.textContent?.trim());

    expect(editorialStrongTexts).toEqual(
      expect.arrayContaining([
        "需要自己摸索的迷雾",
        "像潮水一样涌来",
        "需要你亲自探索的旷野",
        "针尖大小的好事",
      ]),
    );
  });

  it("automatically switches between subtle and editorial emphasis based on content", () => {
    const poetic = render(
      <CloudyLetterCard
        letter={{
          themeTitle: "缝隙里的光",
          hug:
            "当自己的前方像一片需要自己摸索的迷雾时，那种不确定感确实会像潮水一样涌来。你并不脆弱，你只是被比较这阵风吹得太久了。",
          analysis:
            "人生并不是一条预设了终点的单行线，而是一片需要你亲自探索的旷野。你不是失败的人，你只是在经历一个尚未走完的切片。",
          light:
            "现在，试着选定今天的日期。去找一件针尖大小的好事，把这份微小的当下写下来。",
        }}
        emphasisStyle="auto"
        onFooterAction={() => {}}
      />,
    );

    const poeticStrongTexts = Array.from(
      poetic.container.querySelectorAll("strong"),
    ).map((node) => node.textContent?.trim());

    expect(poeticStrongTexts).toEqual(
      expect.arrayContaining(["需要自己摸索的迷雾", "像潮水一样涌来", "需要你亲自探索的旷野"]),
    );

    poetic.unmount();

    const direct = render(
      <CloudyLetterCard
        letter={{
          themeTitle: "先停一停",
          hug:
            "我知道你现在很慌，也很怕自己是不是又做错了。这样的不确定感很折磨人，但你不是失败的人。",
          analysis:
            "你把一次结果不够好，直接推成了整个人不行。先别急着给自己下结论，眼前更重要的是把注意力放回当下。",
          light:
            "先选定今天的日期，再写下两三句你此刻能确认的好事就够了。",
        }}
        emphasisStyle="auto"
        onFooterAction={() => {}}
      />,
    );

    const directStrongTexts = Array.from(
      direct.container.querySelectorAll("strong"),
    ).map((node) => node.textContent?.trim());

    expect(directStrongTexts).toEqual(
      expect.arrayContaining(["不确定感", "不是失败的人", "选定今天的日期"]),
    );
    expect(directStrongTexts).not.toEqual(
      expect.arrayContaining(["需要自己摸索的迷雾", "像潮水一样涌来", "需要你亲自探索的旷野"]),
    );
  });

  it("logs the auto emphasis decision in development only", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    process.env.NODE_ENV = "development";

    render(
      <CloudyLetterCard
        letter={{
          themeTitle: "缝隙里的光",
          hug:
            "当自己的前方像一片需要自己摸索的迷雾时，那种不确定感确实会像潮水一样涌来。",
          analysis:
            "人生并不是一条预设了终点的单行线，而是一片需要你亲自探索的旷野。",
          light: "现在，试着选定今天的日期，去找一件针尖大小的好事。",
        }}
        emphasisStyle="auto"
        onFooterAction={() => {}}
      />,
    );

    expect(infoSpy).toHaveBeenCalledWith(
      "[CloudyLetterCard] auto emphasis resolved",
      expect.objectContaining({
        requestedStyle: "auto",
        resolvedStyle: "editorial",
        reasons: expect.arrayContaining([
          expect.stringContaining("editorial-exclusive"),
        ]),
      }),
    );

    infoSpy.mockClear();
    process.env.NODE_ENV = "production";

    render(
      <CloudyLetterCard
        letter={{
          themeTitle: "先停一停",
          hug: "我知道你现在很慌。",
          analysis: "先别急着给自己下结论。",
          light: "先选定今天的日期。",
        }}
        emphasisStyle="auto"
        onFooterAction={() => {}}
      />,
    );

    expect(infoSpy).not.toHaveBeenCalled();
  });

  it("supports an archive footer action label", () => {
    const onFooterAction = vi.fn();

    render(
      <CloudyLetterCard
        letter={{
          themeTitle: "先停一停",
          hug: "我在。",
          analysis: "慢一点没有关系。",
          light: "看一分钟窗边的光。",
        }}
        footerActionLabel="回到档案袋"
        onFooterAction={onFooterAction}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "回到档案袋" }));

    expect(onFooterAction).toHaveBeenCalledTimes(1);
  });

  it("uses the calmer editorial cloudy surface instead of the old saturated purple footer action", () => {
    const { container } = render(
      <CloudyLetterCard
        letter={{
          themeTitle: "先停一停",
          hug: "我在。",
          analysis: "慢一点没有关系。",
          light: "看一分钟窗边的光。",
        }}
        onFooterAction={() => {}}
      />,
    );

    expect(container.firstElementChild).toHaveClass(
      "bg-[linear-gradient(180deg,rgba(247,243,246,0.96),rgba(241,236,243,0.98))]",
    );
    expect(screen.getByRole("button")).not.toHaveClass(
      "bg-[linear-gradient(90deg,#8f7ac0,#b49ad8)]",
    );
  });
});
