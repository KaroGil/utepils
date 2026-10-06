export type SunTimes = {
  sunrise: string;
  sunset: string;
};

export async function fetchSunTimes(
  lat: number,
  lon: number,
  date: string,
): Promise<SunTimes> {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sunset API failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  const sunrise = data?.results?.sunrise;
  const sunset = data?.results?.sunset;

  if (!sunrise || !sunset) {
    throw new Error("Missing sunrise/sunset time in response");
  }

  return { sunrise, sunset };
}

/*
 * Sun times for several days, keyed by day. A failed day is null so the
 * score falls back to default daylight hours instead of failing the request.
 */
export async function fetchSunTimesForDays(
  lat: number,
  lon: number,
  dayKeys: string[],
): Promise<Record<string, SunTimes | null>> {
  const results = await Promise.all(
    dayKeys.map((day) => fetchSunTimes(lat, lon, day).catch(() => null)),
  );

  return Object.fromEntries(dayKeys.map((day, i) => [day, results[i]]));
}
