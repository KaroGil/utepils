const SOURCES = [
  { name: "MET Norway", href: "https://api.met.no/" },
  { name: "Sunrise-Sunset", href: "https://sunrise-sunset.org/api" },
  {
    name: "© OpenStreetMap-bidragsytere",
    href: "https://www.openstreetmap.org/copyright",
  },
];

export default function Footer() {
  return (
    <footer className="flex flex-col gap-4 border-t border-slate-300/50 py-8 text-sm text-slate-500 sm:flex-row sm:items-start sm:justify-between dark:text-slate-400">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--ink)]">
          Utepils-meter
        </p>
      </div>

      <p className="max-w-sm sm:text-right">
        Værdata fra{" "}
        {SOURCES.map((source, i) => (
          <span key={source.name}>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-[var(--ink)] hover:decoration-[var(--coral)] dark:text-slate-200"
            >
              {source.name}
            </a>
            {i < SOURCES.length - 2
              ? ", "
              : i === SOURCES.length - 2
                ? " og "
                : "."}
          </span>
        ))}
      </p>
    </footer>
  );
}
