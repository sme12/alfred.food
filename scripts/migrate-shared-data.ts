/**
 * Migration script: Convert per-user data to shared data
 *
 * Old key patterns (with userId):
 * - meal-planner:plan:{userId}:{weekKey}
 * - meal-planner:plan-index:{userId}
 * - meal-planner:checked:{userId}:{weekKey}
 *
 * New key patterns (shared):
 * - meal-planner:plan:{weekKey}
 * - meal-planner:plan-index
 * - meal-planner:checked:{weekKey}
 *
 * Run: npx tsx --env-file=.env.production.local scripts/migrate-shared-data.ts
 */

import { Redis } from "@upstash/redis";

const KV_PREFIX = "meal-planner";
const PLAN_INDEX_KEY = `${KV_PREFIX}:plan-index`;

async function migrate() {
  // Support both Vercel KV naming (KV_*) and Upstash naming (UPSTASH_*)
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error(
      "Missing Redis credentials. Set KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN",
    );
  }

  const redis = new Redis({ url, token });

  console.log("Starting migration...\n");

  // 1. Migrate plans: meal-planner:plan:{userId}:{weekKey} → meal-planner:plan:{weekKey}
  console.log("=== Migrating plans ===");
  const planKeys = await redis.keys(`${KV_PREFIX}:plan:*:*`);

  for (const oldKey of planKeys) {
    // Parse old key: meal-planner:plan:{userId}:{weekKey}
    const parts = oldKey.split(":");
    if (parts.length !== 4) {
      console.log(`Skipping invalid key: ${oldKey}`);
      continue;
    }

    const weekKey = parts[3];
    const newKey = `${KV_PREFIX}:plan:${weekKey}`;

    // Check if new key already exists
    const existingData = await redis.get(newKey);
    if (existingData) {
      console.log(`Skip (exists): ${oldKey} → ${newKey}`);
      continue;
    }

    // Copy data to new key
    const data = await redis.get(oldKey);
    if (data) {
      await redis.set(newKey, data);
      console.log(`Migrated: ${oldKey} → ${newKey}`);
    }
  }

  // 2. Migrate plan indices: meal-planner:plan-index:{userId} → meal-planner:plan-index
  console.log("\n=== Migrating plan indices ===");
  const indexKeys = await redis.keys(`${PLAN_INDEX_KEY}:*`);

  for (const oldIndexKey of indexKeys) {
    // Get all weekKeys from user's index
    const weekKeys = await redis.zrange<string[]>(oldIndexKey, 0, -1, {
      rev: true,
    });

    for (const weekKey of weekKeys) {
      // Get the score (timestamp) for this weekKey
      const score = await redis.zscore(oldIndexKey, weekKey);
      if (score !== null) {
        // Add to shared index (NX = only if not exists)
        await redis.zadd(
          PLAN_INDEX_KEY,
          { nx: true },
          { score, member: weekKey },
        );
        console.log(`Added to shared index: ${weekKey} (score: ${score})`);
      }
    }
  }

  // 3. Migrate checked items: meal-planner:checked:{userId}:{weekKey} → meal-planner:checked:{weekKey}
  console.log("\n=== Migrating checked items ===");
  const checkedKeys = await redis.keys(`${KV_PREFIX}:checked:*:*`);

  for (const oldKey of checkedKeys) {
    // Parse old key: meal-planner:checked:{userId}:{weekKey}
    const parts = oldKey.split(":");
    if (parts.length !== 4) {
      console.log(`Skipping invalid key: ${oldKey}`);
      continue;
    }

    const weekKey = parts[3];
    const newKey = `${KV_PREFIX}:checked:${weekKey}`;

    // Check if new key already exists
    const existingData = await redis.get(newKey);
    if (existingData) {
      console.log(`Skip (exists): ${oldKey} → ${newKey}`);
      continue;
    }

    // Copy data to new key
    const data = await redis.get(oldKey);
    if (data) {
      await redis.set(newKey, data);
      console.log(`Migrated: ${oldKey} → ${newKey}`);
    }
  }

  console.log("\n=== Migration complete ===");
  console.log("Old keys preserved for rollback. Delete manually when ready.");
}

migrate().catch(console.error);
