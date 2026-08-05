export type CityConfig = {
  name: string;
  slug: string;
  lat: number;
  lon: number;
  timeZone: string;
};

export const cities = {
  bergen: {
    name: "Bergen",
    slug: "bergen",
    lat: 60.39299,
    lon: 5.32415,
    timeZone: "Europe/Oslo",
  },
  oslo: {
    name: "Oslo",
    slug: "oslo",
    lat: 59.9139,
    lon: 10.7522,
    timeZone: "Europe/Oslo",
  },
} satisfies Record<string, CityConfig>;
