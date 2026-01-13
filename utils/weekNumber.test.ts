import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getPlanKey,
  parsePlanKey,
  formatWeekRange,
  getCurrentWeekInfo,
  getWeekInfoForDate,
  getWeekInfoByKey,
  getNextWeekKey,
  getPreviousWeekKey,
} from "./weekNumber";

describe("getPlanKey / parsePlanKey", () => {
  it("formats and parses week keys with proper padding", () => {
    expect(getPlanKey(2026, 2)).toBe("2026-02");
    expect(getPlanKey(2026, 12)).toBe("2026-12");
    expect(getPlanKey(2020, 53)).toBe("2020-53");

    expect(parsePlanKey("2026-02")).toEqual({ year: 2026, weekNumber: 2 });
    expect(parsePlanKey("2026-01")).toEqual({ year: 2026, weekNumber: 1 });
  });

  it("roundtrips correctly", () => {
    const original = { year: 2026, weekNumber: 15 };
    expect(parsePlanKey(getPlanKey(original.year, original.weekNumber))).toEqual(original);
  });
});

describe("formatWeekRange", () => {
  it("formats same month and cross-month ranges", () => {
    expect(formatWeekRange("2026-01-06", "2026-01-12", "ru")).toBe("6-12 янв.");
    expect(formatWeekRange("2026-01-06", "2026-01-12", "en")).toBe("6-12 Jan");
    expect(formatWeekRange("2025-12-29", "2026-01-04", "ru")).toMatch(/29 дек\. - 4 янв\./);
    expect(formatWeekRange("2025-12-29", "2026-01-04", "en")).toMatch(/29 Dec - 4 Jan/);
  });

  it("defaults to Russian locale", () => {
    expect(formatWeekRange("2026-01-06", "2026-01-12")).toBe("6-12 янв.");
  });
});

describe("getWeekInfoForDate", () => {
  it("returns complete week info", () => {
    const info = getWeekInfoForDate(new Date(2026, 0, 7)); // Wed, Jan 7

    expect(info).toEqual({
      weekNumber: 2,
      year: 2026,
      weekKey: "2026-02",
      weekStart: "2026-01-05",
      weekEnd: "2026-01-11",
      dateRange: expect.any(String),
    });
  });

  it("handles year boundary (Dec 31 2025 → ISO week 1 of 2026)", () => {
    const info = getWeekInfoForDate(new Date(2025, 11, 31));

    expect(info.weekNumber).toBe(1);
    expect(info.year).toBe(2026);
    expect(info.weekKey).toBe("2026-01");
  });
});

describe("getCurrentWeekInfo", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("returns week info for current date", () => {
    vi.setSystemTime(new Date(2026, 0, 7, 12, 0, 0));

    const info = getCurrentWeekInfo();

    expect(info.weekKey).toBe("2026-02");
  });
});

describe("getWeekInfoByKey", () => {
  it("returns correct week info and roundtrips with getWeekInfoForDate", () => {
    const info = getWeekInfoByKey("2026-02");

    expect(info.weekNumber).toBe(2);
    expect(info.weekStart).toBe("2026-01-05");
    expect(info.weekEnd).toBe("2026-01-11");

    // Roundtrip
    const fromDate = getWeekInfoForDate(new Date(2026, 5, 15));
    const fromKey = getWeekInfoByKey(fromDate.weekKey);
    expect(fromKey.weekStart).toBe(fromDate.weekStart);
  });
});

describe("week navigation", () => {
  it("getNextWeekKey increments week", () => {
    expect(getNextWeekKey("2026-02")).toBe("2026-03");
    expect(getNextWeekKey("2026-09")).toBe("2026-10");
  });

  it("getPreviousWeekKey decrements week", () => {
    expect(getPreviousWeekKey("2026-03")).toBe("2026-02");
    expect(getPreviousWeekKey("2026-10")).toBe("2026-09");
  });

  it("handles year transitions", () => {
    expect(getNextWeekKey("2025-52")).toBe("2026-01");
    expect(getNextWeekKey("2026-53")).toBe("2027-01");
    expect(getPreviousWeekKey("2026-01")).toBe("2025-52");
    expect(getPreviousWeekKey("2027-01")).toBe("2026-53");
  });

  it("roundtrips correctly including year boundary", () => {
    expect(getPreviousWeekKey(getNextWeekKey("2026-15"))).toBe("2026-15");
    expect(getNextWeekKey(getPreviousWeekKey("2026-01"))).toBe("2026-01");
  });
});
