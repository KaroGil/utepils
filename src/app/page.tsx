"use client";

import { useEffect, useState } from "react";
import { HelpCircle } from "lucide-react";
import InfoCard from "./components/InfoCard";
import ReasonRow from "./components/ReasonRow";
import Forecast from "./components/forcast";
import LoadingScreen from "./components/LoadingScreen";
import ScoreModal from "./components/ScoreModal";
import NorwegianFlagsBackground from "./components/norwegianFlags";
import { BergenResponse, WeatherData } from "@/types/weather";
import {
  getBackgroundClass,
  getMeterColor,
  getConditionLabel,
} from "../lib/calculations";
import { isSeventeenthOfMay } from "@/lib/time";
import { cities } from "@/lib/cities";

type LocationMode = "bergen" | "oslo" | "local";

export default function Page() {
  const now = new Date();
  const hour = now.getHours();

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
  const [showModal, setShowModal] = useState(false);

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

  const backgroundClass = getBackgroundClass(activeData?.score ?? 0);

  const meterColor = getMeterColor(activeData?.score ?? 0);
  const conditionLabel = getConditionLabel(weather.symbol);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main
      className={`min-h-screen bg-linear-to-br ${backgroundClass} text-slate-900`}
    >
      {isSeventeenthOfMay(new Date().toISOString()) && (
        <NorwegianFlagsBackground />
      )}

      <button
        type="button"
        className="absolute top-4 right-4 flex flex-col gap-1 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed"
        onClick={() => {
          setShowForecast((previous) => !previous);
        }}
        aria-label="Vis eller skjul værmelding"
      >
        <span className="h-0.5 w-3 bg-slate-900" />
        <span className="h-0.5 w-3 bg-slate-900" />
        <span className="h-0.5 w-3 bg-slate-900" />
      </button>

      <div className="flex items-center gap-3 p-3">
        <label htmlFor="location" className="text-sm font-medium">
          📌 Sted
        </label>

        <select
          id="location"
          value={locationMode}
          onChange={(event) => {
            setLocationMode(event.target.value as LocationMode);
          }}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <option value="bergen">Bergen</option>
          <option value="oslo">Oslo</option>
          <option value="local">Min posisjon</option>
        </select>
      </div>

      {showForecast && <Forecast locationMode={locationMode} coords={coords} />}

      <div
        className={`mx-auto flex ${
          !showForecast ? "min-h-screen" : ""
        } max-w-337.5 items-center justify-center p-6`}
      >
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="self-center rounded-4xl bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Utepils-meter
                </p>

                <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                  {activeData?.verdict.title}
                </h1>

                <p className="mt-3 max-w-xl text-lg text-slate-700">
                  {activeData?.verdict.subtitle}
                </p>
              </div>

              <div className="text-5xl sm:text-6xl">
                {activeData?.verdict.emoji}
              </div>
            </div>

            <div className="mb-6 rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                    Utepils-score
                  </p>

                  <p className="text-6xl font-black">{activeData?.score}%</p>
                </div>

                <div className="text-right text-sm text-slate-300">
                  <p>{weather.city}</p>

                  <p>
                    {now.toLocaleTimeString("no-NO", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5 h-4 w-full rounded-full bg-white/15">
                <div
                  className={`h-4 rounded-full ${meterColor} transition-all duration-700`}
                  style={{
                    width: `${activeData?.score ?? 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Temperatur" value={`${weather.temperature}°C`} />

              <InfoCard label="Vind" value={`${weather.wind} m/s`} />

              <InfoCard label="Vær" value={conditionLabel} />

              <InfoCard label="Nedbør" value={`${weather.precipitation} mm`} />
            </div>
          </section>

          <aside className="rounded-4xl bg-white/60 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex flex-row items-center justify-between gap-2">
              <h2 className="text-2xl font-bold">
                Hvorfor fikk du denne scoren?
              </h2>

              <HelpCircle
                size={22}
                className="cursor-pointer text-gray-400 transition-colors hover:text-gray-600"
                onClick={() => setShowModal(true)}
              />
            </div>

            <div className="mt-6 space-y-4">
              <ReasonRow
                title="Temperatur"
                value={`${weather.temperature}°C`}
                description={
                  weather.temperature >= 15 && weather.temperature <= 22
                    ? "Perfekt temperatur for å sitte ute lenge"
                    : weather.temperature < 15
                      ? "Litt kjølig, men ikke umulig"
                      : "Varmt nok til god stemning"
                }
              />

              <ReasonRow
                title="Tid på dagen"
                value={`${now.getHours().toString().padStart(2, "0")}:${now
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`}
                description={
                  hour >= 16 && hour < 22
                    ? "Prime time for utepils"
                    : hour >= 12
                      ? "Det nærmer seg, men ikke helt peak ennå"
                      : "Fortsatt litt tidlig for full utepilsfølelse"
                }
              />

              <ReasonRow
                title="Vind og nedbør"
                value={`${weather.wind} m/s`}
                description={
                  weather.wind < 5 && weather.precipitation === 0
                    ? "Lite vind og tørt vær trekker opp stemningen"
                    : "Vind eller nedbør trekker stemningen ned"
                }
              />

              <ReasonRow
                title="Peak i dag"
                value={
                  activeData?.peakToday?.time
                    ? `Kl. ${activeData.peakToday.time}`
                    : "—"
                }
                description={
                  activeData?.peakToday?.score != null
                    ? `Beste estimerte utepilsstemning i dag er rundt dette tidspunktet (${activeData.peakToday.score}%).`
                    : "Fant ikke noe tydelig peak-tidspunkt i dag."
                }
              />
            </div>
          </aside>
        </div>
      </div>

      <ScoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        weather={weather}
        score={activeData?.score ?? 0}
        hour={hour}
      />
    </main>
  );
}
