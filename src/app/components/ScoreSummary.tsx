import InfoCard from "./InfoCard";
import type { BergenResponse, WeatherData } from "@/types/weather";
import { getConditionLabel, getMeterColor } from "@/lib/calculations";

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
    <section className="relative self-center overflow-hidden rounded-[2rem] border border-white/90 bg-[var(--paper)] p-5 shadow-[0_18px_50px_rgba(23,33,43,0.08)] dark:border-white/10 dark:shadow-black/20 sm:p-7">
      <div className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[var(--mint)]/60 blur-2xl" />
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="relative">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
            Akkurat nå
          </p>

          <h1 className="max-w-xl text-3xl font-black tracking-[-0.05em] text-[var(--ink)] sm:text-5xl">
            {data?.verdict.title}
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
            {data?.verdict.subtitle}
          </p>
        </div>

        <div className="relative rounded-2xl bg-[var(--mint)]/70 px-3 py-2 text-3xl sm:text-4xl">
          {data?.verdict.emoji}
        </div>
      </div>

      <div className="relative mb-5 rounded-[1.5rem] bg-[var(--ink)] p-5 text-white shadow-lg shadow-slate-900/10 dark:bg-[#d9eee2] dark:text-[#14241e]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
              Utepils-score
            </p>
            <p className="text-6xl font-black tracking-[-0.07em]">
              {score}
              <span className="ml-1 text-2xl text-[var(--mint)] dark:text-[#4b806b]">
                %
              </span>
            </p>
          </div>

          <div className="text-right text-sm text-slate-300 dark:text-slate-600">
            <p>{weather.city}</p>
            <p>{time}</p>
          </div>
        </div>

        <div className="mt-5 h-3 w-full rounded-full bg-white/15 dark:bg-black/10">
          <div
            className={`h-3 rounded-full ${getMeterColor(score)} transition-all duration-700`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Temperatur" value={`${weather.temperature}°C`} />
        <InfoCard label="Vind" value={`${weather.wind} m/s`} />
        <InfoCard label="Vær" value={getConditionLabel(weather.symbol)} />
        <InfoCard label="Nedbør" value={`${weather.precipitation} mm`} />
      </div>
    </section>
  );
}
