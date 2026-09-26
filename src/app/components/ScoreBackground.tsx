import { getBackgroundClass } from "@/lib/calculations";

// One layer per score level, so we can crossfade between them.
const LAYERS = [100, 50, 0].map(getBackgroundClass);

/*
 * Page background that follows the utepils score.
 * Shows the plain page color until there is a score.
 */
export default function ScoreBackground({ score }: { score: number | null }) {
  const active = score === null ? null : getBackgroundClass(score);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0">
      {LAYERS.map((layer) => (
        <div
          key={layer}
          className={`absolute inset-0 bg-linear-to-br ${layer} transition-opacity duration-1000 ease-out ${
            layer === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
