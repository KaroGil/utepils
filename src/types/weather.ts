export type WeatherData = {
  temperature: number;
  wind: number;
  precipitation: number;
  city: string;
  symbol: string;
};

export type ForecastPoint = {
  date: string;
  label: string;
  score: number;
  bestHour: string;
  temperature: number;
  condition: string;
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
    condition: string;
  };
  sun: {
    sunset: string | null;
  };
  peakToday: {
    time: string | null;
    score: number | null;
  };
};
