"use client";

import { useEffect, useState } from "react";
import { ForecastPoint } from "@/types/weather";
import {
  getForecastEmoji,
  getNextGoodUtepilsDay,
} from "../../lib/calculations";

type LocationMode = "bergen" | "oslo" | "local";

interface ForecastProps {
  locationMode: LocationMode;
  coords: { lat: number; lon: number } | null;
}

const locationNames: Record<LocationMode, string> = {
  bergen: "Bergen",
  oslo: "Oslo",
  local: "din posisjon",
};

export default function Forecast({ locationMode, coords }: ForecastProps) {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (locationMode === "local" && !coords) {
      setForecast([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadForecast() {
      try {
        setIsLoading(true);

        const endpoint =
          locationMode === "local"
            ? `/api/utepils/forecast?lat=${coords!.lat}&lon=${coords!.lon}`
            : `/api/utepils/${locationMode}/forecast`;

        const res = await fetch(endpoint, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Forecast request failed: ${res.status}`);
        }

        const data = await res.json();
        setForecast(data.predictions ?? []);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        console.error(`Could not load ${locationMode} forecast`, error);
        setForecast([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadForecast();

    return () => controller.abort();
  }, [locationMode, coords]);

  const nextGoodUtepilsDay = getNextGoodUtepilsDay(forecast);

  return (
    <section className="mb-6 rounded-[2rem] border border-white/80 bg-[var(--paper)]/80 p-5 shadow-[0_18px_50px_rgba(23,33,43,0.08)] backdrop-blur-xl dark:border-white/10 dark:shadow-black/20 sm:p-6">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-sm font-semibold text-slate-500">
          Henter værbildet...
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                Neste dager
              </p>
              <p className="mt-1 text-xl font-black tracking-[-0.03em] text-[var(--ink)]">
                Prognose for {locationNames[locationMode]}
              </p>
            </div>
            <span className="hidden text-xs font-semibold text-slate-400 sm:block">
              Beste dag markeres
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {forecast.map((day) => {
              const isNextGoodDay = nextGoodUtepilsDay?.date === day.date;

              return (
                <div
                  key={day.date}
                  className={[
                    "relative rounded-2xl border p-4 text-center transition-all",
                    isNextGoodDay
                      ? "scale-[1.02] border-[var(--coral)] bg-[#fff0e9] shadow-md ring-2 ring-[var(--coral)]/30"
                      : "border-slate-200/80 bg-[var(--surface)] hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:hover:bg-white/10",
                  ].join(" ")}
                >
                  {isNextGoodDay && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[var(--coral)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-sm">
                      Neste utepilsdag
                    </div>
                  )}

                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-300">
                    {day.label}
                  </p>

                  <div className="mt-4 text-5xl">
                    {getForecastEmoji(day.score)}
                  </div>

                  <p className="mt-3 text-xl font-black tabular-nums text-[var(--ink)]">
                    {day.score}%
                  </p>
                </div>
              );
            })}
          </div>

          {!nextGoodUtepilsDay && (
            <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-300">
              Fant ingen tydelig god utepilsdag i prognosen akkurat nå.
            </p>
          )}
        </>
      )}
    </section>
  );
}
