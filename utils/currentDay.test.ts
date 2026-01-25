import { describe, it, expect, vi, afterEach } from "vitest";
import { getCurrentDay } from "./currentDay";

describe("getCurrentDay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns sun on Sunday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25")); // Sunday
    expect(getCurrentDay()).toBe("sun");
  });

  it("returns mon on Monday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-26")); // Monday
    expect(getCurrentDay()).toBe("mon");
  });

  it("returns tue on Tuesday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-27")); // Tuesday
    expect(getCurrentDay()).toBe("tue");
  });

  it("returns wed on Wednesday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-28")); // Wednesday
    expect(getCurrentDay()).toBe("wed");
  });

  it("returns thu on Thursday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-29")); // Thursday
    expect(getCurrentDay()).toBe("thu");
  });

  it("returns fri on Friday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-30")); // Friday
    expect(getCurrentDay()).toBe("fri");
  });

  it("returns sat on Saturday", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-31")); // Saturday
    expect(getCurrentDay()).toBe("sat");
  });
});
