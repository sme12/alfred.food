import { describe, it, expect } from "vitest";
import { addIdsToShoppingItems } from "./shoppingItemId";
import type { ShoppingTrip } from "@/schemas/mealPlanResponse";

describe("addIdsToShoppingItems", () => {
  it("adds IDs to all items preserving original properties", () => {
    const trips: ShoppingTrip[] = [
      {
        label: "Trip 1 (Mon-Thu)",
        items: [
          { name: "Milk", amount: "1 liter", category: "dairy" },
          {
            name: "Chicken",
            amount: "500g",
            category: "meat",
            forMeal: "Roast",
          },
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
        expect(item.id).toMatch(/^item-[a-z0-9]+(-\d+)?$/);
      });
    });
  });

  it("handles empty arrays", () => {
    expect(addIdsToShoppingItems([])).toEqual([]);
    expect(
      addIdsToShoppingItems([{ label: "Empty", items: [] }])[0].items,
    ).toEqual([]);
  });

  it("generates same ID regardless of item position (order-independent)", () => {
    const tripsA: ShoppingTrip[] = [
      {
        label: "Trip",
        items: [
          { name: "Milk", amount: "1 liter", category: "dairy" },
          { name: "Bread", amount: "1 loaf", category: "bakery" },
        ],
      },
    ];

    const tripsB: ShoppingTrip[] = [
      {
        label: "Trip",
        items: [
          { name: "Bread", amount: "1 loaf", category: "bakery" },
          { name: "Milk", amount: "1 liter", category: "dairy" },
        ],
      },
    ];

    const resultA = addIdsToShoppingItems(tripsA);
    const resultB = addIdsToShoppingItems(tripsB);

    const milkIdA = resultA[0].items.find((i) => i.name === "Milk")!.id;
    const milkIdB = resultB[0].items.find((i) => i.name === "Milk")!.id;

    expect(milkIdA).toBe(milkIdB);
  });

  it("normalizes name and amount (case insensitive, trimmed)", () => {
    const trips1: ShoppingTrip[] = [
      {
        label: "Trip",
        items: [{ name: "MILK", amount: "1 LITER", category: "dairy" }],
      },
    ];
    const trips2: ShoppingTrip[] = [
      {
        label: "Trip",
        items: [{ name: "milk", amount: "1 liter", category: "dairy" }],
      },
    ];
    const trips3: ShoppingTrip[] = [
      {
        label: "Trip",
        items: [{ name: "  Milk  ", amount: "  1 liter  ", category: "dairy" }],
      },
    ];

    const id1 = addIdsToShoppingItems(trips1)[0].items[0].id;
    const id2 = addIdsToShoppingItems(trips2)[0].items[0].id;
    const id3 = addIdsToShoppingItems(trips3)[0].items[0].id;

    expect(id1).toBe(id2);
    expect(id2).toBe(id3);
  });

  it("generates different IDs for same item in different trips", () => {
    const trips: ShoppingTrip[] = [
      {
        label: "Trip 1",
        items: [{ name: "Milk", amount: "1 liter", category: "dairy" }],
      },
      {
        label: "Trip 2",
        items: [{ name: "Milk", amount: "1 liter", category: "dairy" }],
      },
    ];

    const result = addIdsToShoppingItems(trips);

    expect(result[0].items[0].id).not.toBe(result[1].items[0].id);
  });

  it("adds suffix for duplicate items within same trip", () => {
    const trips: ShoppingTrip[] = [
      {
        label: "Trip",
        items: [
          { name: "Milk", amount: "1 liter", category: "dairy" },
          { name: "Milk", amount: "1 liter", category: "dairy" },
          { name: "Milk", amount: "1 liter", category: "dairy" },
        ],
      },
    ];

    const result = addIdsToShoppingItems(trips);
    const ids = result[0].items.map((i) => i.id);

    expect(ids[0]).toMatch(/^item-[a-z0-9]+$/);
    expect(ids[1]).toBe(`${ids[0]}-2`);
    expect(ids[2]).toBe(`${ids[0]}-3`);
  });
});
