import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildDailyForecast } from "./forecast";
import { TIMEZONE } from "./time";
import type { ForecastEntry } from "@/types/weather";

type Weather = {
  temperature?: number;
  wind?: number;
  symbol?: string;
  precipitation?: number;
};

function hourlyEntry(
  time: string,
  { temperature = 18, wind = 2, symbol = "clearsky_day", precipitation = 0 }: Weather = {},
): ForecastEntry {
  return {
    time,
    data: {
      instant: {
        details: { air_temperature: temperature, wind_speed: wind },
      },
      next_1_hours: {
        summary: { symbol_code: symbol },
        details: { precipitation_amount: precipitation },
      },
    },
  };
}

// Later in the forecast MET only gives 6-hour periods.
function sixHourEntry(
  time: string,
  { temperature = 18, wind = 2, symbol = "clearsky_day", precipitation = 0 }: Weather = {},
): ForecastEntry {
  return {
    time,
    data: {
      instant: {
        details: { air_temperature: temperature, wind_speed: wind },
      },
      next_6_hours: {
        summary: { symbol_code: symbol },
        details: { precipitation_amount: precipitation },
      },
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  // 10:00 in Oslo on 6 October.
  vi.setSystemTime(new Date("2026-10-06T08:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("buildDailyForecast", () => {
  it("picks the best-scoring hour of each day", () => {
    const forecast = buildDailyForecast([
      hourlyEntry("2026-10-06T10:00:00Z", { temperature: 14 }),
      hourlyEntry("2026-10-06T14:00:00Z", { temperature: 20 }),
      hourlyEntry("2026-10-06T15:00:00Z", { temperature: 20, wind: 9 }),
    ]);

    expect(forecast).toHaveLength(1);
    expect(forecast[0]).toMatchObject({
      date: "2026-10-06",
      bestHour: "16:00",
      temperature: 20,
      condition: "sunny",
    });
  });

  it("uses real sunrise times, so dawn doesn't count as daylight", () => {
    // Same weather at 08:00 and 16:00 Oslo time, sunrise at 07:57.
    const timeseries = [
      hourlyEntry("2026-10-07T06:00:00Z"),
      hourlyEntry("2026-10-07T14:00:00Z"),
    ];

    const forecast = buildDailyForecast(timeseries, TIMEZONE, {
      "2026-10-07": {
        sunrise: "2026-10-07T05:57:00Z",
        sunset: "2026-10-07T16:52:00Z",
      },
    });

    expect(forecast[0].bestHour).toBe("16:00");
  });

  it("reads weather from 6-hour periods when there is no hourly data", () => {
    const [hourly, sixHourly] = buildDailyForecast([
      hourlyEntry("2026-10-09T12:00:00Z", { symbol: "rain", precipitation: 1 }),
      sixHourEntry("2026-10-10T12:00:00Z", { symbol: "rain", precipitation: 6 }),
    ]);

    expect(sixHourly.condition).toBe("rainy");
    // 6 mm over 6 hours scores the same as 1 mm in one hour.
    expect(sixHourly.score).toBe(hourly.score);
  });

  it("groups hours by the Oslo date, not the UTC date", () => {
    const [day] = buildDailyForecast([hourlyEntry("2026-10-06T22:30:00Z")]);

    expect(day).toMatchObject({ date: "2026-10-07", bestHour: "00:30" });
  });

  it("drops past days and returns at most seven days", () => {
    const timeseries = Array.from({ length: 10 }, (_, i) =>
      hourlyEntry(new Date(Date.UTC(2026, 9, 5 + i, 12)).toISOString()),
    );

    const forecast = buildDailyForecast(timeseries);

    expect(forecast.map((day) => day.date)).toEqual([
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
      "2026-10-09",
      "2026-10-10",
      "2026-10-11",
      "2026-10-12",
    ]);
  });

  it("skips entries without temperature or wind", () => {
    expect(
      buildDailyForecast([
        { time: "2026-10-06T12:00:00Z", data: { instant: { details: {} } } },
        { time: "2026-10-06T13:00:00Z" },
      ]),
    ).toEqual([]);
  });
});
