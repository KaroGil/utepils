import { NextResponse } from "next/server";
import { buildDailyForecast } from "@/lib/forecast";
import type { CityConfig } from "@/lib/cities";

export function createForecastRoute(city: CityConfig) {
  return async function GET() {
    try {
      const params = new URLSearchParams({
        lat: String(city.lat),
        lon: String(city.lon),
      });

      const res = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?${params}`,
        {
          headers: {
            "User-Agent": "utepils-meter/1.0",
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

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
