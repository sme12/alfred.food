import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getRedis, KV_PREFIX } from "@/lib/redis";
import { parsePersistedPlan } from "@/schemas/persistedPlan";

// GET /api/plans/[weekKey] — Get a specific plan
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> }
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const planKey = `${KV_PREFIX}:plan:${userId}:${weekKey}`;

  try {
    const redis = await getRedis();
    const data = await redis.get(planKey);

    if (!data) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Redis returns string, parse as JSON
    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    const plan = parsePersistedPlan(parsed);

    if (!plan) {
      console.error("Invalid plan data in Redis for key:", planKey);
      return NextResponse.json({ error: "Invalid plan data" }, { status: 500 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Failed to fetch plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 }
    );
  }
}
