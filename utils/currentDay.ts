import type { Day } from "@/schemas/appState";

/**
 * Maps JavaScript Date.getDay() (0=Sun, 1=Mon, ..., 6=Sat) to Day type
 */
const JS_DAY_TO_DAY: Day[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * Get current day of the week as Day type based on browser time
 */
export function getCurrentDay(): Day {
  return JS_DAY_TO_DAY[new Date().getDay()];
}
