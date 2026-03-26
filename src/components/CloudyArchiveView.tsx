import { LoaderCircle, RefreshCw } from "lucide-react";

import { formatTimelineTime } from "../lib/app-logic";
import type { CloudyAnalysisResult } from "../lib/cloudy-analysis";
import { CloudyLetterCard } from "./CloudyLetterCard";

export type CloudyArchiveItem = {
  id: string;
  content: string;
  createdAt: string;
  displayDate: string;
  personId: string;
  status: "pending" | "ready" | "failed" | null;
  aiResponse: unknown;
};

type CloudyArchiveViewProps = {
  items: CloudyArchiveItem[];
  loading: boolean;
  retryingId: string;
  selectedItem: CloudyArchiveItem | null;
  selectedLetter: CloudyAnalysisResult | null;
  onBackToTimeline: () => void;
  onOpenItem: (itemId: string) => void;
  onRetryItem: (itemId: string) => void;
  onBackToArchive: () => void;
};

const statusCopy = {
  pending: "整理中",
  ready: "已回信",
  failed: "待补信",
  unknown: "未分类",
};

function getStatusLabel(status: CloudyArchiveItem["status"]) {
  if (status === "pending") {
    return statusCopy.pending;
  }

  if (status === "ready") {
    return statusCopy.ready;
  }

  if (status === "failed") {
    return statusCopy.failed;
  }

  return statusCopy.unknown;
}

export function CloudyArchiveView({
  items,
  loading,
  retryingId,
  selectedItem,
  selectedLetter,
  onBackToTimeline: _onBackToTimeline,
  onOpenItem,
  onRetryItem,
  onBackToArchive,
}: CloudyArchiveViewProps) {
  if (selectedItem) {
    if (selectedLetter) {
      return (
        <CloudyLetterCard
          letter={selectedLetter}
          footerActionLabel="回到档案袋"
          onFooterAction={onBackToArchive}
        />
      );
    }

    return (
      <section className="joy-card rounded-[1.35rem] px-4 py-5">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
          The Healing Letter
        </p>
        <h3 className="mt-2 text-[1.2rem] font-black tracking-[-0.04em] text-[#53456c]">
          这封回信暂时还打不开
        </h3>
        <p className="mt-3 text-[0.92rem] leading-7 text-[#5f5574]">
          这条记录已经留在档案袋里了，只是纸页有一点潮。再整理一次，会比重新倾诉更轻一点。
        </p>
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={() => onRetryItem(selectedItem.id)}
            disabled={retryingId === selectedItem.id}
            className="joy-topbar-button joy-topbar-button--primary w-full justify-center"
          >
            {retryingId === selectedItem.id ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            重新整理这封回信
          </button>
          <button
            type="button"
            onClick={onBackToArchive}
            className="joy-topbar-button w-full justify-center bg-white/78 text-[#6b5a86]"
          >
            回到档案袋
          </button>
        </div>
      </section>
    );
  }

  return (
    <section data-ui="cloudy-archive-view" className="space-y-3">
      <div className="joy-card rounded-[1.25rem] px-4 py-4">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f81aa]">
          Rain Shelter Archive
        </p>
        <h3 className="mt-2 text-[1.35rem] font-black tracking-[-0.04em] text-[#53456c]">
          解忧档案袋
        </h3>
        <p className="mt-2 text-[0.92rem] leading-7 text-[#5f5574]">
          这里收着那些没有被放上时间线的阴天。它们不会挤进喜悦里，但会被好好安放。
        </p>
      </div>

      {loading ? (
        <div className="joy-card flex items-center gap-3 rounded-[1.2rem] px-4 py-4 text-[0.9rem] text-[var(--muted)]">
          <LoaderCircle className="size-4 animate-spin text-[#8f7ac0]" />
          正在整理你的避雨记录...
        </div>
      ) : items.length === 0 ? (
        <div className="joy-card rounded-[1.2rem] px-4 py-5 text-[0.92rem] leading-7 text-[#5f5574]">
          暂时还没有被放进档案袋的记录。等下一场雨来时，这里会替你留下一盏灯。
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => {
            const isReady = item.status === "ready";
            const isFailed = item.status === "failed";
            const isRetrying = retryingId === item.id;

            return (
              <article
                key={item.id}
                className="joy-card rounded-[1.2rem] border-[rgba(145,123,181,0.18)] bg-[linear-gradient(180deg,rgba(251,249,255,0.96),rgba(244,239,251,0.96))] px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-[0.65rem] font-semibold text-[#7a6d94]">
                        {item.displayDate}
                      </span>
                      <span className="rounded-full bg-[rgba(143,122,192,0.14)] px-2 py-0.5 text-[0.65rem] font-semibold text-[#7a64a7]">
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                    {isReady ? (
                      <button
                        type="button"
                        onClick={() => onOpenItem(item.id)}
                        className="mt-2 block w-full text-left text-[0.96rem] leading-7 text-[#4c4460]"
                      >
                        {item.content}
                      </button>
                    ) : (
                      <p className="mt-2 text-[0.96rem] leading-7 text-[#4c4460]">
                        {item.content}
                      </p>
                    )}
                    <p className="mt-2 text-[0.74rem] font-medium text-[#8d84a0]">
                      {formatTimelineTime(item.createdAt)}
                    </p>
                  </div>

                  {isReady ? (
                    <button
                      type="button"
                      onClick={() => onOpenItem(item.id)}
                      className="joy-topbar-button shrink-0 bg-white/78 px-3 text-[#6b5a86]"
                    >
                      查看回信
                    </button>
                  ) : null}
                </div>

                {isFailed ? (
                  <button
                    type="button"
                    onClick={() => onRetryItem(item.id)}
                    disabled={isRetrying}
                    className="joy-topbar-button joy-topbar-button--primary mt-3 w-full justify-center"
                  >
                    {isRetrying ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    重试回信
                  </button>
                ) : null}

                {item.status === "pending" ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-[0.74rem] font-medium text-[#6b5a86]">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    正在慢慢整理这封回信
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
