"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function EmptyState() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-6xl mb-6">🍽️</div>
      <h2 className="text-xl font-semibold mb-2">{t("emptyState.title")}</h2>
      <p className="text-muted mb-8">{t("emptyState.description")}</p>
      <Link
        href="/new"
        className="inline-flex items-center justify-center h-12 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
      >
        {t("navigation.createPlan")}
      </Link>
    </div>
  );
}
