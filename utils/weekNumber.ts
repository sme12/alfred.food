import {
  getISOWeek,
  getISOWeekYear,
  startOfISOWeek,
  endOfISOWeek,
  format,
  parseISO,
  isSameMonth,
} from "date-fns";
import { ru } from "date-fns/locale";

export interface WeekInfo {
  weekNumber: number;
  year: number;
  weekKey: string; // "2026-02"
  weekStart: string; // ISO date "2026-01-06"
  weekEnd: string; // ISO date "2026-01-12"
  dateRange: string; // "6-12 янв" or "Dec 30 - Jan 5"
}

/**
 * Get ISO week plan key in format "YYYY-WW"
 * Example: getPlanKey(2026, 2) => "2026-02"
 */
export function getPlanKey(year: number, weekNumber: number): string {
  return `${year}-${String(weekNumber).padStart(2, "0")}`;
}

/**
 * Parse plan key back to year and week number
 * Example: parsePlanKey("2026-02") => { year: 2026, weekNumber: 2 }
 */
export function parsePlanKey(weekKey: string): {
  year: number;
  weekNumber: number;
} {
  const [yearStr, weekStr] = weekKey.split("-");
  return {
    year: parseInt(yearStr, 10),
    weekNumber: parseInt(weekStr, 10),
  };
}

/**
 * Format week date range for display
 * - If same month: "6-12 янв"
 * - If spans months: "30 дек - 5 янв"
 */
export function formatWeekRange(
  weekStart: string,
  weekEnd: string,
  locale: "ru" | "en" = "ru"
): string {
  const start = parseISO(weekStart);
  const end = parseISO(weekEnd);
  const dateLocale = locale === "ru" ? ru : undefined;

  if (isSameMonth(start, end)) {
    // Same month: "6-12 янв"
    const startDay = format(start, "d");
    const endDay = format(end, "d");
    const month = format(end, "MMM", { locale: dateLocale });
    return `${startDay}-${endDay} ${month}`;
  } else {
    // Different months: "30 дек - 5 янв"
    const startFormatted = format(start, "d MMM", { locale: dateLocale });
    const endFormatted = format(end, "d MMM", { locale: dateLocale });
    return `${startFormatted} - ${endFormatted}`;
  }
}

/**
 * Get current week information
 */
export function getCurrentWeekInfo(): WeekInfo {
  const now = new Date();
  return getWeekInfoForDate(now);
}

/**
 * Get week information for a specific date
 */
export function getWeekInfoForDate(date: Date): WeekInfo {
  const weekNumber = getISOWeek(date);
  const year = getISOWeekYear(date);
  const weekStart = startOfISOWeek(date);
  const weekEnd = endOfISOWeek(date);

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");

  return {
    weekNumber,
    year,
    weekKey: getPlanKey(year, weekNumber),
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    dateRange: formatWeekRange(weekStartStr, weekEndStr),
  };
}

/**
 * Get week information by week key
 * Example: getWeekInfoByKey("2026-02")
 */
export function getWeekInfoByKey(weekKey: string): WeekInfo {
  const { year, weekNumber } = parsePlanKey(weekKey);

  // Create a date in the middle of the desired week
  // ISO week 1 of a year contains January 4th
  // So we start from January 4th and add weeks
  const jan4 = new Date(year, 0, 4);
  const jan4Week = getISOWeek(jan4);

  // Calculate the target date
  const weeksToAdd = weekNumber - jan4Week;
  const targetDate = new Date(jan4);
  targetDate.setDate(jan4.getDate() + weeksToAdd * 7);

  return getWeekInfoForDate(targetDate);
}

/**
 * Get next week's key
 */
export function getNextWeekKey(currentKey: string): string {
  const info = getWeekInfoByKey(currentKey);
  const currentEnd = parseISO(info.weekEnd);
  const nextWeekDate = new Date(currentEnd);
  nextWeekDate.setDate(currentEnd.getDate() + 1);
  const nextInfo = getWeekInfoForDate(nextWeekDate);
  return nextInfo.weekKey;
}

/**
 * Get previous week's key
 */
export function getPreviousWeekKey(currentKey: string): string {
  const info = getWeekInfoByKey(currentKey);
  const currentStart = parseISO(info.weekStart);
  const prevWeekDate = new Date(currentStart);
  prevWeekDate.setDate(currentStart.getDate() - 1);
  const prevInfo = getWeekInfoForDate(prevWeekDate);
  return prevInfo.weekKey;
}
