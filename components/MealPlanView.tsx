"use client";

import { useTranslations } from "next-intl";
import type { DayPlan, MealItem } from "@/schemas/mealPlanResponse";
import { DAYS_ORDER } from "@/config/defaults";
import type { Day, Meal } from "@/schemas/appState";

interface MealPlanViewProps {
  weekPlan: DayPlan[];
}

const MEALS: Meal[] = ["breakfast", "lunch", "dinner"];

function MealCell({ meal }: { meal: MealItem | null }) {
  const t = useTranslations("result");

  if (!meal) {
    return (
      <div className="h-full flex items-center justify-center text-muted text-sm">
        —
      </div>
    );
  }

  return (
    <div className="p-2">
      <div className="font-medium text-sm leading-tight">{meal.name}</div>
      <div className="text-xs text-muted mt-1">
        {t("minutes", { time: meal.time })}
      </div>
    </div>
  );
}

export function MealPlanView({ weekPlan }: MealPlanViewProps) {
  const t = useTranslations();

  // Create a map for quick lookup by day
  const planByDay = new Map<Day, DayPlan>();
  for (const dayPlan of weekPlan) {
    planByDay.set(dayPlan.day, dayPlan);
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse min-w-[320px]">
        <thead>
          <tr>
            <th className="p-2 text-left text-sm font-medium text-muted w-12" />
            {MEALS.map((meal) => (
              <th
                key={meal}
                className="p-2 text-center text-sm font-medium text-muted"
              >
                {t(`calendar.meals.${meal}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS_ORDER.map((day) => {
            const dayPlan = planByDay.get(day);
            return (
              <tr key={day} className="border-t border-border">
                <td className="p-2 text-sm font-medium">
                  {t(`calendar.days.${day}`)}
                </td>
                {MEALS.map((meal) => (
                  <td
                    key={meal}
                    className="p-1 border-l border-border min-h-[64px] align-top"
                  >
                    <MealCell meal={dayPlan?.[meal] ?? null} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
