const OSLO_TIMEZONE = "Europe/Oslo";
export const TIMEZONE = OSLO_TIMEZONE;

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

export function isSeventeenthOfMay(dateInput: string | Date) {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  const osloDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

  return osloDate === "05-17";
}
