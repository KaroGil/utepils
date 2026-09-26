import { ChevronDown } from "lucide-react";
import type { WeatherData } from "@/types/weather";
import {
  calculateCondition,
  calculateDaylight,
  calculatePrecipitation,
  calculateTemperature,
  calculateWind,
  getConditionLabel,
} from "@/lib/calculations";

interface ScoreFactorsProps {
  score: number;
  weather: WeatherData;
  hour: number;
  sunset: string | null;
  sunrise: string | null;
}

function getDaylightLabel(factor: number) {
  if (factor >= 1) return "Dagslys";
  if (factor <= 0.1) return "Mørkt";
  return "Skumring";
}

/*
 * The five factors behind the score, as the formula sees them (0–1).
 */
export default function ScoreFactors({
  score,
  weather,
  hour,
  sunset,
  sunrise,
}: ScoreFactorsProps) {
  const daylight = calculateDaylight(hour, sunset, sunrise);

  const factors = [
    {
      label: "Temperatur",
      value: `${weather.temperature}°C`,
      factor: calculateTemperature(weather.temperature),
    },
    {
      label: "Vind",
      value: `${weather.wind} m/s`,
      factor: calculateWind(weather.wind),
    },
    {
      label: "Himmel",
      value: getConditionLabel(weather.symbol),
      factor: calculateCondition(weather.symbol),
    },
    {
      label: "Nedbør",
      value: `${weather.precipitation} mm`,
      factor: calculatePrecipitation(weather.precipitation),
    },
    {
      label: "Dagslys",
      value: getDaylightLabel(daylight),
      factor: daylight,
    },
  ];

  const weakest = factors.reduce((low, f) => (f.factor < low.factor ? f : low));

  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--coral)] [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            Forklaring
          </span>
          <span className="mt-1 block text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
            Hvorfor {score}%?
          </span>
        </span>
        <ChevronDown
          size={22}
          className="shrink-0 text-slate-500 transition-transform group-open:rotate-180"
        />
      </summary>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        Scoren er et snitt av fem faktorer, og den svakeste trekker mest ned.
        Akkurat nå er det{" "}
        <strong className="text-[var(--ink)]">
          {weakest.label.toLowerCase()}
        </strong>
        .
      </p>

      <ul className="mt-5 space-y-3">
        {factors.map((f) => (
          <li
            key={f.label}
            className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[7rem_1fr_7rem] sm:gap-5"
          >
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {f.label}
            </span>
            <span className="h-2 rounded-full bg-slate-300/50 dark:bg-white/10">
              <span
                className={`block h-2 rounded-full transition-all duration-700 ${
                  f === weakest ? "bg-[var(--coral)]" : "bg-[var(--ink)]"
                }`}
                style={{ width: `${Math.round(f.factor * 100)}%` }}
              />
            </span>
            <span className="text-right text-slate-500 tabular-nums dark:text-slate-400">
              {f.value}
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
