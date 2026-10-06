import type { ForecastEntry, WeatherData } from "../types/weather";

// MET and Nominatim both require a User-Agent that identifies the app.
const USER_AGENT = "utepils-meter/1.0 github.com/KaroGil/utepils";

const FALLBACK_PLACE_NAME = "Din posisjon";

/*
 * Place name for a coordinate. Never throws, so a slow or failing
 * Nominatim doesn't take the score down with it.
 */
export async function fetchPlaceName(lat: number, lon: number) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=nb`,
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
        next: { revalidate: 86400 },
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
      FALLBACK_PLACE_NAME
    );
  } catch (error) {
    console.error("Could not look up place name:", error);
    return FALLBACK_PLACE_NAME;
  }
}

export async function fetchWeatherTimeseries(
  lat: number,
  lon: number,
): Promise<ForecastEntry[]> {
  const res = await fetch(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": USER_AGENT,
      },
      next: { revalidate: 600 },
    },
  );

  if (!res.ok) {
    throw new Error(`MET request failed: ${res.status}`);
  }

  const data = await res.json();

  return data?.properties?.timeseries ?? [];
}

export function getCurrentWeather(
  timeseries: ForecastEntry[],
  city: string,
): WeatherData {
  const instant = timeseries[0]?.data?.instant?.details;
  const nextHour = timeseries[0]?.data?.next_1_hours;

  if (
    typeof instant?.air_temperature !== "number" ||
    typeof instant?.wind_speed !== "number"
  ) {
    throw new Error("MET response has no current weather");
  }

  return {
    temperature: instant.air_temperature,
    wind: instant.wind_speed,
    precipitation: nextHour?.details?.precipitation_amount ?? 0,
    city,
    symbol: nextHour?.summary?.symbol_code ?? "",
  };
}
