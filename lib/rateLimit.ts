import { redis, KV_PREFIX } from "./redis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number; // unix timestamp in ms
}

/**
 * Check rate limit for a given identifier using sliding window counter.
 * @param identifier - Unique identifier (e.g., "meal-plan:user123")
 * @param limit - Maximum requests allowed in the window
 * @param windowSec - Window duration in seconds
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSec: number
): Promise<RateLimitResult> {
  const key = `${KV_PREFIX}:ratelimit:${identifier}`;

  // Increment counter
  const current = await redis.incr(key);

  // Set expiry on first request
  if (current === 1) {
    await redis.expire(key, windowSec);
  }

  // Get TTL for reset time
  const ttl = await redis.ttl(key);
  const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowSec * 1000);

  return {
    allowed: current <= limit,
    remaining: Math.max(0, limit - current),
    resetAt,
  };
}
