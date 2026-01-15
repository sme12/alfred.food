"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function StickyPanel() {
  const t = useTranslations("navigation");

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-lg mx-auto p-4">
        <Link
          href="/new"
          className="flex items-center justify-center w-full h-12 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors active:scale-[0.98]"
        >
          {t("newPlan")}
        </Link>
      </div>
    </div>
  );
}
