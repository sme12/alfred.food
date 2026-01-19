import { getAuthUserId } from "@/lib/auth";
import { redis, PLAN_INDEX_KEY } from "@/lib/redis";
import type { PlanListItem } from "@/schemas/persistedPlan";
import { getWeekInfoByKey } from "@/utils/weekNumber";
import { HomeClient } from "@/components/HomeClient";

async function getPlans(): Promise<PlanListItem[]> {
  try {
    // Use shared plan index (not per-user)
    const planKeys = await redis.zrange<string[]>(PLAN_INDEX_KEY, 0, -1, { rev: true });

    if (!planKeys || planKeys.length === 0) {
      return [];
    }

    return planKeys.map((weekKey) => {
      const info = getWeekInfoByKey(weekKey);
      return {
        weekKey,
        createdAt: "",
        weekNumber: info.weekNumber,
        year: info.year,
        dateRange: info.dateRange,
      };
    });
  } catch (error) {
    console.error("Failed to fetch plans:", error);
    return [];
  }
}

export default async function Home() {
  const userId = await getAuthUserId();

  // If not authenticated, show empty state (will redirect via middleware)
  if (!userId) {
    return <HomeClient initialWeeks={[]} />;
  }

  const plans = await getPlans();

  return <HomeClient initialWeeks={plans} />;
}
