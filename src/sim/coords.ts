import { eciToGeodetic, gstime, radiansToDegrees } from "satellite.js";
import { EARTH_RADIUS_KM } from "./constants";
import type { Vec3 } from "./types";

/** Map ECI position (km) to globe.gl lat/lng and normalized altitude (multiples of Earth radius). */
export function eciPositionToGlobeCoords(eciKm: Vec3, at: Date): { lat: number; lng: number; alt: number } {
  const gmst = gstime(at);
  const geo = eciToGeodetic({ x: eciKm.x, y: eciKm.y, z: eciKm.z }, gmst);
  return {
    lat: radiansToDegrees(geo.latitude),
    lng: radiansToDegrees(geo.longitude),
    alt: Math.max(0, geo.height) / EARTH_RADIUS_KM
  };
}
