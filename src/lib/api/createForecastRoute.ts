import { NextResponse } from "next/server";
import { buildDailyForecast } from "@/lib/forecast";
import { fetchSunTimesForDays } from "@/lib/sun";
import { getNextOsloDayKeys } from "@/lib/time";
import { fetchWeatherTimeseries } from "@/lib/weather";
import type { CityConfig } from "@/lib/cities";

export function createForecastRoute(city: CityConfig) {
  return async function GET() {
    try {
      const [timeseries, sunTimes] = await Promise.all([
        fetchWeatherTimeseries(city.lat, city.lon),
        fetchSunTimesForDays(city.lat, city.lon, getNextOsloDayKeys(7)),
      ]);

      const predictions = buildDailyForecast(
        timeseries,
        city.timeZone,
        sunTimes,
      );

      return NextResponse.json(
        {
          city: city.name,
          predictions,
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=1800, stale-while-revalidate=3600",
          },
        },
      );
    } catch (error) {
      console.error(`GET /api/utepils/${city.slug}/forecast failed:`, error);

      return NextResponse.json(
        { error: `Could not fetch ${city.name} forecast data` },
        { status: 500 },
      );
    }
  };
}
