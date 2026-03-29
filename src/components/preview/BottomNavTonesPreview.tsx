"use client";

import { BookOpen, CalendarDays, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";

import { AppBottomNav } from "../AppBottomNav";
import type { HomeTab } from "../QuickEntry";

type PreviewVariant = {
  id: string;
  title: string;
  subtitle: string;
  frameBg: string;
  shellBg: string;
  topBarBg: string;
  topBarBorder: string;
  contentBg: string;
  sectionBg: string;
  sectionBorder: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  navSurfaceClassName: string;
  navActiveItemClassName: string;
};

const previewVariants: PreviewVariant[] = [
  {
    id: "a",
    title: "A · Cream Dawn",
    subtitle: "奶油晨光版，顶部栏、页面底和菜单栏最统一，整体最轻。",
    frameBg:
      "bg-[linear-gradient(180deg,rgba(255,249,226,1)_0%,rgba(255,245,214,1)_100%)]",
    shellBg:
      "bg-[linear-gradient(180deg,rgba(255,250,236,0.98)_0%,rgba(251,246,227,0.98)_100%)]",
    topBarBg: "bg-[rgba(255,249,205,0.86)]",
    topBarBorder: "border-[rgba(205,162,101,0.12)]",
    contentBg:
      "bg-[linear-gradient(180deg,rgba(250,245,225,0.98)_0%,rgba(247,241,214,0.98)_100%)]",
    sectionBg: "bg-[rgba(255,253,244,0.92)]",
    sectionBorder: "border-[rgba(214,192,146,0.42)]",
    accentBg: "bg-[rgba(255,240,198,0.92)]",
    accentText: "text-[#a85d16]",
    accentBorder: "border-[rgba(205,162,101,0.18)]",
    navSurfaceClassName:
      "bg-[rgba(255,252,238,0.97)] border-[rgba(205,162,101,0.10)] shadow-[0_-10px_22px_-30px_rgba(155,69,0,0.12)]",
    navActiveItemClassName: "bg-[rgba(255,225,210,0.74)]",
  },
  {
    id: "b",
    title: "B · Paper Bloom",
    subtitle: "柔雾纸页版，像同一本手帐里的同色纸页，反差最弱。",
    frameBg:
      "bg-[linear-gradient(180deg,rgba(251,245,232,1)_0%,rgba(247,238,221,1)_100%)]",
    shellBg:
      "bg-[linear-gradient(180deg,rgba(252,247,236,0.98)_0%,rgba(246,239,225,0.98)_100%)]",
    topBarBg: "bg-[rgba(253,244,222,0.9)]",
    topBarBorder: "border-[rgba(188,154,111,0.10)]",
    contentBg:
      "bg-[linear-gradient(180deg,rgba(248,241,229,0.98)_0%,rgba(243,235,220,0.98)_100%)]",
    sectionBg: "bg-[rgba(255,252,246,0.92)]",
    sectionBorder: "border-[rgba(196,172,130,0.32)]",
    accentBg: "bg-[rgba(248,232,208,0.92)]",
    accentText: "text-[#9f5a20]",
    accentBorder: "border-[rgba(196,172,130,0.16)]",
    navSurfaceClassName:
      "bg-[rgba(255,253,243,0.98)] border-[rgba(205,162,101,0.08)] shadow-[0_-10px_20px_-30px_rgba(155,69,0,0.10)]",
    navActiveItemClassName: "bg-[rgba(255,228,214,0.68)]",
  },
  {
    id: "c",
    title: "C · Apricot Haze",
    subtitle: "杏桃暖雾版，保留一点情绪感，但比现在明显更协调。",
    frameBg:
      "bg-[linear-gradient(180deg,rgba(255,245,223,1)_0%,rgba(252,237,215,1)_100%)]",
    shellBg:
      "bg-[linear-gradient(180deg,rgba(255,247,231,0.98)_0%,rgba(248,238,220,0.98)_100%)]",
    topBarBg: "bg-[rgba(255,244,199,0.84)]",
    topBarBorder: "border-[rgba(205,162,101,0.11)]",
    contentBg:
      "bg-[linear-gradient(180deg,rgba(249,239,228,0.98)_0%,rgba(245,233,218,0.98)_100%)]",
    sectionBg: "bg-[rgba(255,251,244,0.91)]",
    sectionBorder: "border-[rgba(214,183,150,0.34)]",
    accentBg: "bg-[rgba(255,233,208,0.92)]",
    accentText: "text-[#aa5d24]",
    accentBorder: "border-[rgba(214,183,150,0.18)]",
    navSurfaceClassName:
      "bg-[rgba(255,251,235,0.96)] border-[rgba(205,162,101,0.12)] shadow-[0_-11px_22px_-29px_rgba(155,69,0,0.13)]",
    navActiveItemClassName: "bg-[rgba(255,223,206,0.78)]",
  },
];

export function BottomNavTonesPreview() {
  const [activeTab, setActiveTab] = useState<HomeTab>("timeline");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8df_0%,#fefccf_100%)] px-5 py-8 text-[#5b452f]">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.24em] text-[#a86520]">
            Full Palette Study
          </p>
          <h1 className="text-[1.9rem] font-black tracking-[-0.05em] text-[#8f4703]">
            整体页面配色预览
          </h1>
          <p className="max-w-3xl text-[0.95rem] leading-7 text-[#7a6451]">
            三套方案会联动展示顶部栏、中间页面背景和底部菜单栏。你可以直接比较整体协调感，而不是只看菜单栏。
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {previewVariants.map((variant) => (
            <section
              key={variant.id}
              data-testid="bottom-nav-preview-card"
              className="overflow-hidden rounded-[2rem] border border-[rgba(205,162,101,0.18)] bg-[rgba(255,255,255,0.72)] shadow-[0_28px_60px_-40px_rgba(155,69,0,0.22)] backdrop-blur-[10px]"
            >
              <div className="border-b border-[rgba(205,162,101,0.14)] px-5 py-4">
                <h2 className="text-[1rem] font-black tracking-[-0.04em] text-[#8f4703]">
                  {variant.title}
                </h2>
                <p className="mt-1 text-[0.82rem] leading-6 text-[#7a6451]">
                  {variant.subtitle}
                </p>
              </div>

              <div className={`${variant.frameBg} px-4 pb-4 pt-8`}>
                <div
                  className={`mx-auto max-w-[23rem] overflow-hidden rounded-[2.2rem] border border-[rgba(255,255,255,0.72)] ${variant.shellBg} shadow-[0_36px_90px_-52px_rgba(29,29,3,0.42)]`}
                >
                  <header
                    className={`flex min-h-[4rem] items-center justify-between border-b px-4 py-2 ${variant.topBarBg} ${variant.topBarBorder}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex size-[2rem] items-center justify-center rounded-full bg-[rgba(255,219,201,0.88)] text-[#9b4500]">
                        <BookOpen className="size-4" />
                      </div>
                      <span className="text-[1rem] font-black tracking-[-0.04em] text-[#9b4500]">
                        Little Joy Tracker
                      </span>
                    </div>
                    <WandSparkles className="size-4.5 text-[#9b4500]" />
                  </header>

                  <div className={`${variant.contentBg} px-4 pb-4 pt-5`}>
                    <section
                      className={`rounded-[1.4rem] border px-4 py-4 ${variant.sectionBg} ${variant.sectionBorder}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 py-2 text-[0.85rem] font-semibold ${variant.accentBg} ${variant.accentText} ${variant.accentBorder}`}
                        >
                          <CalendarDays className="size-4" />
                          今天-03-29
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="space-y-1">
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
                            Little Joy AI
                          </p>
                          <p className="text-[0.95rem] leading-6 text-[#65574a]">
                            把顶部栏、页面底和菜单栏放回同一组情绪里，整体就会顺很多。
                          </p>
                        </div>

                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[1rem] bg-[rgba(246,198,217,0.9)] px-4 py-3 text-[0.92rem] font-semibold text-[#714252]"
                        >
                          <Sparkles className="size-4" />
                          AI 总结报告
                        </button>

                        <button
                          type="button"
                          className="inline-flex w-full items-center justify-center rounded-[1rem] border border-[rgba(143,122,192,0.2)] bg-[rgba(240,234,255,0.9)] px-4 py-3 text-[0.92rem] font-semibold text-[#7d6a9f]"
                        >
                          解忧档案袋
                        </button>
                      </div>
                    </section>

                    <div className="mt-4 space-y-3 pb-4">
                      {[1, 2].map((item) => (
                        <article
                          key={item}
                          className={`rounded-[1.35rem] border px-4 py-4 ${variant.sectionBg} ${variant.sectionBorder}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <p className="text-[0.75rem] font-bold uppercase tracking-[0.18em] text-[#8f81aa]">
                                2026-03-29
                              </p>
                              <h3 className="text-[1rem] font-black tracking-[-0.04em] text-[#3d3229]">
                                情绪释放之道
                              </h3>
                            </div>
                            <span
                              className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-[0.74rem] font-semibold ${variant.accentBg} ${variant.accentText} ${variant.accentBorder}`}
                            >
                              查看回信
                            </span>
                          </div>
                          <p className="mt-3 text-[0.88rem] leading-7 text-[#6b5d4f]">
                            这块只是为了让你看三者一起出现时，顶部栏、中间底色和菜单栏之间是不是还在打架。
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <AppBottomNav
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    surfaceClassName={variant.navSurfaceClassName}
                    activeItemClassName={variant.navActiveItemClassName}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
