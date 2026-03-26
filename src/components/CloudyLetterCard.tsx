import { motion } from "framer-motion";

import type { CloudyAnalysisResult } from "../lib/cloudy-analysis";

type CloudyLetterCardProps = {
  letter: CloudyAnalysisResult;
  footerActionLabel?: string;
  onFooterAction: () => void;
};

const sectionOrder = [
  { key: "hug", title: "抱抱" },
  { key: "analysis", title: "拆解" },
  { key: "light", title: "光亮" },
] as const;

export function CloudyLetterCard({
  letter,
  footerActionLabel = "回到小美好",
  onFooterAction,
}: CloudyLetterCardProps) {
  return (
    <motion.section
      data-ui="cloudy-letter-card"
      initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.36, ease: "easeOut" }}
      className="joy-card relative overflow-hidden rounded-[1.8rem] border border-[rgba(124,111,147,0.16)] bg-[linear-gradient(180deg,rgba(250,247,255,0.96),rgba(242,237,250,0.98))] px-4 py-5 shadow-xl sm:px-5 sm:py-6"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_28%),repeating-linear-gradient(180deg,rgba(124,111,147,0.035)_0px,rgba(124,111,147,0.035)_1px,transparent_1px,transparent_22px)]" />
      <div className="relative space-y-4">
        <div className="border-b border-[rgba(124,111,147,0.12)] pb-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
            The Healing Letter
          </p>
          <h3 className="mt-2 font-serif text-[1.55rem] tracking-[-0.04em] text-[#53456c]">
            今晚先把心放在这里
          </h3>
        </div>

        {sectionOrder.map(({ key, title }) => (
          <section
            key={key}
            className="rounded-[1.2rem] border border-[rgba(124,111,147,0.08)] bg-white/62 px-3.5 py-3.5 backdrop-blur-sm"
          >
            <p className="text-[0.74rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
              {title}
            </p>
            <p className="mt-2 text-[0.98rem] leading-7 text-[#4c4460]">
              {letter[key]}
            </p>
          </section>
        ))}

        <button
          type="button"
          onClick={onFooterAction}
          className="joy-topbar-button joy-topbar-button--primary w-full justify-center bg-[linear-gradient(90deg,#8f7ac0,#b49ad8)] shadow-[0_18px_30px_-24px_rgba(93,62,149,0.55)]"
        >
          {footerActionLabel}
        </button>
      </div>
    </motion.section>
  );
}
