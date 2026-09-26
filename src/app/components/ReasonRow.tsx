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
    <div className="rounded-2xl border border-slate-200/80 bg-[var(--surface)] p-5 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-slate-700 dark:text-slate-300">
            {description}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-3xl font-black tabular-nums text-slate-900 dark:text-white sm:text-4xl">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
