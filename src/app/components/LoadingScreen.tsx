function Bar({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-slate-300/60 dark:bg-white/10 ${className}`}
    />
  );
}

const CHART_BARS = [
  40, 48, 55, 62, 70, 74, 72, 66, 58, 50, 42, 35, 30, 28, 30, 36, 44, 52,
];

export default function LoadingScreen() {
  return (
    <div className="pb-12" role="status" aria-live="polite">
      <span className="sr-only">Henter utepilsdata…</span>

      <section className="animate-rise-in relative pt-4 sm:pt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-8 h-64 w-64 animate-pulse rounded-full bg-[var(--mint)]/50 blur-3xl"
        />

        <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          Akkurat nå
        </p>
        <Bar className="mt-4 h-10 w-3/4 max-w-xl rounded-2xl sm:h-14" />
        <Bar className="mt-4 h-4 w-1/2 max-w-sm" />

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-10">
          <Bar className="h-18 w-36 rounded-3xl sm:h-24 sm:w-44" />
          <div className="flex-1 sm:pb-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-300/50 dark:bg-white/10">
              <div className="animate-loading-bar h-2 w-1/3 rounded-full bg-[var(--ink)]/60" />
            </div>
            <Bar className="mt-4 h-4 w-2/3" />
          </div>
        </div>
      </section>

      <section className="animate-rise-in-delay mt-12 border-t border-slate-300/50 pt-8 sm:mt-16">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
          Neste 24 timer
        </p>
        <Bar className="mt-2 h-7 w-72 max-w-full rounded-xl" />

        <div className="mt-8 flex h-48 items-end gap-1.5">
          {CHART_BARS.map((height, i) => (
            <div
              key={i}
              className="flex-1 animate-pulse rounded-t-lg bg-[var(--mint)]/50"
              style={{ height: `${height}%`, animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
