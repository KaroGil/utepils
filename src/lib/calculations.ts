import { ForecastPoint } from "@/types/weather";

function calculateTemperature(temperature: number) {
  if (temperature < 8) return 0;
  if (temperature < 15) return 20;
  if (temperature <= 22) return 35;
  if (temperature > 30) return 20;
  return 28;
}

export function calculateCondition(symbol?: string) {
  if (!symbol) return 0;

  const s = symbol.toLowerCase();

  // 🌧 Rain (worst)
  if (s.includes("rain")) return -25;

  // ❄️ Snow (also bad)
  if (s.includes("snow")) return -20;

  // 🌫 Fog
  if (s.includes("fog")) return -10;

  // ☀️ Clear sky
  if (s.includes("clearsky")) {
    if (s.includes("night")) return 10; // less good than day
    return 25;
  }

  // 🌤 Fair (nice but not perfect)
  if (s.includes("fair")) {
    if (s.includes("night")) return 8;
    return 20;
  }

  // ⛅ Partly cloudy
  if (s.includes("partlycloudy")) {
    if (s.includes("night")) return 5;
    return 18;
  }

  // ☁️ Default cloudy
  return 8;
}

function calculateWind(wind: number) {
  if (wind < 5) return 15;
  if (wind < 8) return 8;
  if (wind < 12) return -5;
  return -18;
}

function calculatePrecipitation(precipitation: number) {
  if (precipitation > 0) return -20;
  return 0;
}

function calculateTimeOfDay(hour: number) {
  if (hour < 10) return 0;
  if (hour < 14) return 6;
  if (hour < 16) return 12;
  if (hour < 22) return 25;
  return 10;
}

export function calculateUtepilsScore(
  temperature: number,
  wind: number,
  symbol: string,
  precipitation: number,
  hour: number,
  sunsetIso?: string | null,
  currentIso?: string,
) {
  let score = 0;

  score += calculateTemperature(temperature);
  score += calculateCondition(symbol);
  score += calculateWind(wind);
  score += calculatePrecipitation(precipitation);
  score += calculateTimeOfDay(hour);

  if (sunsetIso && currentIso) {
    const now = new Date(currentIso);
    const sunset = new Date(sunsetIso);

    const diffMinutes = (sunset.getTime() - now.getTime()) / (1000 * 60);

    if (diffMinutes < 0) {
      score -= 20;
    } else if (diffMinutes <= 60) {
      score -= 8;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export const BEST_TIME_OF_DAY_BONUS = 25;

export function calculateUtepilsScoreWithoutTime(
  temperature: number,
  wind: number,
  condition: string,
  precipitation: number,
) {
  let score = 0;

  score += calculateTemperature(temperature);
  score += calculateCondition(condition);
  score += calculateWind(wind);
  score += calculatePrecipitation(precipitation);

  return Math.max(0, Math.min(100, score));
}

export function getVerdict(score: number) {
  if (score >= 75) {
    return {
      title: "UTEPILS! 🍻",
      subtitle: "Nå er det bare å komme seg ut",
      emoji: "☀️",
    };
  }

  if (score >= 45) {
    return {
      title: "Det kan bli utepils 😌",
      subtitle: "Litt situasjonsavhengig, men absolutt mulig",
      emoji: "⛅",
    };
  }

  return {
    title: "Innepils i dag 😅",
    subtitle: "Dette er ikke topp utepils-stemning akkurat nå",
    emoji: "🌧️",
  };
}

export function getBackgroundClass(score: number) {
  if (score >= 75) return "from-amber-200 via-orange-200 to-yellow-100";
  if (score >= 45) return "from-sky-200 via-blue-100 to-slate-100";
  return "from-slate-300 via-slate-200 to-zinc-100";
}

export function getMeterColor(score: number) {
  if (score >= 75) return "bg-green-500";
  if (score >= 45) return "bg-yellow-500";
  return "bg-rose-500";
}

export function getConditionLabel(condition: string) {
  const labels: Record<string, string> = {
    sunny: "Sol",
    "partly-cloudy": "Delvis skyet",
    clearsky_night: "Klart",
    cloudy: "Overskyet",
    rainy: "Regn",
  };

  return labels[condition];
}

export function getForecastEmoji(score: number) {
  if (score >= 80) return "☀️🍻";
  if (score >= 60) return "🍺";
  if (score >= 45) return "😢";
  return "🍺🥶";
}

export function getNextGoodUtepilsDay(forecast: ForecastPoint[]) {
  return forecast.find((day) => day.score >= 75) ?? null;
}

export function mapSymbolToCondition(symbol?: string): string {
  if (!symbol) return "cloudy";

  const normalized = symbol.toLowerCase();

  if (normalized.includes("rain")) return "rainy";
  if (normalized.includes("clearsky")) return "sunny";
  if (normalized.includes("fair")) return "partly-cloudy";
  if (normalized.includes("partlycloudy")) return "partly-cloudy";

  return "cloudy";
}
