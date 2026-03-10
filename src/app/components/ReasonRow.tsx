export default function ReasonRow({
  title,
  description,
  value,
}: {
  title: string;
  description: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-slate-700">{description}</p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-3xl font-black tabular-nums text-slate-900 sm:text-4xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
