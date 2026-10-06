export const locationLabels = {
  bergen: "Bergen",
  oslo: "Oslo",
  local: "Min posisjon",
} as const;

export type LocationMode = keyof typeof locationLabels;

export const locationModes = Object.keys(locationLabels) as LocationMode[];
