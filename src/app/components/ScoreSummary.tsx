import type { BergenResponse, WeatherData } from "@/types/weather";
import {
  getConditionLabel,
  getMeterColor,
  getWeatherEmoji,
} from "@/lib/calculations";

interface ScoreSummaryProps {
  data: BergenResponse | null;
  weather: WeatherData;
  time: string;
}

export default function ScoreSummary({
  data,
  weather,
  time,
}: ScoreSummaryProps) {
  const score = data?.score ?? 0;

  return (
    <section className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[var(--mint)]/50 blur-3xl"
      />

      <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            Akkurat nå · {data?.city ?? weather.city} · {time}
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[var(--ink)] sm:text-5xl lg:text-6xl">
            {data?.verdict.title}
          </h1>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
            {data?.verdict.subtitle}
          </p>

          <div className="mt-8">
            <div
              className="h-2 w-full rounded-full bg-slate-300/50 dark:bg-white/10"
              role="meter"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={score}
              aria-label="Utepils-score"
            >
              <div
                className={`h-2 rounded-full ${getMeterColor(score)} transition-all duration-700`}
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-slate-600 tabular-nums dark:text-slate-300">
              <span>🌡️ {weather.temperature}°C</span>
              <span>💨 {weather.wind} m/s</span>
              <span>
                {getWeatherEmoji(weather.symbol ?? "")}{" "}
                {getConditionLabel(weather.symbol)}
              </span>
              <span>💧 {weather.precipitation} mm</span>
            </p>
          </div>
        </div>

        <div className="order-first flex flex-row-reverse items-end justify-between gap-4 sm:order-none sm:flex-col sm:items-end">
          <span className="text-5xl sm:text-6xl" aria-hidden>
            {data?.verdict.emoji}
          </span>
          <p className="text-[7.5rem] font-black leading-[0.8] tracking-[-0.08em] text-[var(--ink)] tabular-nums sm:text-[9rem] lg:text-[12rem]">
            {score}
            <span className="ml-1 align-top text-4xl tracking-normal text-slate-400 sm:text-5xl">
              %
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
