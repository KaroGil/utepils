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
  }, [locationMode, coords?.lat, coords?.lon]);

  const nextGoodUtepilsDay = getNextGoodUtepilsDay(forecast);

  return (
    <section className="p-10">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          Laster varsel...
        </div>
      ) : (
        <>
          <p className="m-2 font-bold">
            Prognose for {locationNames[locationMode]}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {forecast.map((day) => {
              const isNextGoodDay = nextGoodUtepilsDay?.date === day.date;

              return (
                <div
                  key={day.date}
                  className={[
                    "relative rounded-3xl border p-4 text-center shadow-sm transition-all",
                    isNextGoodDay
                      ? "scale-[1.02] border-amber-300 bg-amber-100 shadow-md ring-2 ring-amber-300"
                      : "border-white/70 bg-white/90",
                  ].join(" ")}
                >
                  {isNextGoodDay && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-900 shadow-sm">
                      Neste utepilsdag
                    </div>
                  )}

                  <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
                    {day.label}
                  </p>

                  <div className="mt-4 text-5xl">
                    {getForecastEmoji(day.score)}
                  </div>

                  <p className="mt-3 text-lg font-bold tabular-nums text-slate-900">
                    {day.score}%
                  </p>
                </div>
              );
            })}
          </div>

          {!nextGoodUtepilsDay && (
            <p className="mt-4 text-center text-sm text-slate-500">
              Fant ingen tydelig god utepilsdag i prognosen akkurat nå.
            </p>
          )}
        </>
      )}
    </section>
  );
}
