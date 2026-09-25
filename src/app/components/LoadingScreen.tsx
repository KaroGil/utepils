function Bar({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-slate-300/60 dark:bg-white/10 ${className}`}
    />
  );
}

export default function LoadingScreen() {
  return (
    <div
      className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Henter utepilsdata…</span>

      <section className="animate-rise-in relative self-center overflow-hidden rounded-[2rem] border border-white/90 bg-[var(--paper)] p-5 shadow-[0_18px_50px_rgba(23,33,43,0.08)] dark:border-white/10 dark:shadow-black/20 sm:p-7">
        <div className="absolute -right-16 -top-20 h-48 w-48 animate-pulse rounded-full bg-[var(--mint)]/60 blur-2xl" />

        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="relative w-full">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
              Akkurat nå
            </p>
            <Bar className="h-8 w-3/4 max-w-md rounded-2xl sm:h-12" />
            <Bar className="mt-3 h-4 w-1/2 max-w-sm" />
          </div>

          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--mint)]/70 text-2xl sm:h-14 sm:w-14 sm:text-3xl">
            <span className="animate-bounce">🍺</span>
          </div>
        </div>

        <div className="relative mb-5 rounded-[1.5rem] bg-[var(--ink)] p-5 text-white shadow-lg shadow-slate-900/10 dark:bg-[#d9eee2] dark:text-[#14241e]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                Utepils-score
              </p>
              <div className="mt-2 h-14 w-28 animate-pulse rounded-2xl bg-white/10 dark:bg-black/10" />
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="h-4 w-20 animate-pulse rounded-full bg-white/10 dark:bg-black/10" />
              <div className="h-4 w-12 animate-pulse rounded-full bg-white/10 dark:bg-black/10" />
            </div>
          </div>

          <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-white/15 dark:bg-black/10">
            <div className="animate-loading-bar h-3 w-1/3 rounded-full bg-[var(--mint)]" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {["Temperatur", "Vind", "Vær", "Nedbør"].map((label) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200/80 bg-[var(--surface)] p-4 shadow-sm dark:border-white/10"
            >
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                {label}
              </p>
              <Bar className="mt-3 h-6 w-16 rounded-xl" />
            </div>
          ))}
        </div>
      </section>

      <aside className="animate-rise-in-delay rounded-[2rem] border border-white/75 bg-[var(--surface-muted)] p-6 shadow-[0_24px_70px_rgba(23,33,43,0.08)] backdrop-blur-xl dark:border-white/10 dark:shadow-black/20 sm:p-8">
        <div className="mb-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            Forklaring
          </p>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
            Hvorfor denne scoren?
          </h2>
        </div>

        <div className="mt-6 space-y-4">
          {["Temperatur", "Tid på dagen", "Vind og nedbør", "Peak i dag"].map(
            (title) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-[var(--surface)] p-5 shadow-sm dark:border-white/10"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    <Bar className="mt-2 h-3.5 w-3/4" />
                  </div>
                  <Bar className="h-9 w-16 shrink-0 rounded-xl sm:h-10 sm:w-20" />
                </div>
              </div>
            ),
          )}
        </div>
      </aside>
    </div>
  );
}
