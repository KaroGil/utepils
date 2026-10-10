import { NextResponse } from "next/server";
import { getUtepilsData } from "@/lib/utepils";
import type { CityConfig } from "@/lib/cities";

export function createUtepilsRoute(city: CityConfig) {
  return async function GET() {
    try {
      const data = await getUtepilsData({
        lat: city.lat,
        lon: city.lon,
        name: city.name,
      });

      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    } catch (error) {
      console.error(`GET /api/utepils/${city.slug} failed:`, error);

      return NextResponse.json(
        { error: `Could not fetch ${city.name} utepils data` },
        { status: 500 },
      );
    }
  };
}
