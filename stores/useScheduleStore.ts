"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { z } from "zod";
import {
  CuisineIdSchema,
  PersonWeekScheduleSchema,
  type CuisineId,
  type Day,
  type Meal,
  type MealSlotStatus,
  type PersonWeekSchedule,
} from "@/schemas/appState";
import {
  createDefaultWeekSchedule,
  DEFAULT_SELECTED_CUISINES,
  STATUS_CYCLE,
} from "@/config/defaults";
import type { PersonId } from "@/config/defaults";
import type { WeekOption } from "@/components/WeekSelector";

interface ScheduleState {
  _hasHydrated: boolean;
  schedules: {
    vitalik: PersonWeekSchedule;
    lena: PersonWeekSchedule;
  };
  selectedCuisines: CuisineId[];
  specialConditions: string;
  weekOption: WeekOption;
  customWeekNumber: number | null;
}

interface ScheduleActions {
  setHasHydrated: (hydrated: boolean) => void;
  toggleSlot: (person: PersonId, day: Day, meal: Meal) => void;
  toggleCuisine: (cuisineId: CuisineId) => void;
  setSpecialConditions: (value: string) => void;
  setWeekOption: (option: WeekOption) => void;
  setCustomWeekNumber: (num: number | null) => void;
  reset: () => void;
}

type ScheduleStore = ScheduleState & ScheduleActions;

const initialState: Omit<ScheduleState, "_hasHydrated"> = {
  schedules: {
    vitalik: createDefaultWeekSchedule(),
    lena: createDefaultWeekSchedule(),
  },
  selectedCuisines: [...DEFAULT_SELECTED_CUISINES],
  specialConditions: "",
  weekOption: "current",
  customWeekNumber: null,
};

export const useScheduleStore = create<ScheduleStore>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      ...initialState,

      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),

      toggleSlot: (person, day, meal) =>
        set((state) => {
          const currentStatus = state.schedules[person][day][meal];
          const currentIndex = STATUS_CYCLE.indexOf(currentStatus);
          const nextStatus = STATUS_CYCLE[
            (currentIndex + 1) % STATUS_CYCLE.length
          ] as MealSlotStatus;

          return {
            schedules: {
              ...state.schedules,
              [person]: {
                ...state.schedules[person],
                [day]: {
                  ...state.schedules[person][day],
                  [meal]: nextStatus,
                },
              },
            },
          };
        }),

      toggleCuisine: (cuisineId) =>
        set((state) => {
          if (state.selectedCuisines.includes(cuisineId)) {
            return {
              selectedCuisines: state.selectedCuisines.filter(
                (c) => c !== cuisineId
              ),
            };
          }
          return {
            selectedCuisines: [...state.selectedCuisines, cuisineId],
          };
        }),

      setSpecialConditions: (value) => set({ specialConditions: value }),

      setWeekOption: (option) => set({ weekOption: option }),

      setCustomWeekNumber: (num) => set({ customWeekNumber: num }),

      reset: () => set(initialState),
    }),
    {
      name: "schedule-form",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        schedules: state.schedules,
        selectedCuisines: state.selectedCuisines,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state || error) {
          state?.reset();
          state?.setHasHydrated(true);
          return;
        }

        const PersistedDataSchema = z.object({
          schedules: z.object({
            vitalik: PersonWeekScheduleSchema,
            lena: PersonWeekScheduleSchema,
          }),
          selectedCuisines: z.array(CuisineIdSchema),
        });

        const result = PersistedDataSchema.safeParse({
          schedules: state.schedules,
          selectedCuisines: state.selectedCuisines,
        });

        if (!result.success) {
          state.reset();
        }

        state.setHasHydrated(true);
      },
    }
  )
);
