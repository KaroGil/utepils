export type WeatherCondition = "sunny" | "partly-cloudy" | "cloudy" | "rainy";

export type WeatherData = {
  temperature: number;
  wind: number;
  condition: WeatherCondition;
  precipitation: number;
  city: string;
  symbol?: string;
};

export type ForecastPoint = {
  date: string;
  label: string;
  score: number;
  bestHour: string;
  temperature: number;
  condition: WeatherCondition;
};

export type ForecastEntry = {
  time?: string;
  data?: {
    instant?: {
      details?: {
        air_temperature?: number;
        wind_speed?: number;
      };
    };
    next_1_hours?: {
      details?: {
        precipitation_amount?: number;
      };
      summary?: {
        symbol_code?: string;
      };
    };
  };
};

export type BergenResponse = {
  city: string;
  score: number;
  verdict: {
    title: string;
    subtitle: string;
    emoji: string;
  };
  weather: {
    temperature: number;
    wind: number;
    precipitation: number;
    condition: WeatherCondition;
  };
  sun: {
    sunset: string | null;
  };
  peakToday: {
    time: string | null;
    score: number | null;
  };
};
