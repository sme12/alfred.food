"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";
import type { ShoppingItemWithId, Category } from "@/schemas/mealPlanResponse";
import type { ShoppingTripWithIds } from "@/utils/shoppingItemId";
import { CATEGORY_EMOJI } from "@/config/defaults";
import { useShoppingListUIStore } from "@/stores/useShoppingListUIStore";
import { LongPressShoppingItem } from "./LongPressShoppingItem";

interface ShoppingListViewProps {
  trips: ShoppingTripWithIds[];
  checkedIds: Set<string>;
  deletedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  weekKey: string;
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
  deletedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  tripIndex: number;
  weekKey: string;
}

function CategorySection({
  category,
  items,
  checkedIds,
  deletedIds,
  onToggle,
  onDelete,
  tripIndex,
  weekKey,
}: CategorySectionProps) {
  const t = useTranslations("categories");

  const compoundKey = `${tripIndex}-${category}`;
  const weekState = useShoppingListUIStore((s) => s.weekStates[weekKey]);
  const collapsed =
    weekState?.collapsedCategories.includes(compoundKey) ?? false;
  const toggleCategoryCollapsed = useShoppingListUIStore(
    (s) => s.toggleCategoryCollapsed,
  );

  const checkedCount = items.filter((item) => checkedIds.has(item.id)).length;
  const emoji = CATEGORY_EMOJI[category];

  return (
    <div className="mb-2">
      <button
        onClick={() => toggleCategoryCollapsed(weekKey, tripIndex, category)}
        aria-expanded={!collapsed}
        aria-label={t(category)}
        className="w-full flex items-center justify-between py-1.5 px-1 text-left rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <span className="font-medium text-sm">{t(category)}</span>
          <span className="text-xs text-muted tabular-nums">
            ({checkedCount}/{items.length})
          </span>
        </div>
        <span className="text-muted text-sm" aria-hidden="true">
          {collapsed ? "▼" : "▲"}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-1">
          <AnimatePresence mode="popLayout">
            {items
              .filter((item) => !deletedIds.has(item.id))
              .map((item) => (
                <LongPressShoppingItem
                  key={item.id}
                  item={item}
                  isChecked={checkedIds.has(item.id)}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface TripSectionProps {
  trip: ShoppingTripWithIds;
  tripIndex: number;
  weekKey: string;
  checkedIds: Set<string>;
  deletedIds: Set<string>;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  showOnlyUnchecked: boolean;
}

function TripSection({
  trip,
  tripIndex,
  weekKey,
  checkedIds,
  deletedIds,
  onToggle,
  onDelete,
  showOnlyUnchecked,
}: TripSectionProps) {
  const weekState = useShoppingListUIStore((s) => s.weekStates[weekKey]);
  const collapsed = weekState?.collapsedTrips.includes(tripIndex) ?? false;
  const toggleTripCollapsed = useShoppingListUIStore(
    (s) => s.toggleTripCollapsed,
  );

  // Group items by category within this trip (excluding deleted)
  const itemsByCategory = useMemo(() => {
    const grouped = new Map<Category, ShoppingItemWithId[]>();
    for (const item of trip.items) {
      if (deletedIds.has(item.id)) continue;
      if (showOnlyUnchecked && checkedIds.has(item.id)) continue;
      const existing = grouped.get(item.category) || [];
      existing.push(item);
      grouped.set(item.category, existing);
    }
    return grouped;
  }, [trip.items, checkedIds, deletedIds, showOnlyUnchecked]);

  // Calculate counts excluding deleted items
  const activeItems = trip.items.filter((item) => !deletedIds.has(item.id));
  const totalItems = activeItems.length;
  const checkedCount = activeItems.filter((item) =>
    checkedIds.has(item.id),
  ).length;

  // Hide trip if filtering and all items checked
  if (showOnlyUnchecked && itemsByCategory.size === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        onClick={() => toggleTripCollapsed(weekKey, tripIndex)}
        aria-expanded={!collapsed}
        aria-label={trip.label}
        className="w-full flex items-center justify-between py-2 px-2 bg-card rounded-lg mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <span className="font-semibold">{trip.label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted tabular-nums">
            {checkedCount}/{totalItems}
          </span>
          <span className="text-muted" aria-hidden="true">
            {collapsed ? "▼" : "▲"}
          </span>
        </div>
      </button>

      {!collapsed && (
        <div className="pl-2">
          {CATEGORY_ORDER.map((category) => {
            const items = itemsByCategory.get(category);
            if (!items || items.length === 0) return null;
            return (
              <CategorySection
                key={category}
                category={category}
                items={items}
                checkedIds={checkedIds}
                deletedIds={deletedIds}
                onToggle={onToggle}
                onDelete={onDelete}
                tripIndex={tripIndex}
                weekKey={weekKey}
              />
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
  deletedIds,
  onToggle,
  onDelete,
  weekKey,
}: ShoppingListViewProps) {
  const t = useTranslations("shoppingList");

  const weekState = useShoppingListUIStore((s) => s.weekStates[weekKey]);
  const showOnlyUnchecked = weekState?.showOnlyUnchecked ?? false;
  const toggleShowOnlyUnchecked = useShoppingListUIStore(
    (s) => s.toggleShowOnlyUnchecked,
  );

  // Calculate totals (excluding deleted items)
  const totalItems = trips.reduce(
    (sum, trip) =>
      sum + trip.items.filter((item) => !deletedIds.has(item.id)).length,
    0,
  );
  const totalChecked = trips.reduce(
    (sum, trip) =>
      sum +
      trip.items.filter(
        (item) => !deletedIds.has(item.id) && checkedIds.has(item.id),
      ).length,
    0,
  );

  // Check if all items are checked (for empty state)
  const allChecked = totalChecked === totalItems && totalItems > 0;

  return (
    <div className="space-y-4">
      {/* Header with filter toggle */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          {totalChecked}/{totalItems}
        </div>
        <button
          onClick={() => toggleShowOnlyUnchecked(weekKey)}
          aria-pressed={showOnlyUnchecked}
          className={`text-sm px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
            showOnlyUnchecked
              ? "bg-accent text-white"
              : "bg-card hover:bg-card-hover"
          }`}
        >
          {showOnlyUnchecked ? t("showAll") : t("showUnchecked")}
        </button>
      </div>

      {/* Trips */}
      {trips.map((trip, index) => (
        <TripSection
          key={index}
          trip={trip}
          tripIndex={index}
          weekKey={weekKey}
          checkedIds={checkedIds}
          deletedIds={deletedIds}
          onToggle={onToggle}
          onDelete={onDelete}
          showOnlyUnchecked={showOnlyUnchecked}
        />
      ))}

      {/* Empty state when filtering */}
      {showOnlyUnchecked && allChecked && (
        <div className="text-center py-8 text-muted">
          ✅ All items purchased!
        </div>
      )}
    </div>
  );
}
