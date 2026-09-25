"use client";

import { Crosshair, MapPin } from "lucide-react";

type LocationMode = "bergen" | "oslo" | "local";

interface LocationSelectorProps {
  value: LocationMode;
  onChange: (value: LocationMode) => void;
}

export default function LocationSelector({
  value,
  onChange,
}: LocationSelectorProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        <MapPin size={15} strokeWidth={2.5} />
        Hvor er du?
      </span>

      <div className="inline-flex w-fit rounded-xl border border-slate-200/80 bg-[var(--surface)] p-0.5 shadow-sm backdrop-blur dark:border-white/10">
        {[
          ["bergen", "Bergen"],
          ["oslo", "Oslo"],
          ["local", "Min posisjon"],
        ].map(([mode, label]) => {
          const selected = value === mode;

          return (
            <button
              key={mode}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(mode as LocationMode)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[var(--coral)] focus:ring-offset-1 ${
                selected
                  ? "bg-[var(--control-active-bg)] text-[var(--control-active-text)] shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {mode === "local" && (
                <Crosshair size={14} className="mr-1.5 inline" />
              )}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
