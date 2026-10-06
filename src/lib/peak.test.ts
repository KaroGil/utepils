import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { findPeakToday } from "./peak";
import type { HourlyPoint } from "@/types/weather";

function point(time: string, hour: string, score: number): HourlyPoint {
  return {
    time,
    hour,
    score,
    temperature: 18,
    wind: 2,
    precipitation: 0,
    symbol: "clearsky_day",
    night: false,
  };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-06T10:30:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("findPeakToday", () => {
  it("returns the best hour today, preferring the earliest on a tie", () => {
    const peak = findPeakToday([
      point("2026-10-06T10:00:00Z", "12:00", 60),
      point("2026-10-06T12:00:00Z", "14:00", 80),
      point("2026-10-06T14:00:00Z", "16:00", 80),
    ]);

    expect(peak).toEqual({ time: "14:00", score: 80 });
  });

  it("ignores hours tomorrow, even if they score higher", () => {
    const peak = findPeakToday([
      point("2026-10-06T12:00:00Z", "14:00", 70),
      point("2026-10-07T10:00:00Z", "12:00", 95),
    ]);

    expect(peak).toEqual({ time: "14:00", score: 70 });
  });

  it("returns nulls when there are no hours left today", () => {
    expect(findPeakToday([])).toEqual({ time: null, score: null });
  });
});
