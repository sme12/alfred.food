"use client";

import { useTranslations } from "next-intl";
import type { WeekInfo } from "@/utils/weekNumber";

interface WeekPaginationProps {
  weekInfo: WeekInfo;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function WeekPagination({
  weekInfo,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: WeekPaginationProps) {
  const t = useTranslations("pagination");

  return (
    <div className="flex items-center justify-between py-2">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className="h-11 w-11 flex items-center justify-center rounded-lg bg-card hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
        aria-label="Previous week"
      >
        <span className="text-xl">◀</span>
      </button>

      <div className="text-center">
        <div className="font-semibold">
          {t("week", { number: weekInfo.weekNumber })}
        </div>
        <div className="text-sm text-muted">{weekInfo.dateRange}</div>
      </div>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="h-11 w-11 flex items-center justify-center rounded-lg bg-card hover:bg-card-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.98]"
        aria-label="Next week"
      >
        <span className="text-xl">▶</span>
      </button>
    </div>
  );
}
