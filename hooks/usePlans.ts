"use client";

import { useState, useEffect, useCallback } from "react";
import type { PersistedPlan, PlanListItem } from "@/schemas/persistedPlan";
import type { DayPlan } from "@/schemas/mealPlanResponse";
import type { AppState } from "@/schemas/appState";
import type { WeekInfo } from "@/utils/weekNumber";
import {
  getWeekInfoByKey,
  getNextWeekKey,
  getPreviousWeekKey,
} from "@/utils/weekNumber";
import {
  addIdsToShoppingItems,
  type ShoppingTripWithIds,
} from "@/utils/shoppingItemId";

// Processed plan with IDs added to shopping items
export interface ProcessedPlan {
  weekKey: string;
  createdAt: string;
  inputState: AppState;
  result: {
    weekPlan: DayPlan[];
    shoppingTrips: ShoppingTripWithIds[];
  };
}

interface PlansState {
  availableWeeks: PlanListItem[];
  currentWeekKey: string | null;
  rawPlan: PersistedPlan | null;
  checkedIds: Set<string>;
  weekInfo: WeekInfo | null;
  loading: boolean;
  error: string | null;
}

interface UsePlansReturn {
  availableWeeks: PlanListItem[];
  currentWeekKey: string | null;
  plan: ProcessedPlan | null;
  checkedIds: Set<string>;
  weekInfo: WeekInfo | null;
  loading: boolean;
  error: string | null;
  goToWeek: (weekKey: string) => void;
  goNext: () => void;
  goPrev: () => void;
  toggleChecked: (itemId: string) => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export function usePlans(initialWeeks: PlanListItem[] = []): UsePlansReturn {
  const [state, setState] = useState<PlansState>({
    availableWeeks: initialWeeks,
    currentWeekKey: initialWeeks[0]?.weekKey ?? null,
    rawPlan: null,
    checkedIds: new Set(),
    weekInfo: initialWeeks[0]
      ? getWeekInfoByKey(initialWeeks[0].weekKey)
      : null,
    loading: initialWeeks.length > 0,
    error: null,
  });

  // Fetch plan when currentWeekKey changes
  useEffect(() => {
    if (!state.currentWeekKey) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    const fetchPlan = async () => {
      setState((s) => ({ ...s, loading: true, error: null }));

      try {
        // Fetch plan and checked items in parallel
        const [planRes, checkedRes] = await Promise.all([
          fetch(`/api/plans/${state.currentWeekKey}`),
          fetch(`/api/plans/${state.currentWeekKey}/checked`),
        ]);

        if (!planRes.ok) {
          if (planRes.status === 404) {
            setState((s) => ({ ...s, rawPlan: null, loading: false }));
            return;
          }
          throw new Error("Failed to fetch plan");
        }

        const planData = await planRes.json();
        const checkedData = checkedRes.ok ? await checkedRes.json() : { checkedIds: [] };

        setState((s) => ({
          ...s,
          rawPlan: planData.plan,
          checkedIds: new Set(checkedData.checkedIds || []),
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching plan:", error);
        setState((s) => ({
          ...s,
          error: error instanceof Error ? error.message : "Unknown error",
          loading: false,
        }));
      }
    };

    fetchPlan();
  }, [state.currentWeekKey]);

  const goToWeek = useCallback((weekKey: string) => {
    setState((s) => ({
      ...s,
      currentWeekKey: weekKey,
      weekInfo: getWeekInfoByKey(weekKey),
    }));
  }, []);

  const goNext = useCallback(() => {
    if (!state.currentWeekKey) return;

    const nextKey = getNextWeekKey(state.currentWeekKey);
    const hasNextPlan = state.availableWeeks.some((w) => w.weekKey === nextKey);

    if (hasNextPlan) {
      goToWeek(nextKey);
    }
  }, [state.currentWeekKey, state.availableWeeks, goToWeek]);

  const goPrev = useCallback(() => {
    if (!state.currentWeekKey) return;

    const prevKey = getPreviousWeekKey(state.currentWeekKey);
    const hasPrevPlan = state.availableWeeks.some((w) => w.weekKey === prevKey);

    if (hasPrevPlan) {
      goToWeek(prevKey);
    }
  }, [state.currentWeekKey, state.availableWeeks, goToWeek]);

  const toggleChecked = useCallback(
    async (itemId: string) => {
      if (!state.currentWeekKey) return;

      // Optimistic update
      setState((s) => {
        const newChecked = new Set(s.checkedIds);
        if (newChecked.has(itemId)) {
          newChecked.delete(itemId);
        } else {
          newChecked.add(itemId);
        }
        return { ...s, checkedIds: newChecked };
      });

      // Persist to server
      try {
        const newChecked = new Set(state.checkedIds);
        if (newChecked.has(itemId)) {
          newChecked.delete(itemId);
        } else {
          newChecked.add(itemId);
        }

        await fetch(`/api/plans/${state.currentWeekKey}/checked`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkedIds: Array.from(newChecked) }),
        });
      } catch (error) {
        console.error("Failed to persist checked state:", error);
        // Could revert optimistic update here, but for now we keep it
      }
    },
    [state.currentWeekKey, state.checkedIds]
  );

  // Compute navigation availability
  const hasPrev = state.currentWeekKey
    ? state.availableWeeks.some(
        (w) => w.weekKey === getPreviousWeekKey(state.currentWeekKey!)
      )
    : false;

  const hasNext = state.currentWeekKey
    ? state.availableWeeks.some(
        (w) => w.weekKey === getNextWeekKey(state.currentWeekKey!)
      )
    : false;

  // Process shopping trips to add IDs
  const processedPlan: ProcessedPlan | null = state.rawPlan
    ? {
        ...state.rawPlan,
        result: {
          ...state.rawPlan.result,
          shoppingTrips: addIdsToShoppingItems(
            state.rawPlan.result.shoppingTrips
          ),
        },
      }
    : null;

  return {
    availableWeeks: state.availableWeeks,
    currentWeekKey: state.currentWeekKey,
    plan: processedPlan,
    checkedIds: state.checkedIds,
    weekInfo: state.weekInfo,
    loading: state.loading,
    error: state.error,
    goToWeek,
    goNext,
    goPrev,
    toggleChecked,
    hasPrev,
    hasNext,
  };
}
