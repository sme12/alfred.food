"use client";

import { useState, useCallback } from "react";
import type { AppState } from "@/schemas/appState";
import type { DayPlan, ShoppingTrip } from "@/schemas/mealPlanResponse";

export type GenerationStage =
  | "idle" // Initial, form ready
  | "generating-plan" // Loading meal plan
  | "plan-ready" // Plan received, awaiting user confirm
  | "generating-shopping" // Loading shopping list
  | "complete"; // Both ready

interface GenerationState {
  stage: GenerationStage;
  weekPlan: DayPlan[] | null;
  shoppingTrips: ShoppingTrip[] | null;
  error: string | null;
}

interface UseMealPlanGenerationReturn {
  stage: GenerationStage;
  weekPlan: DayPlan[] | null;
  shoppingTrips: ShoppingTrip[] | null;
  error: string | null;

  generatePlan: (appState: AppState) => Promise<void>;
  confirmPlan: (appState: AppState) => Promise<void>;
  regeneratePlan: (appState: AppState) => Promise<void>;
  reset: () => void;
  resetToPlanStage: () => void;
}

const initialState: GenerationState = {
  stage: "idle",
  weekPlan: null,
  shoppingTrips: null,
  error: null,
};

export function useMealPlanGeneration(): UseMealPlanGenerationReturn {
  const [state, setState] = useState<GenerationState>(initialState);

  const generatePlan = useCallback(async (appState: AppState) => {
    setState((s) => ({ ...s, stage: "generating-plan", error: null }));

    try {
      const res = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appState }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const { weekPlan } = await res.json();
      setState({
        stage: "plan-ready",
        weekPlan,
        shoppingTrips: null,
        error: null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setState((s) => ({ ...s, stage: "idle", error: message }));
    }
  }, []);

  const confirmPlan = useCallback(
    async (appState: AppState) => {
      if (!state.weekPlan) return;

      setState((s) => ({ ...s, stage: "generating-shopping", error: null }));

      try {
        const res = await fetch("/api/generate-shopping-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ weekPlan: state.weekPlan, appState }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Shopping list generation failed");
        }

        const { shoppingTrips } = await res.json();
        setState((s) => ({ ...s, stage: "complete", shoppingTrips }));
      } catch (e) {
        const message = e instanceof Error ? e.message : "Unknown error";
        setState((s) => ({ ...s, stage: "plan-ready", error: message }));
      }
    },
    [state.weekPlan]
  );

  const regeneratePlan = useCallback(async (appState: AppState) => {
    // Same as generatePlan but preserves the flow
    setState((s) => ({
      ...s,
      stage: "generating-plan",
      shoppingTrips: null,
      error: null,
    }));

    try {
      const res = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appState }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Regeneration failed");
      }

      const { weekPlan } = await res.json();
      setState({
        stage: "plan-ready",
        weekPlan,
        shoppingTrips: null,
        error: null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setState((s) => ({ ...s, stage: "plan-ready", error: message }));
    }
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const resetToPlanStage = useCallback(() => {
    setState((s) => ({
      ...s,
      stage: "plan-ready",
      shoppingTrips: null,
      error: null,
    }));
  }, []);

  return {
    stage: state.stage,
    weekPlan: state.weekPlan,
    shoppingTrips: state.shoppingTrips,
    error: state.error,
    generatePlan,
    confirmPlan,
    regeneratePlan,
    reset,
    resetToPlanStage,
  };
}
