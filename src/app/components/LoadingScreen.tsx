export default function LoadingScreen() {
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-200 via-slate-100 to-zinc-100 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-337.5 items-center justify-center p-6">
        <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-4xl bg-white/70 p-8 shadow-2xl backdrop-blur-xl">
            <div className="animate-pulse">
              <div className="mb-2 h-4 w-40 rounded-full bg-slate-200" />
              <div className="mb-4 h-16 w-96 max-w-full rounded-2xl bg-slate-300" />
              <div className="h-6 w-80 max-w-full rounded-xl bg-slate-200" />

              <div className="mt-8 rounded-3xl bg-slate-900 p-6 shadow-lg">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="mb-3 h-4 w-28 rounded-full bg-slate-700" />
                    <div className="h-16 w-28 rounded-2xl bg-slate-700" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 rounded-full bg-slate-700" />
                    <div className="h-4 w-16 rounded-full bg-slate-700" />
                  </div>
                </div>

                <div className="mt-5 h-4 w-full rounded-full bg-white/15">
                  <div className="h-4 w-1/3 rounded-full bg-slate-500" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-3xl bg-white/80 p-6 shadow-md"
                  >
                    <div className="mb-4 h-4 w-24 rounded-full bg-slate-200" />
                    <div className="h-8 w-20 rounded-xl bg-slate-300" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="rounded-4xl bg-white/60 p-8 shadow-2xl backdrop-blur-xl">
            <div className="animate-pulse">
              <div className="h-8 w-72 rounded-2xl bg-slate-300" />
              <div className="mt-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/70 p-4 shadow-sm"
                  >
                    <div className="mb-3 h-5 w-32 rounded-full bg-slate-300" />
                    <div className="mb-2 h-4 w-20 rounded-full bg-slate-200" />
                    <div className="h-4 w-full rounded-full bg-slate-200" />
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
