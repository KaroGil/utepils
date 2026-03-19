export async function fetchSunset(lat: number, lon: number, date: string) {
  const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&date=${date}&formatted=0`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sunset API failed: ${res.status} ${text}`);
  }

  const data = await res.json();

  const sunset = data?.results?.sunset;

  if (!sunset) {
    throw new Error("Missing sunset time in response");
  }

  return sunset;
}
