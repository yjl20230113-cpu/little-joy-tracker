import { LoaderCircle, RefreshCw, Trash2 } from "lucide-react";

import { formatTimelineHeading, formatTimelineTime } from "../lib/app-logic";
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
  deleteMode: boolean;
  deletingItemId: string;
  onBackToTimeline: () => void;
  onOpenItem: (itemId: string) => void;
  onRetryItem: (itemId: string) => void;
  onBackToArchive: () => void;
  onDeleteConfirm: (itemId: string) => void;
};

type ArchiveGroup = {
  date: string;
  items: CloudyArchiveItem[];
};

const statusCopy = {
  pending: "整理中",
  ready: "已回信",
  failed: "待补信",
  unknown: "未分类",
};

const metaPillClass =
  "inline-flex min-h-[1.9rem] items-center rounded-full border border-[rgba(143,133,149,0.16)] bg-[rgba(255,252,253,0.84)] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.02em] shadow-[0_8px_18px_-18px_rgba(75,53,45,0.22)]";
const datePillClass = `${metaPillClass} text-[#6f638b]`;
const statusPillClass = `${metaPillClass} bg-[rgba(227,221,229,0.86)] text-[#7a6470]`;
const actionPillClass =
  "inline-flex min-h-[1.9rem] items-center rounded-full border border-transparent bg-[rgba(75,53,45,0.9)] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.02em] text-[#fff8f4] shadow-[0_12px_20px_-18px_rgba(75,53,45,0.32)] transition-colors hover:bg-[rgba(75,53,45,0.96)]";
const deletePillClass =
  "inline-flex min-h-[1.9rem] items-center rounded-full border border-[rgba(193,127,102,0.16)] bg-[rgba(255,243,237,0.9)] px-3 py-1 text-[0.68rem] font-semibold tracking-[0.02em] text-[#8a5643] shadow-[0_10px_20px_-18px_rgba(75,53,45,0.18)] disabled:opacity-70";

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

function groupArchiveItems(items: CloudyArchiveItem[]): ArchiveGroup[] {
  const groups = new Map<string, CloudyArchiveItem[]>();

  for (const item of items) {
    const current = groups.get(item.displayDate) ?? [];
    current.push(item);
    groups.set(item.displayDate, current);
  }

  return Array.from(groups.entries()).map(([date, groupedItems]) => ({
    date,
    items: groupedItems,
  }));
}

export function CloudyArchiveView({
  items,
  loading,
  retryingId,
  selectedItem,
  selectedLetter,
  deleteMode,
  deletingItemId,
  onBackToTimeline: _onBackToTimeline,
  onOpenItem,
  onRetryItem,
  onBackToArchive,
  onDeleteConfirm,
}: CloudyArchiveViewProps) {
  const groupedItems = groupArchiveItems(items);

  if (selectedItem) {
    if (selectedLetter) {
      return (
        <section data-ui="cloudy-archive-view" className="space-y-3 pb-5">
          <CloudyLetterCard
            letter={selectedLetter}
            footerActionLabel="回到档案袋"
            onFooterAction={onBackToArchive}
          />
        </section>
      );
    }

    return (
      <section data-ui="cloudy-archive-view" className="space-y-3 pb-5">
        <section className="joy-card rounded-[1.35rem] border-[rgba(143,133,149,0.16)] bg-[linear-gradient(180deg,rgba(247,243,246,0.96),rgba(241,236,243,0.98))] px-4 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f8595]">
            The Healing Letter
          </p>
          <h3 className="mt-2 text-[1.2rem] font-black tracking-[-0.04em] text-[#4f4656]">
            这封回信暂时还打不开
          </h3>
          <p className="mt-3 text-[0.92rem] leading-7 text-[#5f5574]">
            这条记录已经留在档案袋里了，只是纸页还有一点潮。再整理一次，会比重新倾诉更轻一点。
          </p>
          <div className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => onRetryItem(selectedItem.id)}
              disabled={retryingId === selectedItem.id}
              className="joy-topbar-button w-full justify-center border-[rgba(143,133,149,0.18)] bg-[rgba(255,252,253,0.84)] text-[#4b352d]"
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
              className="joy-topbar-button w-full justify-center border-[rgba(143,133,149,0.18)] bg-[rgba(255,252,253,0.84)] text-[#5f5568]"
            >
              回到档案袋
            </button>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section data-ui="cloudy-archive-view" className="space-y-3 pb-5">
      <div
        data-ui="cloudy-archive-intro"
        className="joy-card rounded-[1.35rem] border-[rgba(143,133,149,0.16)] bg-[linear-gradient(180deg,rgba(247,243,246,0.96),rgba(241,236,243,0.98))] px-4 py-4 shadow-[0_24px_42px_-34px_rgba(75,53,45,0.2)]"
      >
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-[#8f8595]">
          Rain Shelter Archive
        </p>
        <h3 className="mt-2 text-[1.35rem] font-black tracking-[-0.04em] text-[#4f4656]">
          解忧档案袋
        </h3>
        <p className="mt-2 text-[0.92rem] leading-7 text-[#5f5574]">
          这里收着那些没有被放上时间线的阴天。它们不会挤进喜悦里，但会被好好安放。
        </p>
      </div>

      {loading ? (
        <div className="joy-card flex items-center gap-3 rounded-[1.25rem] border-[rgba(143,133,149,0.16)] bg-[rgba(255,252,253,0.82)] px-4 py-4 text-[0.9rem] text-[#5f5574]">
          <LoaderCircle className="size-4 animate-spin text-[#8f8595]" />
          正在整理你的避雨记录...
        </div>
      ) : items.length === 0 ? (
        <div className="joy-card rounded-[1.25rem] border-[rgba(143,133,149,0.16)] bg-[rgba(255,252,253,0.82)] px-4 py-5 text-[0.92rem] leading-7 text-[#5f5574]">
          暂时还没有被放进档案袋的记录。等下一场雨来时，这里会替你留下一盏灯。
        </div>
      ) : (
        <div className="space-y-4">
          {groupedItems.map((group) => (
            <section key={group.date} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <h4 className="shrink-0 text-[1.15rem] font-black tracking-[-0.04em] text-[#5a4d73]">
                  {formatTimelineHeading(group.date)}
                </h4>
                <div className="h-px flex-1 bg-[rgba(143,133,149,0.18)]" />
              </div>

              <div className="space-y-2.5">
                {group.items.map((item) => {
                  const isReady = item.status === "ready";
                  const isFailed = item.status === "failed";
                  const isRetrying = retryingId === item.id;
                  const isDeleting = deletingItemId === item.id;

                  return (
                    <article
                      key={item.id}
                      data-ui="cloudy-archive-card"
                      className="joy-card rounded-[1.25rem] border-[rgba(143,133,149,0.16)] bg-[linear-gradient(180deg,rgba(247,243,246,0.96),rgba(241,236,243,0.98))] px-4 py-4 transition-all shadow-[0_18px_30px_-28px_rgba(75,53,45,0.18)]"
                    >
                      <div
                        data-ui="cloudy-archive-card-header"
                        className="flex flex-wrap items-center justify-between gap-2.5"
                      >
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className={datePillClass}>{item.displayDate}</span>
                          <span className={statusPillClass}>{getStatusLabel(item.status)}</span>
                        </div>

                        {deleteMode ? (
                          <button
                            type="button"
                            data-testid={`cloudy-archive-delete-card-${item.id}`}
                            onClick={() => onDeleteConfirm(item.id)}
                            disabled={isDeleting}
                            className={deletePillClass}
                          >
                            {isDeleting ? (
                              <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="mr-1.5 size-3.5" />
                            )}
                            删除
                          </button>
                        ) : isReady ? (
                          <button
                            type="button"
                            onClick={() => onOpenItem(item.id)}
                            className={actionPillClass}
                          >
                            查看回信
                          </button>
                        ) : null}
                      </div>

                      <div
                        data-ui="cloudy-archive-card-content"
                        className="mt-3 min-w-0"
                      >
                        {isReady && !deleteMode ? (
                          <button
                            type="button"
                            onClick={() => onOpenItem(item.id)}
                            className="block w-full text-left text-[1rem] leading-8 text-[#4f4656]"
                          >
                            {item.content}
                          </button>
                        ) : (
                          <p className="text-[1rem] leading-8 text-[#4f4656]">
                            {item.content}
                          </p>
                        )}

                        <p className="mt-3 text-[0.76rem] font-medium text-[#8d84a0]">
                          {formatTimelineTime(item.createdAt)}
                        </p>
                      </div>

                      {isFailed && !deleteMode ? (
                        <button
                          type="button"
                          onClick={() => onRetryItem(item.id)}
                          disabled={isRetrying}
                          className="joy-topbar-button mt-3 w-full justify-center border-[rgba(143,133,149,0.18)] bg-[rgba(255,252,253,0.84)] text-[#4b352d]"
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

                      {isDeleting ? (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[rgba(255,237,232,0.88)] px-3 py-1 text-[0.74rem] font-medium text-[#b75b39]">
                          <LoaderCircle className="size-3.5 animate-spin" />
                          正在永久删除这条记录
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  );
}
