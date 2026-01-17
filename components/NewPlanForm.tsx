"use client";

import { useSchedule } from "@/hooks/useSchedule";
import { WeekCalendar } from "./WeekCalendar";
import { CuisineSelector } from "./CuisineSelector";
import { SpecialConditions } from "./SpecialConditions";
import { GenerateSection } from "./GenerateSection";

export function NewPlanForm() {
  const {
    schedules,
    selectedCuisines,
    specialConditions,
    toggleSlot,
    toggleCuisine,
    setSpecialConditions,
    getAppState,
    isValid,
  } = useSchedule();

  return (
    <div className="space-y-8">
      <WeekCalendar schedules={schedules} onToggle={toggleSlot} />
      <CuisineSelector selected={selectedCuisines} onToggle={toggleCuisine} />
      <SpecialConditions
        value={specialConditions}
        onChange={setSpecialConditions}
      />
      <GenerateSection appState={getAppState()} isFormValid={isValid} />
    </div>
  );
}
