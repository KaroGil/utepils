import { NextRequest, NextResponse } from "next/server";
import { buildDailyForecast } from "@/lib/forecast";
import {
  isValidLatitude,
  isValidLongitude,
  roundCoord,
} from "@/lib/coords";
import { fetchSunTimesForDays } from "@/lib/sun";
import { getNextOsloDayKeys, TIMEZONE } from "@/lib/time";
import { fetchWeatherTimeseries } from "@/lib/weather";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const rawLat = Number(searchParams.get("lat"));
    const rawLon = Number(searchParams.get("lon"));

    if (!isValidLatitude(rawLat) || !isValidLongitude(rawLon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    const lat = roundCoord(rawLat);
    const lon = roundCoord(rawLon);

    const [timeseries, sunTimes] = await Promise.all([
      fetchWeatherTimeseries(lat, lon),
      fetchSunTimesForDays(lat, lon, getNextOsloDayKeys(7)),
    ]);

    const predictions = buildDailyForecast(timeseries, TIMEZONE, sunTimes);

    return NextResponse.json(
      {
        city: "Your location",
        predictions,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/utepils/forecast failed:", error);

    return NextResponse.json(
      { error: "Could not fetch forecast data" },
      { status: 500 },
    );
  }
}
