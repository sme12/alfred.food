import { describe, it, expect } from "vitest";
import { buildMealPlanPrompt, buildShoppingListPrompt } from "./promptBuilder";
import type { AppState } from "@/schemas/appState";
import type { DayPlan } from "@/schemas/mealPlanResponse";
import { createDefaultWeekSchedule } from "@/config/defaults";

const cuisineNames: Record<string, string> = {
  "eastern-european": "Восточно-европейская",
  asian: "Азиатская",
  mexican: "Мексиканская",
  american: "Американская",
};

function createTestAppState(overrides?: Partial<AppState>): AppState {
  return {
    schedules: {
      vitalik: createDefaultWeekSchedule(),
      lena: createDefaultWeekSchedule(),
    },
    selectedCuisines: ["eastern-european", "asian"],
    specialConditions: "",
    ...overrides,
  };
}

describe("buildMealPlanPrompt", () => {
  it("generates complete prompt with all static sections", () => {
    const state = createTestAppState();
    const prompt = buildMealPlanPrompt(state, cuisineNames);

    // Role section
    expect(prompt).toContain("РОЛЬ");
    expect(prompt).toContain("планировщик питания");
    expect(prompt).toContain("2 человек");

    // Cooking time section
    expect(prompt).toContain("30 мин");
    expect(prompt).toContain("60 мин");

    // Banned ingredients section
    expect(prompt).toContain("Гречка");
    expect(prompt).toContain("минестроне");

    // JSON output format section
    expect(prompt).toContain("weekPlan");
    expect(prompt).toContain('"day": "mon"');
  });

  it("includes selected cuisines", () => {
    const state = createTestAppState({
      selectedCuisines: ["asian", "mexican"],
    });
    const prompt = buildMealPlanPrompt(state, cuisineNames);

    expect(prompt).toContain("Азиатская");
    expect(prompt).toContain("Мексиканская");
  });

  it("includes special conditions when provided", () => {
    const state = createTestAppState({
      specialConditions: "В холодильнике есть курица",
    });
    const prompt = buildMealPlanPrompt(state, cuisineNames);

    expect(prompt).toContain("ОСОБЫЕ УСЛОВИЯ");
    expect(prompt).toContain("В холодильнике есть курица");
  });

  it("excludes special conditions section when empty", () => {
    const state = createTestAppState({
      specialConditions: "",
    });
    const prompt = buildMealPlanPrompt(state, cuisineNames);

    expect(prompt).not.toContain("ОСОБЫЕ УСЛОВИЯ");
  });

  it("formats schedule with null for skipped meals", () => {
    const state = createTestAppState();
    const prompt = buildMealPlanPrompt(state, cuisineNames);

    expect(prompt).toContain("Понедельник");
    expect(prompt).toContain("Обед: null");
  });
});

describe("buildShoppingListPrompt", () => {
  const sampleWeekPlan: DayPlan[] = [
    {
      day: "mon",
      breakfast: { name: "Омлет с сыром", time: 15, portions: 2 },
      lunch: null,
      dinner: { name: "Паста карбонара", time: 30, portions: 2 },
    },
    {
      day: "tue",
      breakfast: { name: "Тосты с авокадо", time: 10, portions: 2 },
      lunch: null,
      dinner: { name: "Куриное карри", time: 40, portions: 2 },
    },
  ];

  it("generates complete prompt with task and format sections", () => {
    const state = createTestAppState();
    const prompt = buildShoppingListPrompt(sampleWeekPlan, state);

    // Task section
    expect(prompt).toContain("ЗАДАЧА");
    expect(prompt).toContain("список покупок");

    // All category IDs
    expect(prompt).toContain("dairy");
    expect(prompt).toContain("meat");
    expect(prompt).toContain("produce");
    expect(prompt).toContain("pantry");
    expect(prompt).toContain("frozen");
    expect(prompt).toContain("bakery");
    expect(prompt).toContain("condiments");

    // JSON output format
    expect(prompt).toContain("shoppingTrips");
    expect(prompt).toContain("Закупка 1");
    expect(prompt).toContain("Закупка 2");
  });

  it("includes meal plan with dish names", () => {
    const state = createTestAppState();
    const prompt = buildShoppingListPrompt(sampleWeekPlan, state);

    expect(prompt).toContain("Омлет с сыром");
    expect(prompt).toContain("Паста карбонара");
    expect(prompt).toContain("Понедельник");
  });

  it("excludes null meals from plan description", () => {
    const state = createTestAppState();
    const prompt = buildShoppingListPrompt(sampleWeekPlan, state);

    expect(prompt).not.toContain("Обед — null");
  });
});
