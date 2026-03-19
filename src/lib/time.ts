const OSLO_TIMEZONE = "Europe/Oslo";

export function getOsloDayKey(date: Date): string {
  return date.toLocaleDateString("sv-SE", {
    timeZone: OSLO_TIMEZONE,
  });
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

export const TIMEZONE = OSLO_TIMEZONE;
