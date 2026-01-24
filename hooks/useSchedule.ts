"use client";

import { useCallback, useMemo } from "react";
import type { AppState, CuisineId, Day, Meal, PersonWeekSchedule } from "@/schemas/appState";
import type { PersonId } from "@/config/defaults";
import type { WeekOption } from "@/components/WeekSelector";
import {
  getCurrentWeekInfo,
  getNextWeekKey,
  getPlanKey,
  getWeekInfoByKey,
} from "@/utils/weekNumber";
import { useScheduleStore } from "@/stores/useScheduleStore";

interface UseScheduleReturn {
  schedules: {
    vitalik: PersonWeekSchedule;
    lena: PersonWeekSchedule;
  };
  selectedCuisines: CuisineId[];
  specialConditions: string;
  weekOption: WeekOption;
  customWeekNumber: number | null;
  currentWeekNumber: number;
  nextWeekNumber: number;

  toggleSlot: (person: PersonId, day: Day, meal: Meal) => void;
  toggleCuisine: (cuisineId: CuisineId) => void;
  setSpecialConditions: (value: string) => void;
  setWeekOption: (option: WeekOption) => void;
  setCustomWeekNumber: (num: number | null) => void;

  getAppState: () => AppState;
  getSelectedWeekKey: () => string;
  isValid: boolean;
  hasHydrated: boolean;
}

export function useSchedule(): UseScheduleReturn {
  const schedules = useScheduleStore((state) => state.schedules);
  const selectedCuisines = useScheduleStore((state) => state.selectedCuisines);
  const specialConditions = useScheduleStore((state) => state.specialConditions);
  const weekOption = useScheduleStore((state) => state.weekOption);
  const customWeekNumber = useScheduleStore((state) => state.customWeekNumber);
  const hasHydrated = useScheduleStore((state) => state._hasHydrated);

  const toggleSlot = useScheduleStore((state) => state.toggleSlot);
  const toggleCuisine = useScheduleStore((state) => state.toggleCuisine);
  const setSpecialConditions = useScheduleStore((state) => state.setSpecialConditions);
  const setWeekOption = useScheduleStore((state) => state.setWeekOption);
  const setCustomWeekNumber = useScheduleStore((state) => state.setCustomWeekNumber);

  const currentWeekInfo = useMemo(() => getCurrentWeekInfo(), []);
  const currentWeekNumber = currentWeekInfo.weekNumber;
  const nextWeekKey = useMemo(() => getNextWeekKey(currentWeekInfo.weekKey), [currentWeekInfo.weekKey]);
  const nextWeekNumber = useMemo(() => getWeekInfoByKey(nextWeekKey).weekNumber, [nextWeekKey]);

  const getAppState = useCallback((): AppState => {
    return {
      schedules,
      selectedCuisines,
      specialConditions,
    };
  }, [schedules, selectedCuisines, specialConditions]);

  const getSelectedWeekKey = useCallback((): string => {
    if (weekOption === "current") return currentWeekInfo.weekKey;
    if (weekOption === "next") return nextWeekKey;
    // custom: build key from year + customWeekNumber
    return getPlanKey(currentWeekInfo.year, customWeekNumber!);
  }, [weekOption, customWeekNumber, currentWeekInfo.weekKey, currentWeekInfo.year, nextWeekKey]);

  // Valid if at least one cuisine is selected and week is valid
  const isValid =
    selectedCuisines.length > 0 &&
    (weekOption !== "custom" || customWeekNumber !== null);

  return {
    schedules,
    selectedCuisines,
    specialConditions,
    weekOption,
    customWeekNumber,
    currentWeekNumber,
    nextWeekNumber,
    toggleSlot,
    toggleCuisine,
    setSpecialConditions,
    setWeekOption,
    setCustomWeekNumber,
    getAppState,
    getSelectedWeekKey,
    isValid,
    hasHydrated,
  };
}
