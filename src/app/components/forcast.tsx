"use client";
import { useEffect, useState } from "react";
import { ForecastPoint } from "@/types/weather";
import {
  getForecastEmoji,
  getNextGoodUtepilsDay,
} from "../../lib/calculations";

export default function Forecast({
  showLocalScore,
  coords,
}: {
  showLocalScore: boolean;
  coords: { lat: number; lon: number } | null;
}) {
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [localForecast, setLocalForecast] = useState<ForecastPoint[]>([]);
  const [forecastLoading, setForecastLoading] = useState(true);
  const [localForecastLoading, setLocalForecastLoading] = useState(false);

  useEffect(() => {
    async function loadBergenForecast() {
      try {
        const res = await fetch("/api/utepils/bergen/forecast");
        const data = await res.json();
        console.log("Bergen forecast data:", data);
        setForecast(data.predictions ?? []);
      } catch (error) {
        console.error("Could not load Bergen forecast", error);
      } finally {
        setForecastLoading(false);
      }
    }

    loadBergenForecast();
  }, []);

  useEffect(() => {
    if (!coords || !showLocalScore) return;

    async function loadLocalForecast() {
      try {
        setLocalForecastLoading(true);

        const res = await fetch(
          `/api/utepils/forecast?lat=${coords?.lat}&lon=${coords?.lon}`,
        );
        const data = await res.json();
        setLocalForecast(data.predictions ?? []);
      } catch (error) {
        console.error("Could not load local forecast", error);
      } finally {
        setLocalForecastLoading(false);
      }
    }

    loadLocalForecast();
  }, [coords, showLocalScore]);

  const activeForecast = showLocalScore ? localForecast : forecast;
  const isLoading = showLocalScore ? localForecastLoading : forecastLoading;

  const nextGoodUtepilsDay = getNextGoodUtepilsDay(activeForecast);

  return (
    <section className="p-10">
      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-slate-500">
          Laster varsel...
        </div>
      ) : (
        <>
          <p className="m-2 font-bold">
            Forecast for {showLocalScore ? "your location" : "Bergen"}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7">
            {activeForecast.map((day) => {
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
