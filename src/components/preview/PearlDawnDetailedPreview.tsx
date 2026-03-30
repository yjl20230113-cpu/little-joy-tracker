import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";

import styles from "./PearlDawnDetailedPreview.module.css";
import {
  iphone17ProCanvasSpec,
  pearlDawnDetailedPreviewSpec,
  type DetailedScreenSpec,
  type PaletteSystem,
  type PearlDawnDetailedDirectionSpec,
} from "./palette-system-data";

type PaletteStyle = CSSProperties & Record<`--${string}`, string | number>;

function getPaletteVars(palette: PaletteSystem): PaletteStyle {
  return {
    "--app-bg": palette.appBg,
    "--topbar-bg": palette.topBarBg,
    "--topbar-border": palette.topBarBorder,
    "--panel-bg": palette.panelBg,
    "--panel-alt-bg": palette.panelAltBg,
    "--card-bg": palette.cardBg,
    "--card-soft-bg": palette.cardSoftBg,
    "--anchor": palette.anchor,
    "--anchor-soft": palette.anchorSoft,
    "--anchor-contrast": palette.anchorContrast,
    "--joy-accent": palette.joyAccent,
    "--joy-accent-soft": palette.joyAccentSoft,
    "--joy-surface": palette.joySurface,
    "--joy-highlight": palette.joyHighlight,
    "--cloudy-accent": palette.cloudyAccent,
    "--cloudy-accent-soft": palette.cloudyAccentSoft,
    "--cloudy-surface": palette.cloudySurface,
    "--cloudy-highlight": palette.cloudyHighlight,
    "--nav-bg": palette.navBg,
    "--nav-active-bg": palette.navActiveBg,
    "--focus-ring": palette.focusRing,
    "--text-strong": palette.textStrong,
    "--text-muted": palette.textMuted,
    "--border-soft": palette.borderSoft,
    "--shadow-color": palette.shadowColor,
  };
}

export function PearlDawnDetailedPreview() {
  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div>
            <p className={styles.heroMeta}>Pearl Dawn · iPhone 17 Pro</p>
            <h1 className={styles.heroTitle}>Pearl Dawn · iPhone 17 Pro 详细静态预览</h1>
          </div>
          <Link href="/preview/palette-systems" className={styles.backLink}>
            返回总览
          </Link>
        </div>
        <p className={styles.heroSummary}>
          这页只展示前端静态预览，不改任何功能和数据关系。3 套完整方向都以深可可棕为
          主压色，在同一品牌骨架下拉开小美好与小烦恼的颜色气候、交互层级和页面密度。
        </p>
        <div className={styles.canvasSpecs}>
          <span>画布 {iphone17ProCanvasSpec.width} × {iphone17ProCanvasSpec.height} pt</span>
          <span>Safe Top {iphone17ProCanvasSpec.safeTop}</span>
          <span>Safe Side {iphone17ProCanvasSpec.safeSide}</span>
          <span>Safe Bottom {iphone17ProCanvasSpec.safeBottom}</span>
          <span>3 套完整方向 × 8 页 = 24 张预览</span>
        </div>
      </section>

      <section className={styles.directionGrid} aria-label="Pearl Dawn 三套完整方向">
        {pearlDawnDetailedPreviewSpec.map((direction) => (
          <article
            key={direction.id}
            data-testid="pearl-dawn-direction-card"
            className={styles.directionCard}
            style={getPaletteVars(direction.palette)}
          >
            <header className={styles.directionHeader}>
              <div className={styles.directionKicker}>{direction.name}</div>
              <div className={styles.directionTitleRow}>
                <div>
                  <h2 className={styles.directionTitle}>{direction.interactionName}</h2>
                  <p className={styles.directionSubtitle}>{direction.colorName}</p>
                </div>
                <span className={styles.emphasisBadge}>方案 B 基底</span>
              </div>
              <div className={styles.directionSummaryGrid}>
                <p>{direction.interactionSummary}</p>
                <p>{direction.colorSummary}</p>
                <p>{direction.emphasis}</p>
              </div>
              <div className={styles.guidelineGrid}>
                {direction.guidelines.map((rule) => (
                  <div key={rule.title} className={styles.guidelineCard}>
                    <p className={styles.guidelineTitle}>{rule.title}</p>
                    <p className={styles.guidelineBody}>{rule.body}</p>
                  </div>
                ))}
              </div>
            </header>

            <div className={styles.screenGrid}>
              {direction.screens.map((screen) => (
                <section
                  key={screen.id}
                  data-testid="pearl-dawn-screen-card"
                  className={styles.screenCard}
                >
                  <div className={styles.screenMeta}>
                    <div>
                      <p className={styles.screenTitle}>{screen.title}</p>
                      <p className={styles.screenSummary}>{screen.summary}</p>
                    </div>
                    <span className={styles.toneBadge} data-tone={screen.tone}>
                      {screen.tone === "joy"
                        ? "小美好"
                        : screen.tone === "cloudy"
                          ? "小烦恼"
                          : "共享骨架"}
                    </span>
                  </div>

                  <PhoneCanvas direction={direction} screen={screen} />

                  <div className={styles.annotationGrid}>
                    <AnnotationItem label="顶栏" value={screen.topBarAction} />
                    <AnnotationItem label="主操作" value={screen.primaryAction} />
                    <AnnotationItem label="次操作" value={screen.secondaryActions} />
                    <AnnotationItem label="链接关系" value={screen.linkFlow} />
                    <AnnotationItem label="交互形态" value={screen.interactionPattern} />
                    <AnnotationItem label="静态预览重点" value={screen.staticCue} />
                  </div>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function AnnotationItem({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.annotationItem}>
      <span className={styles.annotationLabel}>{label}</span>
      <span className={styles.annotationValue}>{value}</span>
    </div>
  );
}

function PhoneCanvas({
  direction,
  screen,
}: {
  direction: PearlDawnDetailedDirectionSpec;
  screen: DetailedScreenSpec;
}) {
  return (
    <div
      className={styles.phoneCanvas}
      data-testid="pearl-dawn-phone-canvas"
      data-phone-canvas={iphone17ProCanvasSpec.id}
      data-canvas-width={iphone17ProCanvasSpec.width}
      data-canvas-height={iphone17ProCanvasSpec.height}
      data-safe-top={iphone17ProCanvasSpec.safeTop}
      data-safe-side={iphone17ProCanvasSpec.safeSide}
      data-safe-bottom={iphone17ProCanvasSpec.safeBottom}
    >
      <div className={styles.phoneDevice}>
        <div className={styles.phoneViewport}>
          <div className={styles.dynamicIsland} aria-hidden="true" />
          <div
            className={styles.phoneScreen}
            data-variant={direction.id}
            data-tone={screen.tone}
          >
            {renderDetailedScreen(direction.id, screen)}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDetailedScreen(directionId: string, screen: DetailedScreenSpec) {
  switch (screen.id) {
    case "joy-entry":
      return (
        <ScreenShell
          directionId={directionId}
          tone="joy"
          title="Little Joy Tracker"
          actionLabel="进入小烦恼"
          navActive={0}
        >
          <div className={styles.heroCard}>
            <div>
              <p className={styles.kicker}>Good Morning</p>
              <h3 className={styles.heroCardTitle}>今天也为自己留下一页轻盈的记录</h3>
            </div>
            <span className={styles.inlineBadge}>连续好日 12 天</span>
          </div>
          <div className={styles.questionCard}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionDot} />
              <span>每日一问</span>
            </div>
            <p className={styles.cardText}>今天最让你微笑的瞬间是什么？</p>
            <div className={styles.inlineField}>写下你的答案…</div>
            <div className={styles.dualActionRow}>
              <span className={styles.softChip}>人物 · yuyuyu</span>
              <span className={styles.softChip}>日期 · 03-29</span>
            </div>
          </div>
          <div className={styles.moodGrid}>
            {["开心", "平静", "小确幸", "有点累", "超兴奋"].map((label, index) => (
              <div key={label} className={styles.moodItem} data-active={index === 2}>
                <span className={styles.moodBubble} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className={styles.calendarCard}>
            <div className={styles.cardHeader}>
              <span className={styles.sectionDot} />
              <span>心情日历</span>
            </div>
            <div className={styles.horizontalBar}>
              <span>2026 年 3 月</span>
              <span>轻切换</span>
            </div>
          </div>
        </ScreenShell>
      );
    case "cloudy-entry":
      return (
        <ScreenShell
          directionId={directionId}
          tone="cloudy"
          title="Rain Shelter"
          actionLabel="回到小美好"
          navActive={0}
        >
          <div className={styles.sheetRow}>
            <span className={styles.softChip}>今天 · 03-29</span>
            <span className={styles.cloudyChip}>先慢慢放下</span>
          </div>
          <div className={styles.cloudyCard}>
            <p className={styles.kicker}>小烦恼入口</p>
            <h3 className={styles.heroCardTitle}>先把心里的潮湿放下来，再慢慢整理。</h3>
            <div className={styles.textareaField}>说说吧，有什么不开心的？我在听…</div>
          </div>
          <div className={styles.bottomActionRail}>
            <span className={styles.primaryPill}>放入档案袋</span>
          </div>
        </ScreenShell>
      );
    case "timeline":
      return (
        <ScreenShell
          directionId={directionId}
          tone="shared"
          title="Mood Log"
          actionLabel="洞察"
          navActive={1}
        >
          <div className={styles.filterCard}>
            <div className={styles.compactRow}>
              <span className={styles.primaryChip}>全部</span>
              <span className={styles.softChip}>yuyuyu</span>
            </div>
            <div className={styles.compactRow}>
              <span className={styles.softChip}>开始日期</span>
              <span className={styles.softChip}>结束日期</span>
            </div>
            <div className={styles.blockButton}>AI 总结报告</div>
            <div className={styles.blockButtonAlt}>解忧档案袋</div>
          </div>
          <p className={styles.dayHeading}>2026 年 3 月 29 日</p>
          {[0, 1, 2].map((item) => (
            <div key={item} className={styles.timelineItem}>
              <div className={styles.timelineThumb} />
              <div className={styles.timelineCopy}>
                <div className={styles.compactRow}>
                  <span className={styles.personChip}>yuyuyu</span>
                  <span className={styles.mutedChip}>Unsplash</span>
                </div>
                <p className={styles.timelineTitle}>缩略图、标题和时间关系重新整理</p>
                <p className={styles.cardText}>
                  列表卡更轻、更短，点击后进入详情页，不改原有功能关系。
                </p>
                <span className={styles.mutedTime}>18:3{item}</span>
              </div>
            </div>
          ))}
        </ScreenShell>
      );
    case "insight":
      return (
        <ScreenShell
          directionId={directionId}
          tone="joy"
          title="Healing Insight"
          actionLabel="分享"
          navActive={2}
        >
          <div className={styles.heroCard}>
            <div>
              <p className={styles.kicker}>AI Summary</p>
              <h3 className={styles.heroCardTitle}>更像专题摘要的 AI 报告，而不是堆满信息的大白卡</h3>
            </div>
          </div>
          <div className={styles.filterCard}>
            <div className={styles.compactRow}>
              <span className={styles.primaryChip}>全部</span>
              <span className={styles.softChip}>yuyuyu</span>
            </div>
            <div className={styles.compactRow}>
              <span className={styles.softChip}>一周</span>
              <span className={styles.softChip}>一个月</span>
              <span className={styles.softChip}>三个月</span>
            </div>
            <div className={styles.blockButton}>生成总结</div>
          </div>
          <div className={styles.weatherCard}>
            <div>
              <p className={styles.kicker}>情绪天气</p>
              <p className={styles.weatherTitle}>初雨</p>
            </div>
            <div className={styles.weatherStat}>65%</div>
          </div>
          <div className={styles.chipWrap}>
            {["情绪觉察", "关系流动", "自我和解", "成长释怀"].map((label) => (
              <span key={label} className={styles.keywordChip}>
                {label}
              </span>
            ))}
          </div>
          <div className={styles.noteCard}>
            <p className={styles.kicker}>行动建议</p>
            <p className={styles.noteTitle}>延续情绪日记</p>
            <p className={styles.cardText}>每天几分钟，用短句记下一个情绪瞬间。</p>
          </div>
        </ScreenShell>
      );
    case "profile":
      return (
        <ScreenShell
          directionId={directionId}
          tone="shared"
          title="Profile"
          actionLabel="编辑"
          navActive={3}
        >
          <div className={styles.profileIntro}>
            <p className={styles.kicker}>Profile</p>
            <h3 className={styles.heroCardTitle}>资料与账号信息整理成更轻的原生面板</h3>
          </div>
          <div className={styles.profileCard}>
            <div className={styles.profileHead}>
              <span className={styles.avatarBadge}>Y</span>
              <div>
                <p className={styles.profileLabel}>你的资料</p>
                <p className={styles.profileName}>yuyuyu</p>
              </div>
              <span className={styles.primaryChip}>保存</span>
            </div>
            <div className={styles.infoCard}>邮箱 · yjl20230113@gmail.com</div>
            <div className={styles.infoCard}>刷新 · 清理缓存并拉取新版资源</div>
          </div>
          <div className={styles.blockButton}>退出登录</div>
        </ScreenShell>
      );
    case "cloudy-archive":
      return (
        <ScreenShell
          directionId={directionId}
          tone="cloudy"
          title="Archive"
          actionLabel="删除模式"
          navActive={1}
        >
          <div className={styles.cloudyCard}>
            <p className={styles.kicker}>Rain Shelter Archive</p>
            <h3 className={styles.heroCardTitle}>解忧档案袋像一叠冷静纸页，而不是紫色画布</h3>
          </div>
          <p className={styles.dayHeading}>2026 年 3 月 29 日</p>
          {[0, 1].map((item) => (
            <div key={item} className={styles.archiveCard}>
              <div className={styles.compactRow}>
                <div className={styles.compactRow}>
                  <span className={styles.softChip}>2026-03-29</span>
                  <span className={styles.cloudyChip}>已回信</span>
                </div>
                <span className={styles.primaryChip}>查看回信</span>
              </div>
              <p className={styles.cardText}>
                归档卡按纸页逻辑组织，回信和删除在静态层级里被明确区分。
              </p>
              <span className={styles.mutedTime}>17:0{item + 7}</span>
            </div>
          ))}
        </ScreenShell>
      );
    case "healing-letter":
      return (
        <ScreenShell
          directionId={directionId}
          tone="cloudy"
          title="The Healing Letter"
          actionLabel="收藏"
          navActive={1}
        >
          <div className={styles.paperHero}>
            <p className={styles.kicker}>The Healing Letter</p>
            <h3 className={styles.letterTitle}>此路，亦是风景</h3>
          </div>
          {["情绪镜像", "温和重构", "好事记录"].map((section) => (
            <div key={section} className={styles.paperSection}>
              <p className={styles.paperLabel}>{section}</p>
              <p className={styles.paperBody}>
                长文页更像一本被妥帖整理的纸册，工具位缩薄，阅读面变得更沉浸。
              </p>
            </div>
          ))}
        </ScreenShell>
      );
    case "joy-detail":
      return (
        <ScreenShell
          directionId={directionId}
          tone="joy"
          title="记录详情"
          actionLabel="编辑"
          navActive={1}
        >
          <div className={styles.detailImage} />
          <div className={styles.compactRow}>
            <span className={styles.personChip}>yuyuyu</span>
            <span className={styles.mutedChip}>2026-03-29</span>
          </div>
          <div className={styles.detailTitleCard}>
            <p className={styles.detailTitle}>情绪释放之道</p>
            <p className={styles.cardText}>保留图片区、感悟区和 AI 微光区，但全部换成更轻的版式。</p>
          </div>
          <div className={styles.detailSection}>
            <p className={styles.kicker}>那个瞬间</p>
            <p className={styles.cardText}>我觉得情绪像一个需要被看见、被安放的小孩。</p>
          </div>
          <div className={styles.detailSection}>
            <p className={styles.kicker}>此时感悟</p>
            <p className={styles.cardText}>与内在小孩温柔和解，让详情页更高级而不臃肿。</p>
          </div>
        </ScreenShell>
      );
    default:
      return null;
  }
}

function ScreenShell({
  directionId,
  tone,
  title,
  actionLabel,
  navActive,
  children,
}: {
  directionId: string;
  tone: "joy" | "cloudy" | "shared";
  title: string;
  actionLabel: string;
  navActive: 0 | 1 | 2 | 3;
  children: ReactNode;
}) {
  return (
    <>
      <div className={styles.topBar}>
        <div className={styles.topBarTitle}>
          <span className={styles.topBarDot} />
          <span>{title}</span>
        </div>
        <span className={styles.topBarAction}>{actionLabel}</span>
      </div>
      <div className={styles.screenBody} data-variant={directionId} data-tone={tone}>
        <div className={styles.screenStack}>{children}</div>
      </div>
      <div className={styles.bottomNav}>
        {["悦点", "日志", "社区", "我的"].map((label, index) => (
          <div key={label} className={styles.navItem} data-active={navActive === index}>
            <span className={styles.navGlyph} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
