import { createClient } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export async function getRedis() {
  if (!globalForRedis.redis) {
    globalForRedis.redis = createClient({ url: process.env.KV_REDIS_URL });
    await globalForRedis.redis.connect();
  }
  return globalForRedis.redis;
}

export const KV_PREFIX = "meal-planner";
export const PLAN_INDEX_KEY = `${KV_PREFIX}:plan-index`;
