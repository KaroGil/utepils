import { NextRequest, NextResponse } from "next/server";
import { fetchWeatherNow } from "@/lib/weather";
import { fetchSunset } from "@/lib/sun";
import { fetchPeak } from "@/lib/peak";
import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";
import { formatOsloTime, getOsloDayKey } from "@/lib/time";
import { isValidLatitude, isValidLongitude } from "@/lib/coords";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    const now = new Date();
    const todayDate = getOsloDayKey(now);
    const currentHour = Number(formatOsloTime(now));

    const [weather, sunsetIso, peak] = await Promise.all([
      fetchWeatherNow(lat, lon),
      fetchSunset(lat, lon, todayDate),
      fetchPeak(lat, lon),
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
        city: "Your location",
        score,
        verdict: getVerdict(score),
        weather,
        sun: {
          sunset: sunsetIso,
        },
        peakToday: peak,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/utepils/current failed:", error);

    return NextResponse.json(
      { error: "Could not fetch location-based utepils data" },
      { status: 500 },
    );
  }
}
