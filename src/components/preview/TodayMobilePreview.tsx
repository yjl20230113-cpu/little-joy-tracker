"use client";

import { useState } from "react";
import { BellRing, Pencil, Star } from "lucide-react";
import styles from "./TodayMobilePreview.module.css";
import { previewIcons, todayPreviewData } from "./preview-data";

type PreviewTabId = (typeof todayPreviewData.navItems)[number]["id"];

export function TodayMobilePreview() {
  const [activeTab, setActiveTab] = useState<PreviewTabId>("today");
  const SearchIcon = previewIcons.Search;
  const QuoteIcon = previewIcons.Quote;

  return (
    <main className={styles.page}>
      <div className={styles.pageShell}>
        <section className={styles.phoneFrame} aria-label="今日页预览">
          <div className={styles.grain} />
          <div className={styles.content}>
            <div className={styles.scrollArea}>
              <div className={styles.topMeta}>
                <span>10:07</span>
                <div className={styles.statusDots} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className={styles.heroHeader}>
                <div className={styles.avatar} aria-hidden="true">
                  <Star className="size-7" strokeWidth={1.7} />
                </div>
                <div>
                  <p className={styles.greeting}>{todayPreviewData.greeting}</p>
                  <p className={styles.subtitle}>{todayPreviewData.subtitle}</p>
                </div>
                <div className={styles.ghostIcon} aria-hidden="true">
                  <BellRing className="size-5" strokeWidth={1.8} />
                </div>
              </div>

              <div className={styles.searchWrap}>
                <SearchIcon className={`${styles.searchIcon} size-5`} strokeWidth={1.8} />
                <input
                  type="search"
                  className={styles.searchInput}
                  placeholder={todayPreviewData.searchPlaceholder}
                  readOnly
                />
              </div>

              <section className={styles.section} aria-labelledby="today-preview-title">
                <h1 id="today-preview-title" className={styles.sectionTitle}>
                  {todayPreviewData.title}
                </h1>

                <article className={styles.recordCard}>
                  <div className={styles.recordBadge} aria-hidden="true">
                    <todayPreviewData.hero.icon className="size-7" strokeWidth={1.8} />
                  </div>
                  <div>
                    <span className={styles.eyebrow}>温柔开场</span>
                    <h2 className={styles.recordTitle}>{todayPreviewData.hero.title}</h2>
                    <p className={styles.recordDescription}>
                      {todayPreviewData.hero.description}
                    </p>
                  </div>
                  <button type="button" className={styles.ctaButton}>
                    {todayPreviewData.hero.cta}
                  </button>
                </article>

                <div className={styles.cards}>
                  {todayPreviewData.featureCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      className={styles.featureCard}
                      data-accent={card.accent}
                    >
                      <div className={styles.featureCardTop}>
                        <div className={styles.featureIconWrap} aria-hidden="true">
                          <card.icon className="size-5" strokeWidth={1.8} />
                        </div>
                        {card.badge ? (
                          <span className={styles.featureBadge}>{card.badge}</span>
                        ) : null}
                      </div>
                      <span className={styles.eyebrow}>{card.eyebrow}</span>
                      <h3 className={styles.featureTitle}>{card.title}</h3>
                      <p className={styles.featureDescription}>{card.description}</p>
                      <span className={styles.featureMeta}>{card.meta}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className={styles.quoteWrap} aria-labelledby="preview-quote-title">
                <div className={styles.quoteHeader}>
                  <h2 id="preview-quote-title" className={styles.sectionTitle}>
                    {todayPreviewData.quote.title}
                  </h2>
                  <button type="button" className={styles.shareButton}>
                    分享
                  </button>
                </div>

                <article className={styles.quoteCard}>
                  <QuoteIcon className={`${styles.quoteIcon} size-8`} strokeWidth={1.7} />
                  <p className={styles.quoteText}>{todayPreviewData.quote.content}</p>
                  <p className={styles.quoteSource}>- {todayPreviewData.quote.source}</p>
                </article>
              </section>

              <section className={styles.section} aria-labelledby="preview-recommendations-title">
                <h2 id="preview-recommendations-title" className={styles.sectionTitle}>
                  今日推荐
                </h2>
                <div className={styles.recommendationList}>
                  {todayPreviewData.recommendations.map((item) => (
                    <article key={item.id} className={styles.recommendationCard}>
                      <div
                        className={styles.recommendationCover}
                        data-accent={item.accent}
                        aria-hidden="true"
                      />
                      <div>
                        <h3 className={styles.recommendationTitle}>{item.title}</h3>
                        <p className={styles.recommendationSubtitle}>{item.subtitle}</p>
                        <span className={styles.recommendationMeta}>
                          单节练习 {item.meta}
                        </span>
                      </div>
                      <span className={styles.eyebrow}>展开</span>
                    </article>
                  ))}
                </div>
              </section>
            </div>

            <button type="button" className={styles.fab} aria-label={todayPreviewData.fabLabel}>
              <Pencil className="size-7" strokeWidth={2} />
            </button>

            <nav className={styles.bottomNav} aria-label="预览底部导航">
              {todayPreviewData.navItems.map((item) => {
                const active = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.navButton}
                    data-active={active}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="size-5" strokeWidth={active ? 2.1 : 1.85} />
                    <span className={styles.navLabel}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </section>
      </div>
    </main>
  );
}
