import { getOsloDayKey } from "./time";
import type { HourlyPoint } from "@/types/weather";

/*
 * The hour with the best score for the rest of today.
 * Ties go to the earliest hour.
 */
export function findPeakToday(hourly: HourlyPoint[]) {
  const todayKey = getOsloDayKey(new Date());
  let peak: HourlyPoint | null = null;

  for (const point of hourly) {
    if (getOsloDayKey(new Date(point.time)) !== todayKey) continue;

    if (!peak || point.score > peak.score) {
      peak = point;
    }
  }

  return { time: peak?.hour ?? null, score: peak?.score ?? null };
}
