import { ForecastEntry } from "@/types/weather";
import { fetchMetData } from "./forcast";
import { mapSymbolToCondition } from "./calculations";

export async function fetchMetData(lat: number, lon: number) {
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
    throw new Error(`Could not fetch forecast: ${res.status}`);
  }

  return res.json();
}

export async function fetchForecast(
  lat: number,
  lon: number,
): Promise<ForecastEntry[]> {
  const data = await fetchMetData(lat, lon);
  return (data?.properties?.timeseries ?? []) as ForecastEntry[];
}

export { mapSymbolToCondition };
