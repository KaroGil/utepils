export type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy";

export type WeatherData = {
  temperature: number;
  wind: number;
  condition: WeatherCondition;
  precipitation: number;
  city: string;
};

export type ForecastPoint = {
  date: string;
  label: string;
  score: number;
  bestHour: string;
  temperature: number;
  condition: "sunny" | "partly-cloudy" | "cloudy" | "rainy";
};
