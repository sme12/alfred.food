import { NextResponse } from "next/server";
import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { getAuthUserId } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { AppStateSchema } from "@/schemas/appState";
import {
  DayPlanSchema,
  ShoppingListResponseSchema,
} from "@/schemas/mealPlanResponse";
import { buildShoppingListPrompt } from "@/utils/promptBuilder";

// Request body schema
const RequestBodySchema = z.object({
  weekPlan: z.array(DayPlanSchema),
  appState: AppStateSchema,
});

// Rate limit: 10 requests per minute
const RATE_LIMIT = 10;
const RATE_WINDOW_SEC = 60;

export async function POST(request: Request) {
  try {
    // Auth check
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit check
    const rateLimitResult = await checkRateLimit(
      `shopping-list:${userId}`,
      RATE_LIMIT,
      RATE_WINDOW_SEC
    );

    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000
      );
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfter },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const parseResult = RequestBodySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { weekPlan, appState } = parseResult.data;

    // Build prompt
    const prompt = buildShoppingListPrompt(weekPlan, appState);

    // Get model from env (defaults to sonnet)
    const modelId =
      process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";

    // Generate shopping list using AI SDK
    const { output } = await generateText({
      model: anthropic(modelId),
      output: Output.object({ schema: ShoppingListResponseSchema }),
      prompt,
    });

    return NextResponse.json(output);
  } catch (error) {
    console.error("Shopping list generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate shopping list" },
      { status: 500 }
    );
  }
}
