import { NextRequest, NextResponse } from "next/server";
import { getUtepilsData } from "@/lib/utepils";
import {
  isValidLatitude,
  isValidLongitude,
  roundCoord,
} from "@/lib/coords";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    if (!isValidLatitude(lat) || !isValidLongitude(lon)) {
      return NextResponse.json({ error: "Invalid lat/lon" }, { status: 400 });
    }

    const data = await getUtepilsData({
      lat: roundCoord(lat),
      lon: roundCoord(lon),
    });

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("GET /api/utepils/current failed:", error);

    return NextResponse.json(
      { error: "Could not fetch location-based utepils data" },
      { status: 500 },
    );
  }
}
