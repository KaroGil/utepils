import { NextResponse } from "next/server";
import { buildDailyForecast } from "@/lib/forecast";
import { fetchSunTimesForDays } from "@/lib/sun";
import { getNextOsloDayKeys } from "@/lib/time";
import type { CityConfig } from "@/lib/cities";

export function createForecastRoute(city: CityConfig) {
  return async function GET() {
    try {
      const params = new URLSearchParams({
        lat: String(city.lat),
        lon: String(city.lon),
      });

      const [res, sunTimes] = await Promise.all([
        fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?${params}`,
          {
            headers: {
              "User-Agent": "utepils-meter/1.0",
              Accept: "application/json",
            },
            cache: "no-store",
          },
        ),
        fetchSunTimesForDays(city.lat, city.lon, getNextOsloDayKeys(7)),
      ]);

      if (!res.ok) {
        return NextResponse.json(
          { error: "Could not fetch forecast data" },
          { status: 502 },
        );
      }

      const data = await res.json();
      const predictions = buildDailyForecast(
        data?.properties?.timeseries ?? [],
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
