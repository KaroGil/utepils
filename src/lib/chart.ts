import type { HourlyPoint } from "@/types/weather";

export type Point = { x: number; y: number };

/*
 * Smooth line through the points that never overshoots them
 * (monotone cubic), so the curve can't dip below 0% or above 100%.
 */
export function smoothPath(points: Point[]) {
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
export function getNightRuns(hourly: HourlyPoint[]) {
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
