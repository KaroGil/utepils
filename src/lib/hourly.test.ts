import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildHourlyScores } from "./hourly";
import type { ForecastEntry } from "@/types/weather";

function entry(time: string, temperature = 18): ForecastEntry {
  return {
    time,
    data: {
      instant: { details: { air_temperature: temperature, wind_speed: 2 } },
      next_1_hours: {
        summary: { symbol_code: "clearsky_day" },
        details: { precipitation_amount: 0 },
      },
    },
  };
}

function hoursFrom(start: string, count: number) {
  const startMs = new Date(start).getTime();
  return Array.from({ length: count }, (_, i) =>
    entry(new Date(startMs + i * 60 * 60 * 1000).toISOString()),
  );
}

const SUN_TIMES = {
  "2026-10-06": {
    sunrise: "2026-10-06T05:55:00Z",
    sunset: "2026-10-06T16:55:00Z",
  },
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // 12:30 in Oslo on 6 October.
  vi.setSystemTime(new Date("2026-10-06T10:30:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("buildHourlyScores", () => {
  it("starts at the current hour", () => {
    const points = buildHourlyScores(
      [
        entry("2026-10-06T09:00:00Z"),
        entry("2026-10-06T10:00:00Z"),
        entry("2026-10-06T11:00:00Z"),
      ],
      SUN_TIMES,
    );

    expect(points.map((p) => p.time)).toEqual([
      "2026-10-06T10:00:00Z",
      "2026-10-06T11:00:00Z",
    ]);
  });

  it("returns at most the requested number of hours", () => {
    const timeseries = hoursFrom("2026-10-06T10:00:00Z", 30);

    expect(buildHourlyScores(timeseries, SUN_TIMES)).toHaveLength(24);
    expect(buildHourlyScores(timeseries, SUN_TIMES, 5)).toHaveLength(5);
  });

  it("labels each hour in Oslo time", () => {
    const [point] = buildHourlyScores([entry("2026-10-06T10:00:00Z")], SUN_TIMES);

    expect(point.hour).toBe("12:00");
  });

  it("marks hours after dark as night and scores them lower", () => {
    const [day, night] = buildHourlyScores(
      [entry("2026-10-06T11:00:00Z"), entry("2026-10-06T21:00:00Z")],
      SUN_TIMES,
    );

    expect(day.night).toBe(false);
    expect(night.night).toBe(true);
    expect(night.score).toBeLessThan(day.score);
  });

  it("skips entries without temperature or wind", () => {
    expect(
      buildHourlyScores(
        [{ time: "2026-10-06T11:00:00Z", data: { instant: { details: {} } } }],
        SUN_TIMES,
      ),
    ).toEqual([]);
  });
});
