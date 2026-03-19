import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";
import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";
import { isValidLatitude, isValidLongitude } from "@/lib/coords";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

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
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
