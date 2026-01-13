import { describe, it, expect } from "vitest";
import { generateShoppingItemId, addIdsToShoppingItems } from "./shoppingItemId";
import type { ShoppingItem, ShoppingTrip } from "@/schemas/mealPlanResponse";

describe("generateShoppingItemId", () => {
  it("generates deterministic IDs with item- prefix", () => {
    const item: ShoppingItem = {
      name: "Milk",
      amount: "1 liter",
      category: "dairy",
    };

    const id1 = generateShoppingItemId(item, 0);
    const id2 = generateShoppingItemId(item, 0);

    expect(id1).toBe(id2);
    expect(id1).toMatch(/^item-[a-z0-9]+$/);
  });

  it("generates different IDs for different items or trip indices", () => {
    const milk: ShoppingItem = { name: "Milk", amount: "1 liter", category: "dairy" };
    const bread: ShoppingItem = { name: "Bread", amount: "1 loaf", category: "bakery" };

    expect(generateShoppingItemId(milk, 0)).not.toBe(generateShoppingItemId(bread, 0));
    expect(generateShoppingItemId(milk, 0)).not.toBe(generateShoppingItemId(milk, 1));
  });

  it("normalizes name and amount (case insensitive, trimmed)", () => {
    const variants: ShoppingItem[] = [
      { name: "MILK", amount: "1 LITER", category: "dairy" },
      { name: "milk", amount: "1 liter", category: "dairy" },
      { name: "  Milk  ", amount: "  1 liter  ", category: "dairy" },
    ];

    const ids = variants.map((item) => generateShoppingItemId(item, 0));
    expect(new Set(ids).size).toBe(1);
  });
});

describe("addIdsToShoppingItems", () => {
  it("adds IDs to all items preserving original properties", () => {
    const trips: ShoppingTrip[] = [
      {
        label: "Trip 1 (Mon-Thu)",
        items: [
          { name: "Milk", amount: "1 liter", category: "dairy" },
          { name: "Chicken", amount: "500g", category: "meat", forMeal: "Roast" },
        ],
      },
      {
        label: "Trip 2",
        items: [{ name: "Eggs", amount: "12 pcs", category: "dairy" }],
      },
    ];

    const result = addIdsToShoppingItems(trips);

    expect(result).toHaveLength(2);
    expect(result[0].label).toBe("Trip 1 (Mon-Thu)");
    expect(result[0].items[1].forMeal).toBe("Roast");

    result.forEach((trip) => {
      trip.items.forEach((item) => {
        expect(item.id).toMatch(/^item-[a-z0-9]+$/);
      });
    });
  });

  it("handles empty arrays", () => {
    expect(addIdsToShoppingItems([])).toEqual([]);
    expect(addIdsToShoppingItems([{ label: "Empty", items: [] }])[0].items).toEqual([]);
  });
});
