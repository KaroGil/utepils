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
