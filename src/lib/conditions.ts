export function getConditionLabel(condition: string) {
  const labels: Record<string, string> = {
    // Clear / sky
    clearsky_day: "Sol",
    clearsky_night: "Klart",
    clearsky_polartwilight: "Klart",

    fair_day: "Lettskyet",
    fair_night: "Lettskyet",
    fair_polartwilight: "Lettskyet",

    partlycloudy_day: "Delvis skyet",
    partlycloudy_night: "Delvis skyet",
    partlycloudy_polartwilight: "Delvis skyet",

    cloudy: "Overskyet",

    // Fog
    fog: "Tåke",

    // Rain
    lightrain: "Lett regn",
    rain: "Regn",
    heavyrain: "Kraftig regn",

    lightrainshowers_day: "Lette regnbyger",
    lightrainshowers_night: "Lette regnbyger",
    lightrainshowers_polartwilight: "Lette regnbyger",

    rainshowers_day: "Regnbyger",
    rainshowers_night: "Regnbyger",
    rainshowers_polartwilight: "Regnbyger",

    heavyrainshowers_day: "Kraftige regnbyger",
    heavyrainshowers_night: "Kraftige regnbyger",
    heavyrainshowers_polartwilight: "Kraftige regnbyger",

    // Snow
    lightsnow: "Lett snø",
    snow: "Snø",
    heavysnow: "Kraftig snø",

    lightsnowshowers_day: "Lette snøbyger",
    lightsnowshowers_night: "Lette snøbyger",
    lightsnowshowers_polartwilight: "Lette snøbyger",

    snowshowers_day: "Snøbyger",
    snowshowers_night: "Snøbyger",
    snowshowers_polartwilight: "Snøbyger",

    heavysnowshowers_day: "Kraftige snøbyger",
    heavysnowshowers_night: "Kraftige snøbyger",
    heavysnowshowers_polartwilight: "Kraftige snøbyger",

    // Sleet (rain + snow)
    sleet: "Sludd",
    lightsleet: "Lett sludd",
    heavysleet: "Kraftig sludd",

    sleetshowers_day: "Sluddbyger",
    sleetshowers_night: "Sluddbyger",
    sleetshowers_polartwilight: "Sluddbyger",

    lightsleetshowers_day: "Lette sluddbyger",
    lightsleetshowers_night: "Lette sluddbyger",
    lightsleetshowers_polartwilight: "Lette sluddbyger",

    heavysleetshowers_day: "Kraftige sluddbyger",
    heavysleetshowers_night: "Kraftige sluddbyger",
    heavysleetshowers_polartwilight: "Kraftige sluddbyger",

    // Thunder
    thunderstorm: "Tordenvær",

    lightrainandthunder: "Lett regn og torden",
    rainandthunder: "Regn og torden",
    heavyrainandthunder: "Kraftig regn og torden",

    lightsnowandthunder: "Lett snø og torden",
    snowandthunder: "Snø og torden",
    heavysnowandthunder: "Kraftig snø og torden",

    sleetandthunder: "Sludd og torden",
    lightsleetandthunder: "Lett sludd og torden",
    heavysleetandthunder: "Kraftig sludd og torden",
  };

  return labels[condition] ?? "Ukjent";
}

export function getWeatherEmoji(symbol: string, night = false) {
  const normalized = symbol.toLowerCase();
  const isNight = night || normalized.includes("night");

  if (normalized.includes("thunder")) return "⛈️";
  if (normalized.includes("snow")) return "❄️";
  if (normalized.includes("sleet")) return "🌨️";
  if (normalized.includes("rain")) return "🌧️";
  if (normalized.includes("fog")) return "🌫️";
  if (normalized.includes("clearsky")) return isNight ? "🌙" : "☀️";
  if (normalized.includes("fair")) return isNight ? "🌙" : "🌤️";
  if (normalized.includes("partlycloudy")) return isNight ? "☁️" : "⛅";

  return "☁️";
}

export function mapSymbolToCondition(symbol?: string): string {
  if (!symbol) return "cloudy";

  const normalized = symbol.toLowerCase();

  if (normalized.includes("rain")) return "rainy";
  if (normalized.includes("clearsky")) return "sunny";
  if (normalized.includes("fair")) return "partly-cloudy";
  if (normalized.includes("partlycloudy")) return "partly-cloudy";

  return "cloudy";
}
