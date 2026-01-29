import type {
  ShoppingItem,
  ShoppingItemWithId,
  ShoppingTrip,
} from "@/schemas/mealPlanResponse";

/**
 * Shopping trip with IDs added to items
 */
export interface ShoppingTripWithIds extends Omit<ShoppingTrip, "items"> {
  items: ShoppingItemWithId[];
}

/**
 * Simple string hash function.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Generates a content-based key for deduplication.
 * Does NOT include position - only content that matters for identity.
 */
function getItemContentKey(item: ShoppingItem, tripIndex: number): string {
  return [
    item.category,
    item.name.toLowerCase().trim(),
    item.amount.toLowerCase().trim(),
    String(tripIndex),
  ].join("|");
}

/**
 * Adds stable IDs to all items in shopping trips.
 * IDs are based on content only. Duplicate items get a suffix (-2, -3, etc).
 * This preserves checked state across regenerations even if item order changes.
 */
export function addIdsToShoppingItems(
  trips: ShoppingTrip[]
): ShoppingTripWithIds[] {
  const seenKeys = new Map<string, number>();

  return trips.map((trip, tripIndex) => ({
    ...trip,
    items: trip.items.map((item) => {
      const contentKey = getItemContentKey(item, tripIndex);
      const baseId = `item-${hashString(contentKey).toString(36)}`;

      // Track occurrences for duplicate handling
      const count = seenKeys.get(contentKey) ?? 0;
      seenKeys.set(contentKey, count + 1);

      // First occurrence: no suffix. Duplicates: -2, -3, etc.
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;

      return { ...item, id };
    }),
  }));
}
