import type { CSSProperties } from "react";
import Link from "next/link";

import styles from "./PaletteSystemsPreview.module.css";
import {
  iphone17ProCanvasSpec,
  paletteSystemsPreviewSpec,
  type PalettePreviewSpec,
  type ScreenBlueprint,
} from "./palette-system-data";

type PaletteStyle = CSSProperties & Record<`--${string}`, string>;

function getPaletteVars(spec: PalettePreviewSpec): PaletteStyle {
  const palette = spec.palette;

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

export function PaletteSystemsPreview() {
  return (
    <main className={styles.page}>
      <div className={styles.pageGlow} aria-hidden="true" />

      <section className={styles.hero}>
        <div className={styles.heroMeta}>Preview Study · iPhone 17 Pro Canvas</div>
        <h1 className={styles.heroTitle}>Little Joy Tracker 配色与结构比稿</h1>
        <p className={styles.heroSummary}>
          本轮只做视觉与结构，不改任何功能。5 套方向全部采用更轻、更细、更紧凑的
          页面比例，同时保留小美好与小烦恼的语义差异；其中 Pearl Dawn 已经升级为
          深可可棕主压色，并可进入详细预览。
        </p>
        <div className={styles.heroBadges}>
          <span>5 套配色系统</span>
          <span>8 个页面结构板</span>
          <span>iPhone 17 Pro 固定画布</span>
          <span>不改功能</span>
        </div>
      </section>

      <section className={styles.paletteGrid} aria-label="五套配色方案">
        {paletteSystemsPreviewSpec.map((spec) => (
          <article
            key={spec.id}
            data-testid="palette-system-card"
            className={styles.paletteCard}
            style={getPaletteVars(spec)}
          >
            <header className={styles.paletteHeader}>
              <div className={styles.paletteHeaderTop}>
                <div>
                  <h2 className={styles.paletteTitle}>{spec.name}</h2>
                  <p className={styles.paletteSubtitle}>{spec.subtitle}</p>
                </div>
                {spec.referenceLabel ? (
                  <span className={styles.referenceBadge}>{spec.referenceLabel}</span>
                ) : null}
              </div>

              <div className={styles.paletteNotes}>
                <p>{spec.direction}</p>
                <p>{spec.contrastNote}</p>
              </div>

              <div className={styles.legendRow}>
                <div className={styles.legendItem}>
                  <span className={styles.legendSwatch} data-tone="joy" />
                  <span>小美好</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendSwatch} data-tone="cloudy" />
                  <span>小烦恼</span>
                </div>
                <div className={styles.swatchStrip} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              {spec.detailRouteSlug ? (
                <div className={styles.paletteActions}>
                  <Link
                    href={`/preview/palette-systems/${spec.detailRouteSlug}`}
                    className={styles.detailLink}
                  >
                    查看 Pearl Dawn 详细预览
                  </Link>
                </div>
              ) : null}
            </header>

            <div className={styles.screenGrid}>
              {spec.screens.map((screen) => (
                <section
                  key={screen.id}
                  data-testid="screen-blueprint-card"
                  className={styles.screenCard}
                >
                  <div className={styles.screenMeta}>
                    <div>
                      <p className={styles.screenTitle}>{screen.title}</p>
                      <p className={styles.screenSummary}>{screen.summary}</p>
                    </div>
                    <span className={styles.modeBadge} data-tone={screen.tone}>
                      {screen.tone === "joy"
                        ? "小美好"
                        : screen.tone === "cloudy"
                          ? "小烦恼"
                          : "共享骨架"}
                    </span>
                  </div>
                  <div
                    className={styles.phoneFrame}
                    data-testid="overview-phone-canvas"
                    data-phone-canvas={iphone17ProCanvasSpec.id}
                    data-canvas-width={iphone17ProCanvasSpec.width}
                    data-canvas-height={iphone17ProCanvasSpec.height}
                  >
                    {renderBlueprint(screen)}
                  </div>
                  <p className={styles.densityNote}>{screen.densityNote}</p>
                </section>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

function renderBlueprint(screen: ScreenBlueprint) {
  switch (screen.id) {
    case "joy-entry":
      return <JoyEntryBoard />;
    case "cloudy-entry":
      return <CloudyEntryBoard />;
    case "timeline":
      return <TimelineBoard />;
    case "insight":
      return <InsightBoard />;
    case "profile":
      return <ProfileBoard />;
    case "cloudy-archive":
      return <CloudyArchiveBoard />;
    case "healing-letter":
      return <HealingLetterBoard />;
    case "joy-detail":
      return <JoyDetailBoard />;
    default:
      return null;
  }
}

function MiniTopBar({
  title,
  trailing = "dot",
}: {
  title: string;
  trailing?: "dot" | "pill";
}) {
  return (
    <div className={styles.miniTopBar}>
      <div className={styles.miniBrand}>
        <span className={styles.miniBrandIcon} aria-hidden="true" />
        <span>{title}</span>
      </div>
      {trailing === "pill" ? (
        <span className={styles.miniPill}>返回</span>
      ) : (
        <span className={styles.miniTopIcon} aria-hidden="true" />
      )}
    </div>
  );
}

function MiniNav({ active }: { active: 0 | 1 | 2 | 3 }) {
  return (
    <div className={styles.bottomNav}>
      {["每日悦点", "心绪日志", "治愈社区", "个人中心"].map((label, index) => (
        <div key={label} className={styles.navItem} data-active={active === index}>
          <span className={styles.navIcon} aria-hidden="true" />
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function JoyEntryBoard() {
  return (
    <div className={styles.miniScreen} data-surface="warm">
      <MiniTopBar title="Little Joy Tracker" />
      <div className={styles.stackDense}>
        <div className={styles.heroWelcomeCard}>
          <div>
            <p className={styles.eyebrow}>Morning Note</p>
            <p className={styles.inlineSubtle}>把今天也放进一页轻盈、精致的小记录。</p>
          </div>
          <span className={styles.streakPill}>连结感</span>
        </div>
        <div className={styles.questionCard}>
          <div className={styles.questionHeader}>
            <span className={styles.questionIcon} aria-hidden="true" />
            <span>每日一问</span>
          </div>
          <p className={styles.questionText}>今天最值得保存下来的小瞬间是什么？</p>
          <div className={styles.inputShell}>写下今天的微小幸福</div>
        </div>
        <div className={styles.moodStrip}>
          {["开心", "平静", "小确幸", "有点累", "超兴奋"].map((label, index) => (
            <div key={label} className={styles.moodChip} data-active={index === 2}>
              <span className={styles.moodFace} aria-hidden="true" />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className={styles.calendarCard}>
          <div className={styles.cardRow}>
            <span className={styles.sectionLabel}>心情日历</span>
            <span className={styles.smallAction}>＋</span>
          </div>
          <div className={styles.calendarBar}>
            <span>2026 年 3 月</span>
            <span>轻量切换</span>
          </div>
        </div>
      </div>
      <button type="button" className={styles.fab}>
        ＋
      </button>
      <MiniNav active={0} />
    </div>
  );
}

function CloudyEntryBoard() {
  return (
    <div className={styles.miniScreen} data-surface="cloudy">
      <MiniTopBar title="Rain Shelter" trailing="pill" />
      <div className={styles.stackDense}>
        <div className={styles.slimPillRow}>
          <span className={styles.datePill}>今天 · 03-29</span>
          <span className={styles.softMiniPill}>先放下来</span>
        </div>
        <div className={styles.cloudyIntroCard}>
          <p className={styles.eyebrow}>Cloudy</p>
          <p className={styles.cloudyLead}>不着急整理自己，先把此刻的不安慢慢放下。</p>
          <div className={styles.textareaBlock}>说说吧，有什么不开心的？我在听…</div>
        </div>
      </div>
      <div className={styles.footerRail}>
        <span className={styles.primaryAction}>放入档案袋</span>
      </div>
      <MiniNav active={0} />
    </div>
  );
}

function TimelineBoard() {
  return (
    <div className={styles.miniScreen} data-surface="warm">
      <MiniTopBar title="Mood Log" />
      <div className={styles.stackDense}>
        <div className={styles.filterPanel}>
          <div className={styles.filterRow}>
            <span className={styles.filterChip} data-active="true">
              全部
            </span>
            <span className={styles.filterChip}>yuyuyu</span>
          </div>
          <div className={styles.filterRow}>
            <span className={styles.inputChip}>开始日期</span>
            <span className={styles.inputChip}>结束日期</span>
          </div>
          <div className={styles.summaryChip}>AI 总结报告</div>
          <div className={styles.archiveChip}>解忧档案袋</div>
        </div>
        <div className={styles.dayHeader}>2026 年 3 月 29 日</div>
        {[0, 1, 2].map((item) => (
          <div key={item} className={styles.timelineCard}>
            <div className={styles.timelineThumb} />
            <div className={styles.timelineBody}>
              <div className={styles.cardTags}>
                <span className={styles.personTag}>yuyuyu</span>
                <span className={styles.sourceTag}>Unsplash</span>
              </div>
              <p className={styles.timelineTitle}>更轻、更精致的时间线卡片组织</p>
              <p className={styles.timelineExcerpt}>
                缩略图更小，主标题更聚焦，时间被压缩到末端，整体秩序更清晰。
              </p>
              <span className={styles.timelineTime}>18:36</span>
            </div>
          </div>
        ))}
      </div>
      <MiniNav active={1} />
    </div>
  );
}

function InsightBoard() {
  return (
    <div className={styles.miniScreen} data-surface="warm">
      <MiniTopBar title="Healing Insight" />
      <div className={styles.stackDense}>
        <div className={styles.insightHero}>
          <p className={styles.eyebrow}>AI Insight</p>
          <p className={styles.inlineSubtle}>把厚重信息页拆成更轻、更像专题摘要的结构。</p>
        </div>
        <div className={styles.filterPanel}>
          <div className={styles.filterRow}>
            <span className={styles.filterChip} data-active="true">
              全部
            </span>
            <span className={styles.filterChip}>yuyuyu</span>
          </div>
          <div className={styles.filterRow}>
            <span className={styles.inputChip}>一周</span>
            <span className={styles.inputChip}>一个月</span>
            <span className={styles.inputChip}>三个月</span>
          </div>
          <div className={styles.primaryBar}>生成总结</div>
        </div>
        <div className={styles.insightWeatherCard}>
          <div>
            <p className={styles.sectionLabel}>情绪天气</p>
            <p className={styles.insightTitle}>初雨</p>
          </div>
          <div className={styles.weatherStat}>65%</div>
        </div>
        <div className={styles.keywordRow}>
          {["情绪觉察", "关系流动", "自我和解", "成长释怀"].map((label) => (
            <span key={label} className={styles.keywordChip}>
              {label}
            </span>
          ))}
        </div>
        <div className={styles.insightNoteCard}>
          <p className={styles.sectionLabel}>行动建议</p>
          <p className={styles.noteTitle}>延续情绪日记</p>
          <p className={styles.noteBody}>每天几分钟，用更短的话记录一个情绪瞬间。</p>
        </div>
      </div>
      <MiniNav active={2} />
    </div>
  );
}

function ProfileBoard() {
  return (
    <div className={styles.miniScreen} data-surface="warm">
      <MiniTopBar title="Profile" />
      <div className={styles.stackDense}>
        <div className={styles.profileIntroCard}>
          <p className={styles.eyebrow}>Profile</p>
          <p className={styles.inlineSubtle}>个人中心更像原生设置页，而不是一整块空白画布。</p>
        </div>
        <div className={styles.profileCard}>
          <div className={styles.profileHead}>
            <span className={styles.avatarCircle}>Y</span>
            <div>
              <p className={styles.profileTitle}>你的资料</p>
              <p className={styles.profileName}>yuyuyu</p>
            </div>
            <span className={styles.smallPrimary}>编辑</span>
          </div>
          <div className={styles.infoRow}>邮箱 · yjl20230113@gmail.com</div>
          <div className={styles.infoRow}>刷新 · 清理缓存并拉取新版内容</div>
        </div>
        <div className={styles.logoutBar}>退出登录</div>
      </div>
      <MiniNav active={3} />
    </div>
  );
}

function CloudyArchiveBoard() {
  return (
    <div className={styles.miniScreen} data-surface="cloudy">
      <MiniTopBar title="Archive" trailing="pill" />
      <div className={styles.stackDense}>
        <div className={styles.archiveHeaderCard}>
          <p className={styles.eyebrow}>Rain Shelter Archive</p>
          <p className={styles.archiveTitle}>解忧档案袋</p>
          <p className={styles.inlineSubtle}>冷静、纸感、可安放，而不是大片紫色背景。</p>
        </div>
        <div className={styles.dayHeader} data-tone="cloudy">
          2026 年 3 月 29 日
        </div>
        {[0, 1].map((item) => (
          <div key={item} className={styles.archiveEntryCard}>
            <div className={styles.cardRow}>
              <div className={styles.cardTags}>
                <span className={styles.inputChip}>2026-03-29</span>
                <span className={styles.softMiniPill}>已回信</span>
              </div>
              <span className={styles.smallPrimary}>查看回信</span>
            </div>
            <p className={styles.archiveExcerpt}>
              内容卡更轻更安静，像被妥帖放好的纸页，而不是被情绪颜色整页覆盖。
            </p>
            <span className={styles.timelineTime}>17:07</span>
          </div>
        ))}
      </div>
      <MiniNav active={1} />
    </div>
  );
}

function HealingLetterBoard() {
  return (
    <div className={styles.miniScreen} data-surface="cloudy">
      <MiniTopBar title="The Healing Letter" trailing="pill" />
      <div className={styles.stackDense}>
        <div className={styles.archiveHeaderCard}>
          <p className={styles.eyebrow}>The Healing Letter</p>
          <p className={styles.letterTitle}>此路，亦是风景</p>
        </div>
        {["情绪镜像", "温和重构", "好事记录"].map((section) => (
          <div key={section} className={styles.letterSection}>
            <p className={styles.sectionLabel}>{section}</p>
            <p className={styles.letterBody}>
              用更短的纸感分段承接内容，让阅读更有呼吸，而不是挤满整块面板。
            </p>
          </div>
        ))}
      </div>
      <MiniNav active={1} />
    </div>
  );
}

function JoyDetailBoard() {
  return (
    <div className={styles.miniScreen} data-surface="warm">
      <MiniTopBar title="记录详情" trailing="pill" />
      <div className={styles.stackDense}>
        <div className={styles.detailImage} />
        <div className={styles.cardTags}>
          <span className={styles.personTag}>yuyuyu</span>
          <span className={styles.timelineTime}>2026-03-29</span>
        </div>
        <div className={styles.detailTitleWrap}>
          <p className={styles.detailTitle}>情绪释放之道</p>
          <p className={styles.inlineSubtle}>保留所有原功能内容区，但整体变得更轻、更纤细。</p>
        </div>
        <div className={styles.detailInfoCard}>
          <p className={styles.sectionLabel}>那个瞬间</p>
          <p className={styles.noteBody}>我觉得情绪像需要被看见、被理解、被安放的内在小孩。</p>
        </div>
        <div className={styles.detailInfoCard}>
          <p className={styles.sectionLabel}>此时感悟</p>
          <p className={styles.noteBody}>与内在小孩温柔和解，让内容卡像更薄、更高级的纸页叠层。</p>
        </div>
      </div>
      <MiniNav active={1} />
    </div>
  );
}
