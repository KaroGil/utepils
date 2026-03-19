import { NextResponse } from "next/server";
import { fetchSunset } from "@/lib/sun";
import { calculateUtepilsScore, getVerdict } from "@/lib/calculations";
import { WeatherCondition } from "@/lib/weather";

function mapSymbolToCondition(symbol: string): WeatherCondition {
  if (symbol.includes("rain")) return "rainy";
  if (symbol.includes("clearsky")) return "sunny";
  if (symbol.includes("partlycloudy")) return "partly-cloudy";
  return "cloudy";
}

export async function GET() {
  try {
    const lat = 60.39299;
    const lon = 5.32415;

    const now = new Date();

    const todayDate = now.toLocaleDateString("en-CA", {
      timeZone: "Europe/Oslo",
    });

    const todayKey = now.toLocaleDateString("sv-SE", {
      timeZone: "Europe/Oslo",
    });

    const currentHour = Number(
      now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        hour12: false,
        timeZone: "Europe/Oslo",
      }),
    );

    const sunsetIso = await fetchSunset(lat, lon, todayDate);

    const res = await fetch(
      `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
      {
        headers: {
          "User-Agent": "utepils-meter/1.0 karolinkagil@gmail.com",
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch Bergen utepils data" },
        { status: 502 },
      );
    }

    const data = await res.json();
    const timeseries = data?.properties?.timeseries ?? [];

    const currentEntry = timeseries[0];
    const currentInstant = currentEntry?.data?.instant?.details;
    const currentNextHour = currentEntry?.data?.next_1_hours;

    if (!currentInstant) {
      return NextResponse.json(
        { error: "Missing current weather data" },
        { status: 500 },
      );
    }

    const currentTemperature = currentInstant.air_temperature;
    const currentWind = currentInstant.wind_speed;
    const currentPrecipitation =
      currentNextHour?.details?.precipitation_amount ?? 0;
    const currentSymbol = currentNextHour?.summary?.symbol_code ?? "";
    const currentCondition = mapSymbolToCondition(currentSymbol);

    const score = calculateUtepilsScore(
      currentTemperature,
      currentWind,
      currentCondition,
      currentPrecipitation,
      currentHour,
      sunsetIso,
      now.toISOString(),
    );

    let peakTodayTime: string | null = null;
    let peakTodayScore: number | null = null;

    for (const entry of timeseries) {
      const iso = entry?.time;
      const instant = entry?.data?.instant?.details;
      const nextHour = entry?.data?.next_1_hours;

      if (!iso || !instant) continue;

      const entryDate = new Date(iso);

      const entryDayKey = entryDate.toLocaleDateString("sv-SE", {
        timeZone: "Europe/Oslo",
      });

      if (entryDayKey !== todayKey) continue;

      const hour = Number(
        entryDate.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          hour12: false,
          timeZone: "Europe/Oslo",
        }),
      );

      const temperature = instant.air_temperature;
      const wind = instant.wind_speed;
      const precipitation = nextHour?.details?.precipitation_amount ?? 0;
      const symbol = nextHour?.summary?.symbol_code ?? "";
      const condition = mapSymbolToCondition(symbol);

      if (
        typeof temperature !== "number" ||
        typeof wind !== "number" ||
        typeof precipitation !== "number"
      ) {
        continue;
      }

      const entryScore = calculateUtepilsScore(
        temperature,
        wind,
        condition,
        precipitation,
        hour,
        sunsetIso,
        entryDate.toISOString(),
      );

      // Only replace when strictly better.
      // That means ties keep the first matching time.
      if (peakTodayScore === null || entryScore > peakTodayScore) {
        peakTodayScore = entryScore;
        peakTodayTime = entryDate.toLocaleTimeString("no-NO", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Oslo",
        });
      }
    }

    return NextResponse.json(
      {
        city: "Bergen",
        score,
        verdict: getVerdict(score),
        weather: {
          temperature: currentTemperature,
          wind: currentWind,
          precipitation: currentPrecipitation,
          condition: currentCondition,
        },
        sun: {
          sunset: sunsetIso,
        },
        peakToday: {
          time: peakTodayTime,
          score: peakTodayScore,
        },
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
