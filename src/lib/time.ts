const OSLO_TIMEZONE = "Europe/Oslo";
export const TIMEZONE = OSLO_TIMEZONE;

export function getOsloDayKey(date: Date): string {
  return date.toLocaleDateString("sv-SE", {
    timeZone: OSLO_TIMEZONE,
  });
}

/*
 * Oslo day keys (YYYY-MM-DD) for today and the following days. Steps by
 * calendar day, not 24 hours, since DST days are 23 or 25 hours long.
 */
export function getNextOsloDayKeys(days: number, from = new Date()): string[] {
  const [year, month, day] = getOsloDayKey(from).split("-").map(Number);

  return Array.from({ length: days }, (_, i) =>
    new Date(Date.UTC(year, month - 1, day + i)).toISOString().slice(0, 10),
  );
}

export function getOsloHour(date: Date): number {
  return Number(
    date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: OSLO_TIMEZONE,
    }),
  );
}

export function formatOsloTime(date: Date): string {
  return date.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: OSLO_TIMEZONE,
  });
}

export function isSeventeenthOfMay(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const osloDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return osloDate === "05-17";
}
