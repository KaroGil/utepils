import { NextResponse } from "next/server";
import { WeatherData } from "../types/weather";

async function getCity(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "utepils-meter-app",
      },
    },
  );
  if (!res.ok) {
    throw new Error(`Reverse geocoding failed: ${res.status}`);
  }
  const data = await res.json();
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    "Unknown"
  );
}

export async function fetchWeatherTimeseries(lat: number, lon: number) {
  const res = await fetch(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "utepils-meter-app",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Could not fetch weather data" },
      { status: 502 },
    );
  }

  const data = await res.json();

  return data;
}

export async function fetchWeatherNow(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const data = await fetchWeatherTimeseries(lat, lon);

  const instant = data.properties.timeseries[0].data.instant.details;
  const nextHour = data.properties.timeseries[0].data.next_1_hours;

  const temperature = instant.air_temperature;
  const wind = instant.wind_speed;
  const precipitation = nextHour?.details?.precipitation_amount ?? 0;

  const symbol = nextHour?.summary?.symbol_code;

  const city = await getCity(lat, lon);

  return {
    temperature,
    wind,
    precipitation,
    city,
    symbol,
  };
}
