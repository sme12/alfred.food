"use client";

import { useTranslations } from "next-intl";

export type TabId = "plan" | "shoppingList";

interface TabSwitcherProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const t = useTranslations("tabs");

  const tabs: { id: TabId; label: string }[] = [
    { id: "plan", label: t("plan") },
    { id: "shoppingList", label: t("shoppingList") },
  ];

  return (
    <div className="flex bg-card rounded-lg p-1 sticky top-0 z-10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 h-11 px-4 rounded-md font-medium transition-colors active:scale-[0.98] ${
            activeTab === tab.id
              ? "bg-accent text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
