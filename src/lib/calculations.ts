import { ForecastPoint } from "@/types/weather";
import { isSeventeenthOfMay } from "@/lib/time";

function calculateTemperature(temperature: number) {
  if (temperature < 5) return 0;
  if (temperature < 8) return 10;
  if (temperature < 15) return 20;
  if (temperature <= 22) return 35;
  if (temperature > 37) return 20;
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
    if (s.includes("night")) return 15; // less good than day
    return 35;
  }

  // 🌤 Fair (nice but not perfect)
  if (s.includes("fair")) {
    if (s.includes("night")) return 8;
    return 20;
  }

  // ⛅ Partly cloudy
  if (s.includes("partlycloudy")) {
    if (s.includes("night")) return 5;
    return 25;
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
  return 10;
}

function calculateTimeOfDay(hour: number) {
  if (hour < 10) return 0;
  if (hour < 12) return 6;
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
  if (currentIso && isSeventeenthOfMay(currentIso)) {
    return 100;
  }

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
  if (score == 100 && isSeventeenthOfMay(new Date().toISOString())) {
    return {
      title: "Gratulerer med dagen 🇳🇴 ",
      subtitle: "Utepils er obligatorisk!",
      emoji: "🇳🇴🥂",
    };
  }

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
    // Clear / sky
    clearsky_day: "Sol",
    clearsky_night: "Klart",
    clearsky_polartwilight: "Klart",

    fair_day: "Lettskyet",
    fair_night: "Lettskyet",
    fair_polartwilight: "Lettskyet",

    partlycloudy_day: "Delvis skyet",
    partlycloudy_night: "Delvis skyet",
    partlycloudy_polartwilight: "Delvis skyet",

    cloudy: "Overskyet",

    // Fog
    fog: "Tåke",

    // Rain
    lightrain: "Lett regn",
    rain: "Regn",
    heavyrain: "Kraftig regn",

    lightrainshowers_day: "Lette regnbyger",
    lightrainshowers_night: "Lette regnbyger",
    lightrainshowers_polartwilight: "Lette regnbyger",

    rainshowers_day: "Regnbyger",
    rainshowers_night: "Regnbyger",
    rainshowers_polartwilight: "Regnbyger",

    heavyrainshowers_day: "Kraftige regnbyger",
    heavyrainshowers_night: "Kraftige regnbyger",
    heavyrainshowers_polartwilight: "Kraftige regnbyger",

    // Snow
    lightsnow: "Lett snø",
    snow: "Snø",
    heavysnow: "Kraftig snø",

    lightsnowshowers_day: "Lette snøbyger",
    lightsnowshowers_night: "Lette snøbyger",
    lightsnowshowers_polartwilight: "Lette snøbyger",

    snowshowers_day: "Snøbyger",
    snowshowers_night: "Snøbyger",
    snowshowers_polartwilight: "Snøbyger",

    heavysnowshowers_day: "Kraftige snøbyger",
    heavysnowshowers_night: "Kraftige snøbyger",
    heavysnowshowers_polartwilight: "Kraftige snøbyger",

    // Sleet (rain + snow)
    sleet: "Sludd",
    lightsleet: "Lett sludd",
    heavysleet: "Kraftig sludd",

    sleetshowers_day: "Sluddbyger",
    sleetshowers_night: "Sluddbyger",
    sleetshowers_polartwilight: "Sluddbyger",

    lightsleetshowers_day: "Lette sluddbyger",
    lightsleetshowers_night: "Lette sluddbyger",
    lightsleetshowers_polartwilight: "Lette sluddbyger",

    heavysleetshowers_day: "Kraftige sluddbyger",
    heavysleetshowers_night: "Kraftige sluddbyger",
    heavysleetshowers_polartwilight: "Kraftige sluddbyger",

    // Thunder
    thunderstorm: "Tordenvær",

    lightrainandthunder: "Lett regn og torden",
    rainandthunder: "Regn og torden",
    heavyrainandthunder: "Kraftig regn og torden",

    lightsnowandthunder: "Lett snø og torden",
    snowandthunder: "Snø og torden",
    heavysnowandthunder: "Kraftig snø og torden",

    sleetandthunder: "Sludd og torden",
    lightsleetandthunder: "Lett sludd og torden",
    heavysleetandthunder: "Kraftig sludd og torden",
  };

  return labels[condition] ?? "Ukjent";
}

export function getForecastEmoji(score: number) {
  if (score >= 80) return "☀️🍻";
  if (score >= 65) return "🍺🤏";
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
