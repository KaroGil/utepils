"use client";

import { useEffect } from "react";
import { X, Sunset } from "lucide-react";
import { WeatherData } from "@/types/weather";
import {
  getConditionLabel,
  calculateTemperature,
  calculateWind,
  calculatePrecipitation,
  calculateTimeOfDay,
  calculateCondition,
} from "../../lib/calculations";

interface ScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  weather: WeatherData;
  score: number;
  hour: number;
}

interface Step {
  label: string;
  pts: number;
}

interface FactorConfig {
  icon: string;
  name: string;
  value: string;
  points: number;
  steps: Step[];
  activeIndex: number;
}

function ptsStr(p: number) {
  return p > 0 ? `+${p}` : `${p}`;
}
function ptsColor(p: number) {
  if (p > 0) return "text-emerald-600";
  if (p < 0) return "text-rose-500";
  return "text-slate-400";
}

function StepScale({
  steps,
  activeIndex,
}: {
  steps: Step[];
  activeIndex: number;
}) {
  const activeNeg = steps[activeIndex]?.pts < 0;
  const activeColor = activeNeg ? "bg-rose-400" : "bg-emerald-400";

  return (
    <div className="mt-3 pl-12">
      <div className="flex items-start">
        {steps.map((s, i) => {
          const isActive = i === activeIndex;
          const leftFilled = i <= activeIndex;
          const rightFilled = i < activeIndex;

          return (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-center">
                <div
                  className={`h-[3px] flex-1 ${leftFilled ? activeColor : "bg-slate-300"}`}
                />
                <div
                  className={`rounded-full flex-shrink-0 border-2 border-white z-10 ${
                    isActive
                      ? `${activeNeg ? "bg-rose-400 outline-rose-400" : "bg-emerald-400 outline-emerald-400"} outline outline-2`
                      : leftFilled
                        ? `${activeColor} outline-none`
                        : "bg-slate-200 outline-none"
                  }`}
                />
                <div
                  className={`h-[3px] flex-1 ${rightFilled ? activeColor : "bg-slate-300"}`}
                />
              </div>
              <div className="mt-1 text-center px-0.5">
                <p
                  className={`text-[10px] leading-tight ${isActive ? "text-slate-900 font-medium" : "text-slate-500"}`}
                >
                  {s.label}
                </p>
                <p
                  className={`text-[10px] leading-tight ${isActive ? (activeNeg ? "text-rose-500" : "text-emerald-600") + " font-medium" : "text-slate-500"}`}
                >
                  {ptsStr(s.pts)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 27;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = score >= 75 ? "#2c9b5e" : score >= 45 ? "#ca8a04" : "#c94040";

  return (
    <div className="relative h-16 w-16 flex-shrink-0">
      <svg
        viewBox="0 0 64 64"
        className="w-16 h-16 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          className="stroke-slate-200"
          strokeWidth={5}
        />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[13px] font-medium text-slate-800">
        {score}%
      </div>
    </div>
  );
}

export default function ScoreModal({
  isOpen,
  onClose,
  weather,
  score,
  hour,
}: ScoreModalProps) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (isOpen) document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const tempPts = calculateTemperature(weather.temperature);
  const windPts = calculateWind(weather.wind);
  const precipPts = calculatePrecipitation(weather.precipitation);
  const timePts = calculateTimeOfDay(hour);
  const condPts = calculateCondition(weather.symbol);

  function getTempActiveIndex(temp: number) {
    if (temp < 5) return 0;
    if (temp < 8) return 1;
    if (temp < 15) return 2;
    if (temp <= 22) return 3;
    return 4;
  }
  function getCondActiveIndex(symbol: string) {
    const s = symbol.toLowerCase();
    if (s.includes("rain") || s.includes("snow")) return 0;
    if (s.includes("fog")) return 1;
    if (s.includes("cloudy") && !s.includes("partly")) return 2;
    if (s.includes("partlycloudy") || s.includes("fair")) return 3;
    return 4;
  }
  function getWindActiveIndex(wind: number) {
    if (wind >= 12) return 0;
    if (wind >= 8) return 1;
    if (wind >= 5) return 2;
    return 3;
  }
  function getTimeActiveIndex(h: number) {
    if (h < 10) return 0;
    if (h < 12) return 1;
    if (h < 16) return 2;
    if (h < 22) return 3;
    return 4;
  }

  const factors: FactorConfig[] = [
    {
      icon: "🌡️",
      name: "Temperatur",
      value: `${weather.temperature}°C`,
      points: tempPts,
      activeIndex: getTempActiveIndex(weather.temperature),
      steps: [
        { label: "Under 5°C", pts: 0 },
        { label: "5–8°C", pts: 10 },
        { label: "8–15°C", pts: 20 },
        { label: "15–22°C", pts: 35 },
        { label: "Over 22°C", pts: 28 },
      ],
    },
    {
      icon: condPts >= 20 ? "☀️" : condPts >= 5 ? "⛅" : "🌧️",
      name: "Vær",
      value: getConditionLabel(weather.symbol),
      points: condPts,
      activeIndex: getCondActiveIndex(weather.symbol),
      steps: [
        { label: "Regn/snø", pts: -25 },
        { label: "Tåke", pts: -10 },
        { label: "Overskyet", pts: 8 },
        { label: "Delvis skyet", pts: 25 },
        { label: "Klarvær", pts: 35 },
      ],
    },
    {
      icon: weather.wind < 5 ? "🍃" : weather.wind < 12 ? "💨" : "🌬️",
      name: "Vind",
      value: `${weather.wind} m/s`,
      points: windPts,
      activeIndex: getWindActiveIndex(weather.wind),
      steps: [
        { label: "Over 12 m/s", pts: -18 },
        { label: "8–12 m/s", pts: -5 },
        { label: "5–8 m/s", pts: 8 },
        { label: "Under 5 m/s", pts: 15 },
      ],
    },
    {
      icon: weather.precipitation === 0 ? "✅" : "☔",
      name: "Nedbør",
      value:
        weather.precipitation === 0 ? "Tørt" : `${weather.precipitation} mm`,
      points: precipPts,
      activeIndex: weather.precipitation === 0 ? 1 : 0,
      steps: [
        { label: "Nedbør", pts: -20 },
        { label: "Tørt", pts: 10 },
      ],
    },
    {
      icon: hour >= 16 && hour < 22 ? "🍻" : hour >= 12 ? "🕐" : "🌅",
      name: "Tid på dagen",
      value: `${hour.toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`,
      points: timePts,
      activeIndex: getTimeActiveIndex(hour),
      steps: [
        { label: "Før 10", pts: 0 },
        { label: "10–12", pts: 6 },
        { label: "12–16", pts: 12 },
        { label: "16–22", pts: 25 },
        { label: "Etter 22", pts: 10 },
      ],
    },
  ];

  const timeStr = new Date().toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Score-forklaring"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl sm:mx-4 max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm rounded-t-3xl sm:rounded-t-3xl border-b border-slate-100 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <ScoreRing score={score} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
                  Utepils-score
                </p>
                <p className="text-xl font-semibold text-slate-900 leading-tight">
                  {score >= 75
                    ? "Nå er det utepilstid!"
                    : score >= 45
                      ? "Det kan bli utepils"
                      : "Innepils i dag"}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {weather.city} · {timeStr}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors"
              aria-label="Lukk"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Hva påvirker scoren
          </p>

          <div className="divide-y divide-slate-100">
            {factors.map((f) => (
              <div key={f.name} className="py-4">
                <div className="grid grid-cols-[36px_1fr_auto] gap-x-3 items-start">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-base mt-0.5">
                    {f.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.value}</p>
                  </div>
                  <div
                    className={`text-sm font-semibold tabular-nums pt-0.5 ${ptsColor(f.points)}`}
                  >
                    {ptsStr(f.points)}
                  </div>
                </div>

                <StepScale steps={f.steps} activeIndex={f.activeIndex} />
              </div>
            ))}
          </div>

          {/* Sunset note */}
          <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <Sunset size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 leading-relaxed">
              <span className="font-medium text-slate-600">Solnedgang</span> kan
              trekke ned scoren med opptil 20 poeng hvis du er innen én time fra
              mørket – denne faktoren hentes fra API-et og vises ikke separat
              ovenfor.
            </p>
          </div>

          {/* Best possible */}
          <div className="mt-3 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
              Beste mulige score eksempel
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Temperatur", value: "15–22°C", pts: 35 },
                { label: "Vær", value: "Klarvær", pts: 35 },
                { label: "Vind", value: "Under 5 m/s", pts: 15 },
                { label: "Nedbør", value: "Tørt", pts: 10 },
                { label: "Tid", value: "Kl. 16–22", pts: 25 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-white border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-400">{item.value}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">
                    +{item.pts}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2">
                <p className="text-[11px] font-medium text-emerald-700">
                  Maks total
                </p>
                <span className="text-sm font-semibold text-emerald-600">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
