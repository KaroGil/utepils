"use client";

export default function NorwegianFlagsBackground() {
  const flags = Array.from({ length: 12 });

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {flags.map((_, i) => (
        <span
          key={i}
          className="absolute animate-norway-float text-3xl opacity-20"
          style={{
            // eslint-disable-next-line react-hooks/purity
            left: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${10 + (i % 5)}s`,
          }}
        >
          🇳🇴
        </span>
      ))}
    </div>
  );
}
