"use client";

import { useEffect, useState } from "react";
import { ForecastPoint } from "@/types/weather";
import {
  getForecastEmoji,
  getNextGoodUtepilsDay,
} from "../../lib/calculations";
import { getOsloDayKey } from "@/lib/time";

function getWeekday(date: string) {
  return new Date(date).toLocaleDateString("no-NO", {
    weekday: "long",
    timeZone: "UTC",
  });
}

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

  const todayKey = getOsloDayKey(new Date());

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
        Neste dager
      </p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
        Prognose for {locationNames[locationMode]}
      </h2>

      {isLoading ? (
        <p className="mt-6 text-sm font-semibold text-slate-500">
          Henter værbildet…
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {nextGoodUtepilsDay
              ? `🍻 Neste utepilsdag er ${getWeekday(nextGoodUtepilsDay.date)} · ${nextGoodUtepilsDay.score}%`
              : "Fant ingen tydelig god utepilsdag i prognosen akkurat nå."}
          </p>

          <ol className="mt-6 grid grid-cols-7 gap-1 sm:gap-2">
            {forecast.map((day) => {
              const isNextGoodDay = nextGoodUtepilsDay?.date === day.date;

              return (
                <li
                  key={day.date}
                  className={`flex flex-col items-center rounded-2xl px-1 py-3 text-center sm:py-4 ${
                    isNextGoodDay ? "bg-[var(--mint)]/50" : ""
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-300">
                    {day.date === todayKey ? "I dag" : day.label}
                  </span>
                  <span className="mt-3 whitespace-nowrap text-lg sm:text-3xl">
                    {getForecastEmoji(day.score)}
                  </span>
                  <span className="mt-2 text-base font-black tabular-nums text-[var(--ink)] sm:text-xl">
                    {day.score}%
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
}
