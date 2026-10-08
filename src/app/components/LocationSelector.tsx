"use client";

import { Crosshair, MapPin } from "lucide-react";
import { LocationMode, locationLabels, locationModes } from "@/lib/locations";

interface LocationSelectorProps {
  value: LocationMode;
  onChange: (value: LocationMode) => void;
  isLoading: boolean;
}

export default function LocationSelector({
  value,
  onChange,
  isLoading,
}: LocationSelectorProps) {
  if (isLoading) {
    return (
      <div
        className="flex w-full animate-pulse flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3"
        role="status"
        aria-label="Laster sted"
      >
        <span className="h-4 w-32 rounded-full bg-slate-300/60 dark:bg-white/10" />
        <span className="h-10 w-full rounded-xl border border-slate-200/80 bg-slate-300/60 dark:border-white/10 dark:bg-white/10 sm:w-[260px]" />
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        <MapPin size={15} strokeWidth={2.5} />
        Hvor er du?
      </span>

      <div className="flex w-full gap-0.5 rounded-xl border sm:inline-flex sm:w-fit border-slate-200/80 bg-[var(--surface)] p-0.5 shadow-sm backdrop-blur dark:border-white/10">
        {locationModes.map((mode) => {
          const selected = value === mode;

          return (
            <button
              key={mode}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(mode)}
              className={`inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-[10px] px-2 py-2.5 text-sm font-semibold sm:flex-none sm:px-3 sm:py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--coral)] ${
                selected
                  ? "bg-[var(--control-active-bg)] text-[var(--control-active-text)] shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {mode === "local" ? (
                <Crosshair size={14} className="mr-1.5 shrink-0" />
              ) : null}
              {locationLabels[mode]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
