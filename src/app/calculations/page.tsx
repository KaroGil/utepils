"use client";

import { useState } from "react";
import {
  calculateCondition,
  calculatePrecipitation,
  calculateTemperature,
  calculateTimeOfDay,
  calculateWind,
} from "../../lib/calculations";

// ── Config for the table rows ────────────────────────────────────────────────

const TEMP_ROWS = [
  { label: "< 5 °C", value: 2, score: 0 },
  { label: "5–7 °C", value: 6, score: 10 },
  { label: "8–14 °C", value: 11, score: 20 },
  { label: "15–32 °C", value: 18, score: 35 },
  { label: "33–37 °C", value: 30, score: 28 },
  { label: "> 37 °C", value: 38, score: 20 },
];

const WIND_ROWS = [
  { label: "< 5 m/s", value: 2, score: 15 },
  { label: "5–7 m/s", value: 6, score: 8 },
  { label: "8–11 m/s", value: 10, score: -5 },
  { label: "≥ 12 m/s", value: 13, score: -18 },
];

const PRECIP_ROWS = [
  { label: "None (0 mm)", value: 0, score: 10 },
  { label: "Any (> 0 mm)", value: 1, score: -20 },
];

const CONDITION_ROWS = [
  { label: "☀️ Clear sky (day)", symbol: "clearsky_day", score: 35 },
  { label: "⛅ Partly cloudy (day)", symbol: "partlycloudy_day", score: 25 },
  { label: "🌤 Fair (day)", symbol: "fair_day", score: 20 },
  { label: "☁️ Cloudy", symbol: "cloudy", score: 8 },
  { label: "🌙 Fair (night)", symbol: "fair_night", score: 8 },
  { label: "🌙 Clear sky (night)", symbol: "clearsky_night", score: 15 },
  { label: "⛅ Partly cloudy (night)", symbol: "partlycloudy_night", score: 5 },
  { label: "🌫 Fog", symbol: "fog", score: -10 },
  { label: "❄️ Snow", symbol: "snow", score: -20 },
  { label: "🌧 Rain", symbol: "rain", score: -25 },
];

const TIME_ROWS = [
  { label: "Before 10:00", hour: 8, score: 0 },
  { label: "10:00–11:59", hour: 11, score: 6 },
  { label: "12:00–15:59", hour: 14, score: 12 },
  { label: "16:00–21:59", hour: 18, score: 25 },
  { label: "22:00+", hour: 23, score: 10 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 25) return "#4ade80";
  if (score >= 10) return "#86efac";
  if (score >= 0) return "#d1d5db";
  if (score >= -10) return "#fca5a5";
  return "#f87171";
}

function ScoreBar({ score, max = 35 }: { score: number; max?: number }) {
  const pct = Math.abs(score) / max;
  const positive = score >= 0;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 80 }}
    >
      <div
        style={{
          flex: 1,
          height: 6,
          background: "#1e293b",
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            [positive ? "left" : "right"]: 0,
            width: `${pct * 100}%`,
            height: "100%",
            background: scoreColor(score),
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: scoreColor(score),
          minWidth: 28,
          textAlign: "right",
        }}
      >
        {score > 0 ? "+" : ""}
        {score}
      </span>
    </div>
  );
}

type TableData = { label: string; score: number; active?: boolean }[];

function ScoreTable({
  title,
  rows,
  activeIndex,
}: {
  title: string;
  rows: TableData;
  activeIndex?: number;
}) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.12em",
          color: "#64748b",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {rows.map((row, i) => {
            const isActive = activeIndex === i;
            return (
              <tr
                key={i}
                style={{
                  background: isActive
                    ? "rgba(74,222,128,0.07)"
                    : "transparent",
                  borderLeft: isActive
                    ? "2px solid #4ade80"
                    : "2px solid transparent",
                  transition: "background 0.2s",
                }}
              >
                <td
                  style={{
                    padding: "5px 10px 5px 12px",
                    fontSize: 13,
                    color: isActive ? "#e2e8f0" : "#94a3b8",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.label}
                </td>
                <td style={{ padding: "5px 10px", width: "100%" }}>
                  <ScoreBar score={row.score} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Summation display ────────────────────────────────────────────────────────

function SumBreakdown({
  tempScore,
  windScore,
  precipScore,
  condScore,
  timeScore,
}: {
  tempScore: number;
  windScore: number;
  precipScore: number;
  condScore: number;
  timeScore: number;
}) {
  const total = tempScore + windScore + precipScore + condScore + timeScore;

  const parts = [
    { label: "temp", value: tempScore, emoji: "🌡️" },
    { label: "wind", value: windScore, emoji: "💨" },
    { label: "precip", value: precipScore, emoji: "🌧️" },
    { label: "condition", value: condScore, emoji: "☁️" },
    { label: "time", value: timeScore, emoji: "🕐" },
  ];

  return (
    <div
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 12,
        padding: "20px 24px",
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#475569",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 16,
        }}
      >
        Score breakdown
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {parts.map((p, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: 0 }}
          >
            <span style={{ fontSize: 14, minWidth: 24 }}>{p.emoji}</span>
            <span
              style={{
                color: "#475569",
                fontSize: 12,
                minWidth: 72,
                marginLeft: 6,
              }}
            >
              {p.label}
            </span>
            <span
              style={{
                color: scoreColor(p.value),
                fontSize: 14,
                minWidth: 36,
                textAlign: "right",
              }}
            >
              {p.value > 0 ? "+" : ""}
              {p.value}
            </span>
            {i < parts.length - 1 && (
              <span style={{ color: "#334155", fontSize: 12, marginLeft: 8 }}>
                +
              </span>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid #1e293b",
          marginTop: 16,
          paddingTop: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#475569",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Total
          </span>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: scoreColor(total),
              lineHeight: 1,
            }}
          >
            {total}
          </span>
        </div>
        <div
          style={{
            marginTop: 10,
            height: 4,
            background: "#1e293b",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, (total / 120) * 100))}%`,
              background: scoreColor(total),
              borderRadius: 2,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: 9, color: "#334155" }}>0</span>
          <span style={{ fontSize: 9, color: "#334155" }}>120</span>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function Page() {
  const [temp, setTemp] = useState(18);
  const [wind, setWind] = useState(3);
  const [precip, setPrecip] = useState(0);
  const [condSymbol, setCondSymbol] = useState("clearsky_day");
  const [hour, setHour] = useState(15);

  const tempScore = calculateTemperature(temp);
  const windScore = calculateWind(wind);
  const precipScore = calculatePrecipitation(precip);
  const condScore = calculateCondition(condSymbol);
  const timeScore = calculateTimeOfDay(hour);

  // Find active indices for highlights
  const activeTempIdx = TEMP_ROWS.findIndex(
    (r) => calculateTemperature(r.value) === tempScore && r.score === tempScore,
  );
  const activeWindIdx = WIND_ROWS.findIndex(
    (r) => calculateWind(r.value) === windScore,
  );
  const activePrecipIdx = PRECIP_ROWS.findIndex(
    (r) => calculatePrecipitation(r.value) === precipScore,
  );
  const activeCondIdx = CONDITION_ROWS.findIndex(
    (r) => r.symbol === condSymbol,
  );
  const activeTimeIdx = TIME_ROWS.findIndex(
    (r) => calculateTimeOfDay(r.hour) === timeScore,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d17",
        color: "#e2e8f0",
        fontFamily: "'DM Sans', sans-serif",
        padding: "40px 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        input[type=range] { appearance: none; width: 100%; height: 4px; border-radius: 2px; background: #1e293b; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #4ade80; cursor: pointer; }
        select { background: #0f172a; color: #94a3b8; border: 1px solid #1e293b; border-radius: 6px; padding: 6px 10px; font-size: 13px; font-family: 'DM Sans', sans-serif; outline: none; cursor: pointer; width: 100%; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            marginBottom: 36,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: "#334155",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Utepils score engine
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 600,
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Score tables
            </h1>
          </div>
          <button
            onClick={() => {
              setTemp(18);
              setWind(2);
              setPrecip(0);
              setCondSymbol("clearsky_day");
              setHour(18);
            }}
            style={{
              background: "transparent",
              border: "1px solid #4ade80",
              color: "#4ade80",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              cursor: "pointer",
              letterSpacing: "0.05em",
              transition: "background 0.15s, color 0.15s",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = "#4ade80";
              (e.target as HTMLButtonElement).style.color = "#060d17";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = "transparent";
              (e.target as HTMLButtonElement).style.color = "#4ade80";
            }}
          >
            ✦ Perfect score
          </button>
        </div>

        {/* Controls */}
        <div
          style={{
            background: "#0a1628",
            border: "1px solid #1e293b",
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 32,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 20,
          }}
        >
          {[
            {
              label: `🌡️ Temp: ${temp} °C`,
              min: -10,
              max: 40,
              value: temp,
              onChange: (v: number) => setTemp(v),
            },
            {
              label: `💨 Wind: ${wind} m/s`,
              min: 0,
              max: 25,
              value: wind,
              onChange: (v: number) => setWind(v),
            },
            {
              label: `🌧️ Precip: ${precip} mm`,
              min: 0,
              max: 10,
              value: precip,
              onChange: (v: number) => setPrecip(v),
            },
            {
              label: `🕐 Hour: ${String(hour).padStart(2, "0")}:00`,
              min: 0,
              max: 23,
              value: hour,
              onChange: (v: number) => setHour(v),
            },
          ].map((ctrl, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 12,
                  color: "#64748b",
                  marginBottom: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {ctrl.label}
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                value={ctrl.value}
                onChange={(e) => ctrl.onChange(Number(e.target.value))}
              />
            </div>
          ))}
          <div>
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                marginBottom: 8,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ☁️ Condition
            </div>
            <select
              value={condSymbol}
              onChange={(e) => setCondSymbol(e.target.value)}
            >
              {CONDITION_ROWS.map((r) => (
                <option key={r.symbol} value={r.symbol}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 220px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* Tables */}
          <div
            style={{
              background: "#0a1628",
              border: "1px solid #1e293b",
              borderRadius: 12,
              padding: "20px 24px",
            }}
          >
            <ScoreTable
              title="Temperature"
              rows={TEMP_ROWS.map((r) => ({ label: r.label, score: r.score }))}
              activeIndex={activeTempIdx}
            />
            <ScoreTable
              title="Wind"
              rows={WIND_ROWS.map((r) => ({ label: r.label, score: r.score }))}
              activeIndex={activeWindIdx}
            />
            <ScoreTable
              title="Precipitation"
              rows={PRECIP_ROWS.map((r) => ({
                label: r.label,
                score: r.score,
              }))}
              activeIndex={activePrecipIdx}
            />
            <ScoreTable
              title="Condition"
              rows={CONDITION_ROWS.map((r) => ({
                label: r.label,
                score: r.score,
              }))}
              activeIndex={activeCondIdx}
            />
            <ScoreTable
              title="Time of day"
              rows={TIME_ROWS.map((r) => ({ label: r.label, score: r.score }))}
              activeIndex={activeTimeIdx}
            />
          </div>

          {/* Summation */}
          <div style={{ position: "sticky", top: 24 }}>
            <SumBreakdown
              tempScore={tempScore}
              windScore={windScore}
              precipScore={precipScore}
              condScore={condScore}
              timeScore={timeScore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
