export type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy";

export type WeatherData = {
  temperature: number;
  wind: number;
  condition: WeatherCondition;
  precipitation: number;
  city: string;
};
