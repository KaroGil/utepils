"use client";
import { useEffect, useState } from "react";
import { ForecastPoint } from "@/types/weather";
import {
  getForecastEmoji,
  getNextGoodUtepilsDay,
} from "../../lib/calculations";

export default function Forecast() {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [forecastLoading, setForecastLoading] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const res = await fetch("/api/utepils/bergen/forecast");
        const data = await res.json();

        console.log("forecast response", data);

        setForecast(data.predictions ?? []);
      } catch (error) {
        console.error("Could not load forecast", error);
      } finally {
        setForecastLoading(false);
      }
    }

    loadForecast();
  }, []);

  const nextGoodUtepilsDay = getNextGoodUtepilsDay(forecast);

  return (
    <section className="p-10">
      {forecastLoading ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          Laster varsel...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {forecast.map((day) => {
              const isNextGoodDay = nextGoodUtepilsDay?.date === day.date;

              return (
                <div
                  key={day.date}
                  className={[
                    "relative rounded-3xl border p-4 text-center shadow-sm transition-all",
                    isNextGoodDay
                      ? "border-amber-300 bg-amber-100 ring-2 ring-amber-300 shadow-md scale-[1.02]"
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
