import type { HourlyPoint } from "@/types/weather";
import { getVerdict } from "@/lib/calculations";
import { getConditionLabel, getWeatherEmoji } from "@/lib/conditions";

interface HourlyTooltipProps {
  point: HourlyPoint;
  isNow: boolean;
  left: number;
  top: number;
  below: boolean;
}

export default function HourlyTooltip({
  point,
  isNow,
  left,
  top,
  below,
}: HourlyTooltipProps) {
  return (
    <div
      className="pointer-events-none absolute z-10 w-44 rounded-2xl bg-[var(--ink)] p-3 text-white shadow-xl shadow-slate-900/20"
      style={{
        left,
        top,
        transform: below
          ? "translate(-50%, 18px)"
          : "translate(-50%, calc(-100% - 18px))",
      }}
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
        <span>{isNow ? "Nå" : `Kl. ${point.hour}`}</span>
        <span className="text-base">
          {getWeatherEmoji(point.symbol, point.night)}
        </span>
      </div>
      <p className="text-3xl font-black tracking-[-0.05em] tabular-nums">
        {point.score}
        <span className="ml-0.5 text-lg text-[var(--mint)]">%</span>
      </p>
      <p className="text-xs text-slate-300">
        {getVerdict(point.score).emoji} {getConditionLabel(point.symbol)}
      </p>
      <p className="mt-1.5 text-xs tabular-nums text-slate-300">
        {Math.round(point.temperature)}°C · {Math.round(point.wind)} m/s ·{" "}
        {point.precipitation} mm
      </p>
    </div>
  );
}
