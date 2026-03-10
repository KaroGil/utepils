export type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy";

export type WeatherData = {
  temperature: number;
  wind: number;
  precipitation: number;
  condition: WeatherCondition;
  city: string;
};

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

  return {
    temperature,
    wind,
    precipitation,
    condition,
    city: "Bergen",
  };
}
