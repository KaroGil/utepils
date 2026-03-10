export default function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-slate-500 wrap-break-word">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900 wrap-break-word">
        {value}
      </p>
    </div>
  );
}
