"use client";

import { useState } from "react";
import type { PlanListItem } from "@/schemas/persistedPlan";
import { usePlans } from "@/hooks/usePlans";
import { EmptyState } from "@/components/EmptyState";
import { TabSwitcher, type TabId } from "@/components/TabSwitcher";
import { WeekPagination } from "@/components/WeekPagination";
import { MealPlanView } from "@/components/MealPlanView";
import { ShoppingListView } from "@/components/ShoppingListView";
import { StickyPanel } from "@/components/StickyPanel";
import { MealPlanSkeleton, ShoppingListSkeleton } from "@/components/Skeleton";

interface HomeClientProps {
  initialWeeks: PlanListItem[];
}

export function HomeClient({ initialWeeks }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>("plan");
  const {
    plan,
    weekInfo,
    checkedIds,
    loading,
    error,
    goNext,
    goPrev,
    hasPrev,
    hasNext,
    toggleChecked,
  } = usePlans(initialWeeks);

  // No plans saved yet
  if (initialWeeks.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 space-y-4">
        {/* Week navigation */}
        {weekInfo && (
          <WeekPagination
            weekInfo={weekInfo}
            onPrev={goPrev}
            onNext={goNext}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        )}

        {/* Tab switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        {loading ? (
          activeTab === "plan" ? (
            <MealPlanSkeleton />
          ) : (
            <ShoppingListSkeleton />
          )
        ) : error ? (
          <div className="text-center py-8 text-error">{error}</div>
        ) : plan ? (
          activeTab === "plan" ? (
            <MealPlanView weekPlan={plan.result.weekPlan} />
          ) : (
            <ShoppingListView
              trips={plan.result.shoppingTrips}
              checkedIds={checkedIds}
              onToggle={toggleChecked}
            />
          )
        ) : (
          <div className="text-center py-8 text-muted">Plan not found</div>
        )}
      </main>

      {/* Sticky panel with "New plan" button */}
      <StickyPanel />
    </div>
  );
}
