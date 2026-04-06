import { EARTH_RADIUS_KM } from "./constants";

export type OrbitRegime = "LEO" | "MEO" | "GEO";

/** Altitude above mean sphere (km) from radial distance. */
export function altitudeFromRadiusKm(rKm: number): number {
  return Math.max(0, rKm - EARTH_RADIUS_KM);
}

export function regimeFromAltitudeKm(altKm: number): OrbitRegime {
  if (altKm < 2000) return "LEO";
  if (altKm < 30_000) return "MEO";
  return "GEO";
}
