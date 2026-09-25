import { ForecastPoint } from "@/types/weather";
import { isSeventeenthOfMay } from "@/lib/time";

const OPTIMAL_TEMPERATURE = 22;
const COLD_TEMPERATURE_SCALE = 12;
const WARM_TEMPERATURE_SCALE = 15;
const WIND_SCALE = 8;
const PRECIPITATION_HALF_SCORE = 0.5;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function calculateTemperature(temperature: number) {
  const scale =
    temperature < OPTIMAL_TEMPERATURE
      ? COLD_TEMPERATURE_SCALE
      : WARM_TEMPERATURE_SCALE;

  return clamp(Math.exp(-(((temperature - OPTIMAL_TEMPERATURE) / scale) ** 2)));
}

export function calculateCondition(symbol?: string) {
  if (!symbol) return 0.45;

  const normalized = symbol.toLowerCase();

  if (normalized.includes("thunder")) return 0.25;
  if (normalized.includes("snow")) return 0.25;
  if (normalized.includes("rain")) return 0.35;
  if (normalized.includes("sleet")) return 0.25;
  if (normalized.includes("fog")) return 0.35;
  if (normalized.includes("clearsky")) {
    return normalized.includes("night") ? 0.6 : 1;
  }
  if (normalized.includes("fair")) {
    return normalized.includes("night") ? 0.55 : 0.85;
  }
  if (normalized.includes("partlycloudy")) {
    return normalized.includes("night") ? 0.55 : 0.75;
  }

  return 0.45;
}

export function calculateWind(wind: number) {
  return clamp(Math.exp(-(Math.max(0, wind / WIND_SCALE) ** 4)));
}

export function calculatePrecipitation(precipitation: number) {
  const amount = Math.max(0, precipitation);
  return clamp(1 / (1 + (amount / PRECIPITATION_HALF_SCORE) ** 2));
}

export function calculateDaylight(hour: number, sunsetIso?: string | null) {
  let sunsetHour = 22;

  if (sunsetIso) {
    const sunset = new Date(sunsetIso);
    if (!Number.isNaN(sunset.getTime())) {
      const sunsetTime = sunset.toLocaleTimeString("en-GB", {
        timeZone: "Europe/Oslo",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const [hours, minutes] = sunsetTime.split(":").map(Number);
      sunsetHour = hours + minutes / 60;
    }
  }

  if (hour < 5 || hour >= sunsetHour + 1) return 0.1;
  if (hour < 7) return 0.35 + ((hour - 5) / 2) * 0.65;
  if (hour <= sunsetHour - 1) return 1;

  return 1 - ((hour - (sunsetHour - 1)) / 2) * 0.65;
}

function geometricMean(factors: number[]) {
  return (
    factors.reduce((product, factor) => product * clamp(factor), 1) **
    (1 / factors.length)
  );
}

export function calculateTimeOfDay(hour: number, sunsetIso?: string | null) {
  return calculateDaylight(hour, sunsetIso);
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

  return Math.round(
    100 *
      geometricMean([
        calculateTemperature(temperature),
        calculateWind(wind),
        calculateCondition(symbol),
        calculatePrecipitation(precipitation),
        calculateTimeOfDay(hour, sunsetIso),
      ]),
  );
}

export const BEST_TIME_OF_DAY_BONUS = 0;

export function calculateUtepilsScoreWithoutTime(
  temperature: number,
  wind: number,
  condition: string,
  precipitation: number,
) {
  return Math.round(
    100 *
      geometricMean([
        calculateTemperature(temperature),
        calculateWind(wind),
        calculateCondition(condition),
        calculatePrecipitation(precipitation),
      ]),
  );
}

export function getVerdict(score: number) {
  if (score == 100 && isSeventeenthOfMay(new Date().toISOString())) {
    return {
      title: "Gratulerer med dagen 🇳🇴 ",
      subtitle: "Utepils er obligatorisk!",
      emoji: "🇳🇴🥂",
    };
  }

  if (score >= 90) {
    return {
      title: "UTEPILS IDYLL! ☀️🍻",
      subtitle: "Eksepsjonelle utepilsforhold",
      emoji: "😎",
    };
  }

  if (score >= 80) {
    return {
      title: "UTEPILS! 🍻",
      subtitle: "Svært gode forhold",
      emoji: "🍻",
    };
  }

  if (score >= 65) {
    return {
      title: "Hvem blir med på utepils? 🙂‍↕️",
      subtitle: "Planlegg utepils",
      emoji: "🍺",
    };
  }

  if (score >= 45) {
    return {
      title: "Det kan bli utepils 😌",
      subtitle: "Litt situasjonsavhengig, men absolutt mulig",
      emoji: "⛅",
    };
  }

  if (score >= 25) {
    return {
      title: "Kun for de mest motiverte",
      subtitle: "Velg et skjermet sted og kle deg etter forholdene",
      emoji: "🌧️",
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
