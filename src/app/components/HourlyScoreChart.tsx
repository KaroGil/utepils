"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { HourlyPoint } from "@/types/weather";
import {
  getConditionLabel,
  getVerdict,
  getWeatherEmoji,
} from "@/lib/calculations";

const HEIGHT = 260;
const PAD = { top: 56, right: 12, bottom: 30, left: 34 };
const UTEPILS_ZONE = 65;
const MIN_LABEL_GAP = 30;

type Point = { x: number; y: number };

/*
 * Smooth line through the points that never overshoots them
 * (monotone cubic), so the curve can't dip below 0% or above 100%.
 */
function smoothPath(points: Point[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M${points[0].x},${points[0].y}`;

  const slopes = points
    .slice(0, -1)
    .map((p, i) => (points[i + 1].y - p.y) / (points[i + 1].x - p.x));

  const tangents = points.map((_, i) => {
    if (i === 0) return slopes[0];
    if (i === points.length - 1) return slopes[i - 1];

    const [a, b] = [slopes[i - 1], slopes[i]];
    return a * b <= 0 ? 0 : 2 / (1 / a + 1 / b);
  });

  let d = `M${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const dx = (p1.x - p0.x) / 3;

    d += ` C${p0.x + dx},${p0.y + tangents[i] * dx} ${p1.x - dx},${p1.y - tangents[i + 1] * dx} ${p1.x},${p1.y}`;
  }

  return d;
}

/* Consecutive runs of night hours, as [startIndex, endIndex]. */
function getNightRuns(hourly: HourlyPoint[]) {
  const runs: [number, number][] = [];

  hourly.forEach((point, i) => {
    if (!point.night) return;

    const last = runs[runs.length - 1];
    if (last && last[1] === i - 1) {
      last[1] = i;
    } else {
      runs.push([i, i]);
    }
  });

  return runs;
}

function shortHour(hour: string) {
  return hour.slice(0, 2);
}

export default function HourlyScoreChart({
  hourly,
}: {
  hourly: HourlyPoint[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const gradientId = `hourly-fill-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const bestIndex = useMemo(
    () =>
      hourly.reduce(
        (best, point, i) => (point.score > hourly[best].score ? i : best),
        0,
      ),
    [hourly],
  );

  const best = hourly[bestIndex];
  const zoneHours = hourly.filter((p) => p.score >= UTEPILS_ZONE).length;

  const innerWidth = Math.max(0, width - PAD.left - PAD.right);
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const step = hourly.length > 1 ? innerWidth / (hourly.length - 1) : 0;

  const x = (i: number) => PAD.left + i * step;
  const y = (score: number) => PAD.top + (1 - score / 100) * innerHeight;
  const baseline = y(0);

  const points = hourly.map((p, i) => ({ x: x(i), y: y(p.score) }));
  const line = smoothPath(points);
  const area =
    points.length > 1
      ? `${line} L${x(hourly.length - 1)},${baseline} L${x(0)},${baseline} Z`
      : "";

  const labelEvery = Math.max(1, Math.ceil(MIN_LABEL_GAP / Math.max(step, 1)));
  const nightRuns = getNightRuns(hourly);

  const active = activeIndex !== null ? hourly[activeIndex] : null;

  function handlePointer(event: React.PointerEvent<SVGRectElement>) {
    if (step === 0) return;

    const bounds = event.currentTarget.getBoundingClientRect();
    const index = Math.round((event.clientX - bounds.left - PAD.left) / step);
    setActiveIndex(Math.min(hourly.length - 1, Math.max(0, index)));
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    setActiveIndex((current) =>
      Math.min(hourly.length - 1, Math.max(0, (current ?? bestIndex) + delta)),
    );
  }

  return (
    <section className="rounded-[2rem] border border-white/75 bg-[var(--surface-muted)] p-5 shadow-[0_24px_70px_rgba(23,33,43,0.08)] backdrop-blur-xl dark:border-white/10 dark:shadow-black/20 sm:p-7">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            Neste 24 timer
          </p>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
            Utepils-score time for time
          </h2>
        </div>

        {best && (
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="rounded-full bg-[var(--mint)]/70 px-3 py-1.5 text-[var(--ink)]">
              🍻 Beste: kl. {best.hour} · {best.score}%
            </span>
            <span className="rounded-full border border-slate-200/80 bg-[var(--surface)] px-3 py-1.5 text-slate-700 dark:border-white/10 dark:text-slate-200">
              {zoneHours > 0
                ? `🔥 ${zoneHours} ${zoneHours === 1 ? "time" : "timer"} over ${UTEPILS_ZONE}%`
                : `😴 Ingen timer over ${UTEPILS_ZONE}%`}
            </span>
          </div>
        )}
      </div>

      {hourly.length === 0 ? (
        <p className="rounded-2xl border border-slate-200/80 bg-[var(--surface)] p-5 text-slate-600">
          Fant ingen timevarsel akkurat nå 🤷
        </p>
      ) : (
        <>
          <div
            ref={containerRef}
            className="relative"
            style={{ height: HEIGHT }}
          >
            {width > 0 && (
              <svg
                width={width}
                height={HEIGHT}
                className="block touch-pan-y select-none overflow-visible outline-none focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-[var(--coral)]"
                tabIndex={0}
                role="img"
                aria-label={`Utepils-score de neste ${hourly.length} timene. Beste tidspunkt er kl. ${best.hour} med ${best.score}%. Bruk piltastene for å se hver time.`}
                onKeyDown={handleKeyDown}
                onFocus={() =>
                  setActiveIndex((current) => current ?? bestIndex)
                }
                onBlur={() => setActiveIndex(null)}
              >
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      style={{ stopColor: "var(--mint)", stopOpacity: 0.95 }}
                    />
                    <stop
                      offset="100%"
                      style={{ stopColor: "var(--mint)", stopOpacity: 0.08 }}
                    />
                  </linearGradient>
                </defs>

                {/* Night hours */}
                {nightRuns.map(([start, end]) => {
                  const left = Math.max(PAD.left, x(start) - step / 2);
                  const right = Math.min(width - PAD.right, x(end) + step / 2);

                  return (
                    <rect
                      key={start}
                      x={left}
                      y={PAD.top}
                      width={Math.max(0, right - left)}
                      height={innerHeight}
                      rx={10}
                      className="fill-slate-900/[0.05] dark:fill-white/[0.05]"
                    />
                  );
                })}

                {/* Grid */}
                {[0, 25, 50, 75, 100].map((tick) => (
                  <g key={tick}>
                    <line
                      x1={PAD.left}
                      x2={width - PAD.right}
                      y1={y(tick)}
                      y2={y(tick)}
                      className="stroke-slate-300/60 dark:stroke-white/10"
                      strokeWidth={1}
                    />
                    {tick % 50 === 0 && (
                      <text
                        x={PAD.left - 8}
                        y={y(tick)}
                        textAnchor="end"
                        dominantBaseline="central"
                        className="fill-slate-400 text-[11px] font-semibold tabular-nums"
                      >
                        {tick}%
                      </text>
                    )}
                  </g>
                ))}

                {/* Utepils zone */}
                <line
                  x1={PAD.left}
                  x2={width - PAD.right}
                  y1={y(UTEPILS_ZONE)}
                  y2={y(UTEPILS_ZONE)}
                  className="stroke-[var(--coral)]"
                  strokeWidth={1.5}
                  strokeDasharray="4 5"
                />
                {/* Score */}
                <path d={area} fill={`url(#${gradientId})`} />
                <path
                  d={line}
                  fill="none"
                  className="stroke-[var(--ink)]"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Weather emojis + hour labels */}
                {hourly.map((point, i) =>
                  i % labelEvery === 0 ? (
                    <g key={point.time}>
                      <text
                        x={x(i)}
                        y={18}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className="text-[16px]"
                      >
                        {getWeatherEmoji(point.symbol, point.night)}
                      </text>
                      <text
                        x={x(i)}
                        y={HEIGHT - 10}
                        textAnchor="middle"
                        className={`text-[11px] tabular-nums ${
                          i === 0
                            ? "fill-[var(--ink)] font-black"
                            : "fill-slate-500 font-semibold"
                        }`}
                      >
                        {i === 0 ? "Nå" : shortHour(point.hour)}
                      </text>
                    </g>
                  ) : null,
                )}

                {/* Peak marker */}
                {activeIndex !== bestIndex && (
                  <g>
                    <text
                      x={x(bestIndex)}
                      y={y(best.score) - 14}
                      textAnchor="middle"
                      className="fill-[var(--ink)] text-[12px] font-black tabular-nums"
                    >
                      🍻 {best.score}%
                    </text>
                    <circle
                      cx={x(bestIndex)}
                      cy={y(best.score)}
                      r={5}
                      className="fill-[var(--coral)] stroke-white"
                      strokeWidth={2}
                    />
                  </g>
                )}

                {/* Hover crosshair */}
                {active && activeIndex !== null && (
                  <g pointerEvents="none">
                    <line
                      x1={x(activeIndex)}
                      x2={x(activeIndex)}
                      y1={PAD.top}
                      y2={baseline}
                      className="stroke-slate-400"
                      strokeWidth={1}
                    />
                    <circle
                      cx={x(activeIndex)}
                      cy={y(active.score)}
                      r={6}
                      className={`stroke-white ${
                        activeIndex === bestIndex
                          ? "fill-[var(--coral)]"
                          : "fill-[var(--ink)]"
                      }`}
                      strokeWidth={2}
                    />
                  </g>
                )}

                {/* Hit area, bigger than the marks */}
                <rect
                  x={0}
                  y={0}
                  width={width}
                  height={HEIGHT}
                  fill="transparent"
                  onPointerMove={handlePointer}
                  onPointerDown={handlePointer}
                  onPointerLeave={() => setActiveIndex(null)}
                />
              </svg>
            )}

            {active && activeIndex !== null && (
              <div
                className="pointer-events-none absolute z-10 w-44 rounded-2xl bg-[var(--ink)] p-3 text-white shadow-xl shadow-slate-900/20"
                style={{
                  left: Math.min(Math.max(x(activeIndex), 88), width - 88),
                  top: y(active.score),
                  transform:
                    y(active.score) < HEIGHT / 2
                      ? "translate(-50%, 18px)"
                      : "translate(-50%, calc(-100% - 18px))",
                }}
              >
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  <span>{activeIndex === 0 ? "Nå" : `Kl. ${active.hour}`}</span>
                  <span className="text-base">
                    {getWeatherEmoji(active.symbol, active.night)}
                  </span>
                </div>
                <p className="text-3xl font-black tracking-[-0.05em] tabular-nums">
                  {active.score}
                  <span className="ml-0.5 text-lg text-[var(--mint)]">%</span>
                </p>
                <p className="text-xs text-slate-300">
                  {getVerdict(active.score).emoji}{" "}
                  {getConditionLabel(active.symbol)}
                </p>
                <p className="mt-1.5 text-xs tabular-nums text-slate-300">
                  {Math.round(active.temperature)}°C · {Math.round(active.wind)}{" "}
                  m/s · {active.precipitation} mm
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-0 w-4 border-t-2 border-dashed border-[var(--coral)]" />
              Utepils-sone ({UTEPILS_ZONE}%+)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-4 rounded bg-slate-900/[0.07]" />
              Mørkt ute
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--coral)]" />
              Beste tidspunkt
            </span>
          </div>

          <table className="sr-only">
            <caption>Utepils-score time for time</caption>
            <thead>
              <tr>
                <th>Tid</th>
                <th>Score</th>
                <th>Vær</th>
                <th>Temperatur</th>
              </tr>
            </thead>
            <tbody>
              {hourly.map((point) => (
                <tr key={point.time}>
                  <td>{point.hour}</td>
                  <td>{point.score}%</td>
                  <td>{getConditionLabel(point.symbol)}</td>
                  <td>{point.temperature}°C</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
