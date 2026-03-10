import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";
import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";

export async function GET() {
  try {
    const lat = 60.39299;
    const lon = 5.32415;

    const weather = await fetchWeather(lat, lon);
    const hour = new Date().getHours();

    const score = calculateUtepilsScore(
      weather.temperature,
      weather.wind,
      weather.condition,
      weather.precipitation,
      hour,
    );

    return NextResponse.json(
      {
        city: "Bergen",
        score,
        verdict: getVerdict(score),
        weather,
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
