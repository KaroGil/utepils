import { NextRequest, NextResponse } from "next/server";
import { buildDailyForecast } from "@/lib/forecast";
import { isValidLatitude, isValidLongitude } from "@/lib/coords";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    const res = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
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
    const predictions = buildDailyForecast(data?.properties?.timeseries ?? []);

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
