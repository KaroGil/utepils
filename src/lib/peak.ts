import { calculateUtepilsScore, mapSymbolToCondition } from "./calculations";
import { fetchSunset } from "./sun";
import { formatOsloTime, getOsloDayKey } from "./time";
import { fetchWeatherTimeseries } from "./weather";

export async function fetchPeak(lat: number, lon: number) {
  const data = await fetchWeatherTimeseries(lat, lon);

  const timeseries = data?.properties?.timeseries ?? [];

  let peakTodayTime: string | null = null;
  let peakTodayScore: number | null = null;

  for (const entry of timeseries) {
    const iso = entry?.time;
    const instant = entry?.data?.instant?.details;
    const nextHour = entry?.data?.next_1_hours;

    if (!iso || !instant) continue;

    const entryDate = new Date(iso);
    const sunsetIso = await fetchSunset(
      lat,
      lon,
      entryDate.toISOString().split("T")[0],
    );

    const entryDayKey = getOsloDayKey(entryDate);

    if (entryDayKey !== getOsloDayKey(new Date())) {
      continue; // Skip if not today
    }

    const hour = Number(
      entryDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/Oslo",
      }),
    );

    const temperature = instant.air_temperature;
    const wind = instant.wind_speed;
    const precipitation = nextHour?.details?.precipitation_amount ?? 0;
    const symbol = nextHour?.summary?.symbol_code ?? "";
    const condition = mapSymbolToCondition(symbol);

    if (
      typeof temperature !== "number" ||
      typeof wind !== "number" ||
      typeof precipitation !== "number"
    ) {
      continue;
    }

    const entryScore = calculateUtepilsScore(
      temperature,
      wind,
      condition,
      precipitation,
      hour,
      sunsetIso,
      entryDate.toISOString(),
    );

    if (peakTodayScore === null || entryScore > peakTodayScore) {
      peakTodayScore = entryScore;
      peakTodayTime = formatOsloTime(entryDate);
    }

    return { time: peakTodayTime, score: peakTodayScore };
  }
}
