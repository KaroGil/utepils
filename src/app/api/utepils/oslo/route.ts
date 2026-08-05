import { cities } from "@/lib/cities";
import { createUtepilsRoute } from "@/lib/api/createUtepilsRoute";

export const GET = createUtepilsRoute(cities.oslo);
