import { ForecastPoint, WeatherCondition } from "@/types/weather";

export function calculateUtepilsScore(
  temperature: number,
  wind: number,
  condition: WeatherCondition,
  precipitation: number,
  hour: number,
  sunsetIso?: string | null,
  currentIso?: string,
) {
  let score = 0;

  if (temperature < 10) score += 0;
  else if (temperature < 15) score += 20;
  else if (temperature <= 22) score += 35;
  else score += 28;

  if (condition === "sunny") score += 25;
  else if (condition === "partly-cloudy") score += 18;
  else if (condition === "cloudy") score += 8;
  else if (condition === "rainy") score -= 25;

  if (wind < 5) score += 15;
  else if (wind < 8) score += 8;
  else if (wind < 12) score -= 5;
  else score -= 18;

  if (precipitation > 0) score -= 20;

  if (hour < 12) score += 0;
  else if (hour < 14) score += 6;
  else if (hour < 16) score += 12;
  else if (hour < 22) score += 25;
  else score += 10;

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

export function getConditionLabel(condition: WeatherCondition) {
  const labels: Record<WeatherCondition, string> = {
    sunny: "Sol",
    "partly-cloudy": "Delvis skyet",
    cloudy: "Overskyet",
    rainy: "Regn",
  };

  return labels[condition];
}

export const BEST_TIME_OF_DAY_BONUS = 25;

export function calculateUtepilsScoreWithoutTime(
  temperature: number,
  wind: number,
  condition: WeatherCondition,
  precipitation: number,
) {
  let score = 0;

  if (temperature < 10) score += 0;
  else if (temperature < 15) score += 20;
  else if (temperature <= 22) score += 35;
  else score += 28;

  if (condition === "sunny") score += 25;
  else if (condition === "partly-cloudy") score += 18;
  else if (condition === "cloudy") score += 8;
  else if (condition === "rainy") score -= 25;

  if (wind < 5) score += 15;
  else if (wind < 8) score += 8;
  else if (wind < 12) score -= 5;
  else score -= 18;

  if (precipitation > 0) score -= 20;

  return Math.max(0, Math.min(100, score));
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

export function mapSymbolToCondition(symbol?: string): WeatherCondition {
  if (!symbol) return "cloudy";
  if (symbol.includes("rain")) return "rainy";
  if (symbol.includes("clearsky")) return "sunny";
  if (symbol.includes("partlycloudy")) return "partly-cloudy";
  return "cloudy";
}
