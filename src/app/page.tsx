"use client";

import { useEffect, useState } from "react";
import InfoCard from "./components/InfoCard";
import ReasonRow from "./components/ReasonRow";
import { BergenResponse, WeatherData } from "@/types/weather";
import {
  getBackgroundClass,
  getMeterColor,
  getConditionLabel,
} from "../lib/calculations";
import Forecast from "./components/forcast";
import LoadingScreen from "./components/LoadingScreen";

export default function Page() {
  const now = new Date();
  const hour = now.getHours();

  const [isLoading, setIsLoading] = useState(true);
  const [showLocalScore, setShowLocalScore] = useState(false);
  const [localData, setLocalData] = useState<BergenResponse | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    wind: 0,
    precipitation: 0,
    city: "",
    symbol: "sunny",
  });
  const [showForecast, setShowForecast] = useState(false);
  const [bergendata, setBergenData] = useState<BergenResponse | null>(null);

  useEffect(() => {
    if (bergendata) return;

    const fetchBergen = async () => {
      const res = await fetch("/api/utepils/bergen");
      const data = await res.json();
      setBergenData(data);
      setWeather(data.weather);
    };

    fetchBergen();
  }, [bergendata]);

  useEffect(() => {
    if (!showLocalScore) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  }, [showLocalScore]);

  const lat = coords?.lat ?? 60.39299;
  const lon = coords?.lon ?? 5.32415;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url =
          showLocalScore && coords
            ? `/api/utepils?lat=${lat}&lon=${lon}`
            : "/api/utepils/bergen"; // Fallback to Bergen if no coords

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok || !data.weather) {
          return;
        }
        setWeather(data.weather);
        setLocalData(data);
      } catch (error) {
        console.error("Failed to load Bergen data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showLocalScore, coords, lat, lon]);

  const activeData = showLocalScore ? localData : bergendata;

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
      <button
        className="flex flex-col gap-1 absolute top-4 right-4 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed"
        onClick={() => setShowForecast((prev) => !prev)}
      >
        <span className="h-0.5 w-3 bg-slate-900"></span>
        <span className="h-0.5 w-3 bg-slate-900"></span>
        <span className="h-0.5 w-3 bg-slate-900"></span>
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowLocalScore((prev) => !prev)}
          className={`relative inline-flex h-6 m-3 w-11 items-center rounded-full transition-colors ${
            showLocalScore ? "bg-blue-300" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showLocalScore ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-sm font-medium">
          {showLocalScore ? "📌 Local" : "📌 Bergen"}
        </span>
      </div>
      {showForecast && (
        <Forecast showLocalScore={showLocalScore} coords={coords} />
      )}
      <div
        className={`mx-auto flex ${!showForecast && "min-h-screen"} max-w-337.5 items-center justify-center p-6`}
      >
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-4xl bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
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
                  style={{ width: `${activeData?.score}%` }}
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
            <h2 className="text-2xl font-bold">
              Hvorfor fikk du denne scoren?
            </h2>

            <div className="mt-6 space-y-4">
              <ReasonRow
                title="Temperatur"
                value={` ${weather.temperature}°C`}
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
                value={`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`}
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
                  bergendata?.peakToday?.time
                    ? `Kl. ${bergendata.peakToday.time}`
                    : "—"
                }
                description={
                  bergendata?.peakToday?.score != null
                    ? `Beste estimerte utepilsstemning i dag er rundt dette tidspunktet (${bergendata.peakToday.score}%).`
                    : "Fant ikke noe tydelig peak-tidspunkt i dag."
                }
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
