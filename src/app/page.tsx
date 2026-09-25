"use client";

import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import Forecast from "./components/forcast";
import LoadingScreen from "./components/LoadingScreen";
import HourlyScoreChart from "./components/HourlyScoreChart";
import LocationSelector from "./components/LocationSelector";
import ScoreSummary from "./components/ScoreSummary";
import ScoreReasons from "./components/ScoreReasons";
import NorwegianFlagsBackground from "./components/norwegianFlags";
import { BergenResponse, WeatherData } from "@/types/weather";
import { getOsloHour, isSeventeenthOfMay } from "@/lib/time";
import { cities } from "@/lib/cities";

type LocationMode = "bergen" | "oslo" | "local";

export default function Page() {
  const now = new Date();
  const hour = getOsloHour(now);

  const [isLoading, setIsLoading] = useState(true);
  const [locationMode, setLocationMode] = useState<LocationMode>("bergen");

  const [activeData, setActiveData] = useState<BergenResponse | null>(null);

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

  /*
   * Get the user's coordinates when "Min posisjon" is selected.
   */
  useEffect(() => {
    if (locationMode !== "local" || coords) {
      return;
    }

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
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
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        console.error(`Failed to load ${locationMode} data:`, error);
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
  }, [locationMode, coords]);

  return (
    <main className="min-h-screen overflow-hidden px-4 py-3 text-slate-900 sm:px-8 sm:py-5">
      {isSeventeenthOfMay(new Date().toISOString()) && (
        <NorwegianFlagsBackground />
      )}

      <div className="relative z-10 mx-auto max-w-337.5">
        <header className="mb-4 flex flex-col gap-3 border-b border-slate-300/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-3">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--ink)]">
              Utepils-meter
            </p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-2">
            <LocationSelector value={locationMode} onChange={setLocationMode} />
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

        {showForecast && (
          <Forecast locationMode={locationMode} coords={coords} />
        )}

        {isLoading ? (
          <LoadingScreen />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-rise-in">
              <ScoreSummary
                data={activeData}
                weather={weather}
                time={now.toLocaleTimeString("no-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>

            <div className="animate-rise-in-delay">
              <ScoreReasons
                data={activeData}
                weather={weather}
                hour={hour}
                time={now.toLocaleTimeString("no-NO", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>

            <div className="animate-rise-in-delay lg:col-span-2">
              <HourlyScoreChart hourly={activeData?.hourly ?? []} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
