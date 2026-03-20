import { NextResponse } from "next/server";
import { fetchSunset } from "@/lib/sun";
import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";
import { formatOsloTime, getOsloDayKey } from "@/lib/time";
import { fetchWeatherNow } from "@/lib/weather";
import { fetchPeak } from "@/lib/peak";

export async function GET() {
  try {
    // Bergen coordinates
    const lat = 60.39299;
    const lon = 5.32415;

    const now = new Date();

    const todayDate = getOsloDayKey(now);
    const currentHour = Number(formatOsloTime(now));

    const sunsetIso = await fetchSunset(lat, lon, todayDate);
    const weather = await fetchWeatherNow(lat, lon);
    const peak = await fetchPeak(lat, lon);

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
        city: "Bergen",
        score,
        verdict: getVerdict(score),
        weather: weather,
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
    console.error("GET /api/utepils/bergen failed:", error);

    return NextResponse.json(
      { error: "Could not fetch Bergen utepils data" },
      { status: 500 },
    );
  }
}
