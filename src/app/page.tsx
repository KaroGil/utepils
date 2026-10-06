"use client";

import { useEffect, useState } from "react";
import { CalendarDays, RotateCw } from "lucide-react";
import Forecast from "./components/Forecast";
import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";
import ScoreBackground from "./components/ScoreBackground";
import HourlyScoreChart from "./components/HourlyScoreChart";
import LocationSelector from "./components/LocationSelector";
import ScoreSummary from "./components/ScoreSummary";
import ScoreFactors from "./components/ScoreFactors";
import NorwegianFlagsBackground from "./components/norwegianFlags";
import { UtepilsResponse, WeatherData } from "@/types/weather";
import { getOsloHour, isSeventeenthOfMay } from "@/lib/time";
import { cities } from "@/lib/cities";
import { LocationMode } from "@/lib/locations";

export default function Page() {
  const now = new Date();
  const hour = getOsloHour(now);

  const [isLoading, setIsLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>("bergen");

  const [activeData, setActiveData] = useState<UtepilsResponse | null>(null);

  const [coords, setCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    wind: 0,
    precipitation: 0,
    city: "",
    symbol: "sunny",
  });

  const [showForecast, setShowForecast] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);

  function handleLocationChange(mode: LocationMode) {
    setLocationNotice(null);
    setLocationMode(mode);
  }

  /*
   * Get the user's coordinates when "Min posisjon" is selected.
   */
  useEffect(() => {
    if (locationMode !== "local" || coords) {
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      setLocationNotice(
        "Nettleseren din støtter ikke posisjon – viser Bergen i stedet.",
      );
      setLocationMode("bergen");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);

        // Return to Bergen if the user denies location access.
        setLocationNotice(
          "Fikk ikke tilgang til posisjonen din – viser Bergen i stedet.",
        );
        setLocationMode("bergen");
      },
    );
  }, [locationMode, coords]);

  /*
   * Fetch data for Bergen, Oslo, or the user's location.
   */
  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      /*
       * Wait for the browser to provide coordinates before fetching
       * local weather.
       */
      if (locationMode === "local" && !coords) {
        setIsLoading(true);
        return;
      }

      setIsLoading(true);

      try {
        let url: string;

        if (locationMode === "local") {
          const params = new URLSearchParams({
            lat: String(coords!.lat),
            lon: String(coords!.lon),
          });

          url = `/api/utepils?${params.toString()}`;
        } else {
          url = `/api/utepils/${cities[locationMode].slug}`;
        }

        const response = await fetch(url, {
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok || !data.weather) {
          throw new Error(data.error ?? `Could not load ${locationMode} data`);
        }

        setActiveData(data);
        setWeather(data.weather);
        setError(null);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error(`Failed to load ${locationMode} data:`, error);

        // Don't show the previous location's score as if it were this one.
        setActiveData(null);
        setError("Klarte ikke å hente værdata akkurat nå.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [locationMode, coords, reloadKey]);

  return (
    <main className="min-h-screen overflow-hidden px-4 py-3 text-slate-900 sm:px-8 sm:py-5">
      <ScoreBackground score={activeData?.score ?? null} />

      {isSeventeenthOfMay(new Date().toISOString()) && (
        <NorwegianFlagsBackground />
      )}

      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-4 flex flex-col gap-3 border-b border-slate-300/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--ink)]">
              Utepils-meter
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2">
            <LocationSelector
              value={locationMode}
              onChange={handleLocationChange}
            />
            <button
              type="button"
              onClick={() => setShowForecast((previous) => !previous)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--coral)]"
              aria-expanded={showForecast}
            >
              <CalendarDays size={16} />
              {showForecast ? "Skjul prognose" : "Se 7-dagers prognose"}
            </button>
          </div>
        </header>

        {locationNotice && (
          <p
            role="status"
            className="mb-4 text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            📍 {locationNotice}
          </p>
        )}

        {showForecast && (
          <div className="animate-rise-in border-b border-slate-300/50 pb-8 pt-4">
            <Forecast locationMode={locationMode} coords={coords} />
          </div>
        )}

        {isLoading ? (
          <LoadingScreen />
        ) : error ? (
          <div role="alert" className="animate-rise-in pb-12 pt-4 sm:pt-8">
            <h1 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
              Oi, her ble det tørt 🍺🤷
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {error} Prøv igjen om litt.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full border border-slate-300/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--coral)]"
            >
              <RotateCw size={16} />
              Prøv igjen
            </button>
          </div>
        ) : (
          <div className="pb-12">
            <div className="animate-rise-in pt-4 sm:pt-8">
              <ScoreSummary
                data={activeData}
                weather={weather}
                time={now.toLocaleTimeString("no-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>

            <div className="animate-rise-in-delay mt-12 border-t border-slate-300/50 pt-8 sm:mt-16">
              <HourlyScoreChart hourly={activeData?.hourly ?? []} />
            </div>

            <div className="animate-rise-in-delay my-10 border-t border-slate-300/50 pt-8">
              <ScoreFactors
                score={activeData?.score ?? 0}
                weather={weather}
                hour={hour}
                sunset={activeData?.sun?.sunset ?? null}
                sunrise={activeData?.sun?.sunrise ?? null}
              />
            </div>
          </div>
        )}

        <Footer />
      </div>
    </main>
  );
}
