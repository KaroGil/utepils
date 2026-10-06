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

/* Oslo clock time of an ISO timestamp as decimal hours, e.g. 19.5. */
function toOsloDecimalHour(iso: string | null | undefined, fallback: number) {
  if (!iso) return fallback;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallback;

  const [hours, minutes] = date
    .toLocaleTimeString("en-GB", {
      timeZone: "Europe/Oslo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .split(":")
    .map(Number);

  return hours + minutes / 60;
}

/*
 * Dark until an hour before sunrise, ramps up to full daylight an hour
 * after sunrise, and mirrors that around sunset.
 */
export function calculateDaylight(
  hour: number,
  sunsetIso?: string | null,
  sunriseIso?: string | null,
) {
  const sunriseHour = toOsloDecimalHour(sunriseIso, 6);
  const sunsetHour = toOsloDecimalHour(sunsetIso, 22);

  const morning =
    hour < sunriseHour - 1
      ? 0.1
      : hour < sunriseHour + 1
        ? 0.35 + ((hour - (sunriseHour - 1)) / 2) * 0.65
        : 1;

  const evening =
    hour >= sunsetHour + 1
      ? 0.1
      : hour <= sunsetHour - 1
        ? 1
        : 1 - ((hour - (sunsetHour - 1)) / 2) * 0.65;

  return Math.min(morning, evening);
}

function geometricMean(factors: number[]) {
  return (
    factors.reduce((product, factor) => product * clamp(factor), 1) **
    (1 / factors.length)
  );
}

export function calculateUtepilsScore(
  temperature: number,
  wind: number,
  symbol: string,
  precipitation: number,
  hour: number,
  sunsetIso?: string | null,
  currentIso?: string,
  sunriseIso?: string | null,
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
        calculateDaylight(hour, sunsetIso, sunriseIso),
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

export function getForecastEmoji(score: number) {
  if (score >= 80) return "☀️🍻";
  if (score >= 65) return "🍺🤏";
  if (score >= 45) return "😢";
  return "🍺🥶";
}

export function getNextGoodUtepilsDay(forecast: ForecastPoint[]) {
  return forecast.find((day) => day.score >= 75) ?? null;
}

