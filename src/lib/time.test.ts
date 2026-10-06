import { describe, expect, it } from "vitest";
import {
  getNextOsloDayKeys,
  getOsloDayKey,
  getOsloHour,
  isSeventeenthOfMay,
} from "./time";

describe("getOsloDayKey and getOsloHour", () => {
  it("use Oslo time, not UTC", () => {
    const lateEvening = new Date("2026-10-06T22:30:00Z");

    expect(getOsloDayKey(lateEvening)).toBe("2026-10-07");
    expect(getOsloHour(lateEvening)).toBe(0);
  });
});

describe("getNextOsloDayKeys", () => {
  it("returns today and the following days", () => {
    expect(getNextOsloDayKeys(3, new Date("2026-10-06T10:00:00Z"))).toEqual([
      "2026-10-06",
      "2026-10-07",
      "2026-10-08",
    ]);
  });

  it("doesn't repeat a day when the clocks go back", () => {
    // 00:30 on 25 October, a day with 25 hours.
    expect(getNextOsloDayKeys(2, new Date("2026-10-24T22:30:00Z"))).toEqual([
      "2026-10-25",
      "2026-10-26",
    ]);
  });

  it("doesn't skip a day when the clocks go forward", () => {
    // 23:30 on 28 March, the night before a day with 23 hours.
    expect(getNextOsloDayKeys(2, new Date("2026-03-28T22:30:00Z"))).toEqual([
      "2026-03-28",
      "2026-03-29",
    ]);
  });
});

describe("isSeventeenthOfMay", () => {
  it("follows the Oslo date", () => {
    expect(isSeventeenthOfMay("2026-05-16T22:30:00Z")).toBe(true);
    expect(isSeventeenthOfMay("2026-05-17T22:30:00Z")).toBe(false);
  });
});
