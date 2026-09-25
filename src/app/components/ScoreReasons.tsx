import ReasonRow from "./ReasonRow";
import type { BergenResponse, WeatherData } from "@/types/weather";

interface ScoreReasonsProps {
  data: BergenResponse | null;
  weather: WeatherData;
  hour: number;
  time: string;
}

export default function ScoreReasons({
  data,
  weather,
  hour,
  time,
}: ScoreReasonsProps) {
  return (
    <aside className="rounded-[2rem] border border-white/75 bg-[var(--surface-muted)] p-6 shadow-[0_24px_70px_rgba(23,33,43,0.08)] backdrop-blur-xl dark:border-white/10 dark:shadow-black/20 sm:p-8">
      <div className="mb-4 flex flex-row items-center justify-between gap-2">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
            Forklaring
          </p>
          <h2 className="text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">
            Hvorfor denne scoren?
          </h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <ReasonRow
          title="Temperatur"
          value={`${weather.temperature}°C`}
          description={
            weather.temperature >= 15 && weather.temperature <= 22
              ? "Perfekt temperatur for å sitte ute lenge"
              : weather.temperature < 15
                ? "Litt kjølig, men ikke umulig"
                : "Varmt nok til god stemning"
          }
        />

        <ReasonRow
          title="Tid på dagen"
          value={time}
          description={
            hour >= 16 && hour < 22
              ? "Prime time for utepils"
              : hour >= 12
                ? "Det nærmer seg, men ikke helt peak ennå"
                : "Fortsatt litt tidlig for full utepilsfølelse"
          }
        />

        <ReasonRow
          title="Vind og nedbør"
          value={`${weather.wind} m/s`}
          description={
            weather.wind < 5 && weather.precipitation === 0
              ? "Lite vind og tørt vær trekker opp stemningen"
              : "Vind eller nedbør trekker stemningen ned"
          }
        />

        <ReasonRow
          title="Peak i dag"
          value={data?.peakToday?.time ? `Kl. ${data.peakToday.time}` : "—"}
          description={
            data?.peakToday?.score != null
              ? `Beste estimerte utepilsstemning i dag er rundt dette tidspunktet (${data.peakToday.score}%).`
              : "Fant ikke noe tydelig peak-tidspunkt i dag."
          }
        />
      </div>
    </aside>
  );
}
