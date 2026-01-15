"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ShoppingItemWithId, Category } from "@/schemas/mealPlanResponse";
import type { ShoppingTripWithIds } from "@/utils/shoppingItemId";
import { CATEGORY_EMOJI } from "@/config/defaults";

interface ShoppingListViewProps {
  trips: ShoppingTripWithIds[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}

// Category display order
const CATEGORY_ORDER: Category[] = [
  "produce",
  "dairy",
  "meat",
  "bakery",
  "pantry",
  "frozen",
  "condiments",
];

interface CategorySectionProps {
  category: Category;
  items: ShoppingItemWithId[];
  checkedIds: Set<string>;
  onToggle: (id: string) => void;
}

function CategorySection({
  category,
  items,
  checkedIds,
  onToggle,
}: CategorySectionProps) {
  const t = useTranslations("categories");
  const [collapsed, setCollapsed] = useState(false);

  const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;
  const emoji = CATEGORY_EMOJI[category];

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between py-2 px-1 text-left"
      >
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-medium">{t(category)}</span>
          <span className="text-sm text-muted">
            ({checkedCount}/{items.length})
          </span>
        </div>
        <span className="text-muted">{collapsed ? "▼" : "▲"}</span>
      </button>

      {!collapsed && (
        <div className="space-y-1">
          {items.map((item) => {
            const isChecked = checkedIds.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className={`w-full flex items-center gap-3 h-14 px-3 rounded-lg transition-colors active:scale-[0.98] ${
                  isChecked
                    ? "bg-card/50 text-muted line-through"
                    : "bg-card hover:bg-card-hover"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    isChecked
                      ? "bg-success border-success text-white"
                      : "border-border"
                  }`}
                >
                  {isChecked && <span className="text-sm">✓</span>}
                </div>
                <span className="flex-1 text-left">{item.name}</span>
                <span className="text-sm text-muted">{item.amount}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ShoppingListView({
  trips,
  checkedIds,
  onToggle,
}: ShoppingListViewProps) {
  const t = useTranslations("shoppingList");
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);

  // Group items by category across all trips
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<Category, ShoppingItemWithId[]>();

    for (const trip of trips) {
      for (const item of trip.items) {
        if (showOnlyUnchecked && checkedIds.has(item.id)) continue;

        const existing = grouped.get(item.category) || [];
        existing.push(item);
        grouped.set(item.category, existing);
      }
    }

    return grouped;
  }, [trips, checkedIds, showOnlyUnchecked]);

  // Calculate totals
  const totalItems = trips.reduce((sum, trip) => sum + trip.items.length, 0);
  const totalChecked = trips.reduce(
    (sum, trip) =>
      sum + trip.items.filter((item) => checkedIds.has(item.id)).length,
    0
  );

  return (
    <div className="space-y-4">
      {/* Header with filter toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {totalChecked}/{totalItems}
        </div>
        <button
          onClick={() => setShowOnlyUnchecked(!showOnlyUnchecked)}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
            showOnlyUnchecked
              ? "bg-accent text-white"
              : "bg-card hover:bg-card-hover"
          }`}
        >
          {showOnlyUnchecked ? t("showAll") : t("showUnchecked")}
        </button>
      </div>

      {/* Categories */}
      {CATEGORY_ORDER.map((category) => {
        const items = itemsByCategory.get(category);
        if (!items || items.length === 0) return null;

        return (
          <CategorySection
            key={category}
            category={category}
            items={items}
            checkedIds={checkedIds}
            onToggle={onToggle}
          />
        );
      })}

      {/* Empty state when filtering */}
      {showOnlyUnchecked && itemsByCategory.size === 0 && (
        <div className="text-center py-8 text-muted">
          ✅ All items purchased!
        </div>
      )}
    </div>
  );
}
