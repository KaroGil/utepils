import { cities } from "@/lib/cities";
import { createForecastRoute } from "@/lib/api/createForecastRoute";

export const GET = createForecastRoute(cities.oslo);
