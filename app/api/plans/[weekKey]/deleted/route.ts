import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { redis, KV_PREFIX } from "@/lib/redis";
import { z } from "zod";

const UpdateDeletedSchema = z.object({
  deletedIds: z.array(z.string()),
});

// GET /api/plans/[weekKey]/deleted — Get deleted item IDs
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ weekKey: string }> },
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const deletedKey = `${KV_PREFIX}:deleted:${weekKey}`;

  try {
    const data = await redis.get<string[]>(deletedKey);
    const deletedIds = data ?? [];
    return NextResponse.json({ deletedIds });
  } catch (error) {
    console.error("Failed to fetch deleted items:", error);
    return NextResponse.json(
      { error: "Failed to fetch deleted items" },
      { status: 500 },
    );
  }
}

// PUT /api/plans/[weekKey]/deleted — Update deleted item IDs
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ weekKey: string }> },
) {
  const userId = await getAuthUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { weekKey } = await params;
  const deletedKey = `${KV_PREFIX}:deleted:${weekKey}`;

  try {
    const body = await request.json();
    const parsed = UpdateDeletedSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    await redis.set(deletedKey, parsed.data.deletedIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update deleted items:", error);
    return NextResponse.json(
      { error: "Failed to update deleted items" },
      { status: 500 },
    );
  }
}
