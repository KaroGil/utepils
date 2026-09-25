export default function LoadingScreen() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-3 text-slate-900 sm:px-8 sm:py-5">
      <div className="mx-auto max-w-337.5">
        <header className="mb-4 flex items-center justify-between border-b border-slate-300/50 pb-4">
          <div className="flex items-baseline gap-3">
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-300" />
            <div className="hidden h-3 w-40 animate-pulse rounded-full bg-slate-200 sm:block" />
          </div>
          <div className="h-9 w-40 animate-pulse rounded-xl bg-white/80" />
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/90 bg-[var(--paper)] p-5 shadow-[0_18px_50px_rgba(23,33,43,0.08)] sm:p-7">
            <div className="animate-pulse">
              <div className="mb-3 h-3 w-32 animate-pulse rounded-full bg-slate-300" />
              <div className="hidden h-3 w-40 animate-pulse rounded-full bg-slate-200 sm:block" />
              <div className="h-11 w-40 animate-pulse rounded-xl bg-white/80" />

              <div className="mt-7 rounded-[1.5rem] bg-[var(--ink)] p-5 shadow-lg">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="mb-3 h-4 w-28 rounded-full bg-slate-700 dark:bg-black/10" />
                    <div className="h-16 w-28 rounded-2xl bg-slate-700 dark:bg-black/10" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 rounded-full bg-slate-700 dark:bg-black/10" />
                    <div className="h-4 w-16 rounded-full bg-slate-700 dark:bg-black/10" />
                  </div>
                </div>

                <div className="mt-5 h-3 w-full rounded-full bg-white/15">
                  <div className="h-3 w-1/3 rounded-full bg-slate-500" />
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {["temperature", "wind", "weather", "rain"].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/75 p-4">
                    <div className="mb-3 h-3 w-20 rounded-full bg-slate-200" />
                    <div className="h-7 w-16 rounded-xl bg-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/75 bg-[var(--surface-muted)] p-6 shadow-[0_24px_70px_rgba(23,33,43,0.08)] backdrop-blur-xl sm:p-8">
            <div className="animate-pulse">
              <div className="mb-6 h-3 w-24 rounded-full bg-slate-200" />
              <div className="mb-7 h-8 w-64 rounded-2xl bg-slate-300" />
              <div className="space-y-4">
                {["temperature", "time", "wind", "peak"].map((item) => (
                  <div key={item} className="rounded-2xl bg-white/75 p-5">
                    <div className="mb-3 h-5 w-32 rounded-full bg-slate-300" />
                    <div className="mb-2 h-3 w-3/4 rounded-full bg-slate-200" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
