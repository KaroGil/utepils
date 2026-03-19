import { WeatherData, WeatherCondition } from "../types/weather";

async function getCity(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "utepils-meter-app",
      },
    },
  );
  const data = await res.json();
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    "Unknown"
  );
}

export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const res = await fetch(
    `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
    {
      headers: {
        "User-Agent": "utepils-meter-app",
      },
      cache: "no-store",
    },
  );

  const data = await res.json();

  const instant = data.properties.timeseries[0].data.instant.details;
  const nextHour = data.properties.timeseries[0].data.next_1_hours;

  const temperature = instant.air_temperature;
  const wind = instant.wind_speed;
  const precipitation = nextHour?.details?.precipitation_amount ?? 0;

  const symbol = nextHour?.summary?.symbol_code;

  let condition: WeatherCondition = "cloudy";

  if (symbol?.includes("rain")) condition = "rainy";
  else if (symbol?.includes("clearsky")) condition = "sunny";
  else if (symbol?.includes("partlycloudy")) condition = "partly-cloudy";

  const city = await getCity(lat, lon);

  return {
    temperature,
    wind,
    precipitation,
    condition,
    city,
  };
}
