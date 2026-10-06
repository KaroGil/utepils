import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  calculateCondition,
  calculateDaylight,
  calculatePrecipitation,
  calculateTemperature,
  calculateUtepilsScore,
  calculateWind,
  getNextGoodUtepilsDay,
  getVerdict,
} from "./calculations";
import type { ForecastPoint } from "@/types/weather";

// Bergen, 6 October 2026: sunrise 07:55 and sunset 18:55 Oslo time.
const SUNRISE = "2026-10-06T05:55:00Z";
const SUNSET = "2026-10-06T16:55:00Z";
const AFTERNOON = "2026-10-06T12:00:00Z";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(AFTERNOON));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("calculateTemperature", () => {
  it("is perfect at 22°C", () => {
    expect(calculateTemperature(22)).toBe(1);
  });

  it("drops off faster in the cold than in the heat", () => {
    // 12 degrees too cold hurts as much as 15 degrees too warm.
    expect(calculateTemperature(10)).toBeCloseTo(Math.exp(-1));
    expect(calculateTemperature(37)).toBeCloseTo(Math.exp(-1));
    expect(calculateTemperature(12)).toBeLessThan(calculateTemperature(32));
  });
});

describe("calculateWind", () => {
  it("is perfect when calm and barely notices a light breeze", () => {
    expect(calculateWind(0)).toBe(1);
    expect(calculateWind(4)).toBeGreaterThan(0.9);
  });

  it("falls steeply in strong wind", () => {
    expect(calculateWind(8)).toBeCloseTo(Math.exp(-1));
    expect(calculateWind(14)).toBeLessThan(0.01);
  });
});

describe("calculatePrecipitation", () => {
  it("is perfect when dry and halves at 0.5 mm", () => {
    expect(calculatePrecipitation(0)).toBe(1);
    expect(calculatePrecipitation(0.5)).toBeCloseTo(0.5);
    expect(calculatePrecipitation(1)).toBeCloseTo(0.2);
  });

  it("treats negative amounts as dry", () => {
    expect(calculatePrecipitation(-1)).toBe(1);
  });
});

describe("calculateCondition", () => {
  it.each([
    ["clearsky_day", 1],
    ["clearsky_night", 0.6],
    ["fair_day", 0.85],
    ["partlycloudy_night", 0.55],
    ["cloudy", 0.45],
    ["fog", 0.35],
    ["lightrainshowers_day", 0.35],
    ["lightsleet", 0.25],
    ["heavysnow", 0.25],
    ["rainandthunder", 0.25],
    ["", 0.45],
    [undefined, 0.45],
  ])("scores %s as %s", (symbol, expected) => {
    expect(calculateCondition(symbol)).toBe(expected);
  });
});

describe("calculateDaylight", () => {
  it("is full daylight in the middle of the day", () => {
    expect(calculateDaylight(12, SUNSET, SUNRISE)).toBe(1);
  });

  it("is dark well before sunrise and well after sunset", () => {
    expect(calculateDaylight(3, SUNSET, SUNRISE)).toBe(0.1);
    expect(calculateDaylight(22, SUNSET, SUNRISE)).toBe(0.1);
  });

  it("fades out around sunset", () => {
    const daylight = calculateDaylight(19, SUNSET, SUNRISE);

    expect(daylight).toBeCloseTo(0.648, 3);
    expect(daylight).toBeLessThan(calculateDaylight(18, SUNSET, SUNRISE));
  });

  it("assumes sunrise 06 and sunset 22 when sun times are missing", () => {
    expect(calculateDaylight(21, null, null)).toBe(1);
    expect(calculateDaylight(23, null, null)).toBe(0.1);
  });
});

describe("calculateUtepilsScore", () => {
  const perfect = {
    temperature: 22,
    wind: 0,
    symbol: "clearsky_day",
    precipitation: 0,
    hour: 14,
  };

  function score(overrides: Partial<typeof perfect> = {}, iso = AFTERNOON) {
    const p = { ...perfect, ...overrides };
    return calculateUtepilsScore(
      p.temperature,
      p.wind,
      p.symbol,
      p.precipitation,
      p.hour,
      SUNSET,
      iso,
      SUNRISE,
    );
  }

  it("gives 100 for perfect conditions", () => {
    expect(score()).toBe(100);
  });

  it("is a geometric mean of the five factors", () => {
    // Only temperature is off: e^-1 ^ (1/5) = e^-0.2 ≈ 0.82.
    expect(score({ temperature: 10 })).toBe(82);
  });

  it("lets one bad factor pull the whole score down", () => {
    expect(score({ hour: 23 })).toBeLessThan(65);
    expect(score({ precipitation: 3 })).toBeLessThan(50);
  });

  it("is always 100 on 17 May", () => {
    expect(
      score(
        { temperature: -5, wind: 20, symbol: "heavyrain", precipitation: 10 },
        "2026-05-17T10:00:00Z",
      ),
    ).toBe(100);
  });
});

describe("getVerdict", () => {
  it.each([
    [100, "UTEPILS IDYLL! ☀️🍻"],
    [90, "UTEPILS IDYLL! ☀️🍻"],
    [89, "UTEPILS! 🍻"],
    [80, "UTEPILS! 🍻"],
    [79, "Hvem blir med på utepils? 🙂‍↕️"],
    [65, "Hvem blir med på utepils? 🙂‍↕️"],
    [64, "Det kan bli utepils 😌"],
    [45, "Det kan bli utepils 😌"],
    [44, "Kun for de mest motiverte"],
    [25, "Kun for de mest motiverte"],
    [24, "Innepils i dag 😅"],
    [0, "Innepils i dag 😅"],
  ])("gives %s%% the title %s", (score, title) => {
    expect(getVerdict(score).title).toBe(title);
  });

  it("congratulates on 17 May", () => {
    vi.setSystemTime(new Date("2026-05-17T10:00:00Z"));

    expect(getVerdict(100).title).toContain("Gratulerer med dagen");
  });
});

describe("getNextGoodUtepilsDay", () => {
  function day(date: string, score: number): ForecastPoint {
    return {
      date,
      label: "",
      score,
      bestHour: "14:00",
      temperature: 18,
      condition: "sunny",
    };
  }

  it("returns the first day at 75% or more", () => {
    const forecast = [
      day("2026-10-06", 70),
      day("2026-10-07", 75),
      day("2026-10-08", 90),
    ];

    expect(getNextGoodUtepilsDay(forecast)?.date).toBe("2026-10-07");
  });

  it("returns null when no day is good enough", () => {
    expect(getNextGoodUtepilsDay([day("2026-10-06", 74)])).toBeNull();
  });
});
