"use client";
import { fetchWeather } from "@/lib/weather";
import { useEffect, useState } from "react";
import InfoCard from "./components/InfoCard";
import ReasonRow from "./components/ReasonRow";
import { WeatherData } from "@/types/weather";
import {
  calculateUtepilsScore,
  getVerdict,
  getBackgroundClass,
  getMeterColor,
  getConditionLabel,
} from "./util/calculations";

export default function Page() {
  const now = new Date();
  const hour = now.getHours();
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    wind: 0,
    precipitation: 0,
    condition: "cloudy",
    city: "",
  });

  useEffect(() => {
    async function load() {
      const weather = await fetchWeather(60.39299, 5.32415); //Bergen
      setWeather(weather);
    }

    load();
  }, []);

  const score = calculateUtepilsScore(
    weather.temperature,
    weather.wind,
    weather.condition,
    weather.precipitation,
    hour,
  );

  const verdict = getVerdict(score);
  const backgroundClass = getBackgroundClass(score);
  const meterColor = getMeterColor(score);
  const conditionLabel = getConditionLabel(weather.condition);

  return (
    <main
      className={`min-h-screen bg-linear-to-br ${backgroundClass} text-slate-900`}
    >
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-6">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-4xl bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600">
                  Utepils-meter
                </p>
                <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
                  {verdict.title}
                </h1>
                <p className="mt-3 max-w-xl text-lg text-slate-700">
                  {verdict.subtitle}
                </p>
              </div>
              <div className="text-5xl sm:text-6xl">{verdict.emoji}</div>
            </div>

            <div className="mb-6 rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                    Utepils-score
                  </p>
                  <p className="text-6xl font-black">{score}%</p>
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
                  style={{ width: `${score}%` }}
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
                title={`Temperatur ${weather.temperature}°C`}
                description={
                  weather.temperature >= 15 && weather.temperature <= 22
                    ? "Perfekt temperatur for å sitte ute lenge"
                    : weather.temperature < 15
                      ? "Litt kjølig, men ikke umulig"
                      : "Varmt nok til god stemning"
                }
              />

              <ReasonRow
                title={`Tid på dagen ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`}
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
                description={
                  weather.wind < 5 && weather.precipitation === 0
                    ? "Lite vind og tørt vær trekker opp stemningen"
                    : "Vind eller nedbør trekker stemningen ned"
                }
              />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
