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
 * Generates a deterministic ID for a shopping item based on its properties.
 * Identical items will get the same ID even across different generations.
 */
export function generateShoppingItemId(
  item: ShoppingItem,
  tripIndex: number
): string {
  // Normalize strings: lowercase + trim
  const normalized = [
    item.category,
    item.name.toLowerCase().trim(),
    item.amount.toLowerCase().trim(),
    String(tripIndex),
  ].join("|");

  // Simple hash for shorter IDs
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return `item-${Math.abs(hash).toString(36)}`;
}

/**
 * Adds stable IDs to all items in shopping trips.
 * Called when receiving Claude's response before saving.
 */
export function addIdsToShoppingItems(
  trips: ShoppingTrip[]
): ShoppingTripWithIds[] {
  return trips.map((trip, tripIndex) => ({
    ...trip,
    items: trip.items.map((item) => ({
      ...item,
      id: generateShoppingItemId(item, tripIndex),
    })),
  }));
}
