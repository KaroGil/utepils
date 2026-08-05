import { NextResponse } from "next/server";
import { fetchSunset } from "@/lib/sun";
import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";
import { formatOsloTime, getOsloDayKey } from "@/lib/time";
import { fetchWeatherNow } from "@/lib/weather";
import { fetchPeak } from "@/lib/peak";
import type { CityConfig } from "@/lib/cities";

export function createUtepilsRoute(city: CityConfig) {
  return async function GET() {
    try {
      const now = new Date();
      const todayDate = getOsloDayKey(now);
      const currentHour = Number(formatOsloTime(now));

      const [sunsetIso, weather, peak] = await Promise.all([
        fetchSunset(city.lat, city.lon, todayDate),
        fetchWeatherNow(city.lat, city.lon),
        fetchPeak(city.lat, city.lon),
      ]);

      const score = calculateUtepilsScore(
        weather.temperature,
        weather.wind,
        weather.symbol,
        weather.precipitation ?? 0,
        currentHour,
        sunsetIso,
        now.toISOString(),
      );

      return NextResponse.json(
        {
          city: city.name,
          score,
          verdict: getVerdict(score),
          weather,
          sun: {
            sunset: sunsetIso,
          },
          peakToday: peak,
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        },
      );
    } catch (error) {
      console.error(`GET /api/utepils/${city.slug} failed:`, error);

      return NextResponse.json(
        { error: `Could not fetch ${city.name} utepils data` },
        { status: 500 },
      );
    }
  };
}
