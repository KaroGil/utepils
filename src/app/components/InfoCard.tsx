export default function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-[var(--surface)] p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:hover:bg-white/10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300 wrap-break-word">
        {label}
      </p>
      <p className="mt-2 text-xl font-black tabular-nums text-[var(--ink)] wrap-break-word">
        {value}
      </p>
    </div>
  );
}
