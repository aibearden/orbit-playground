import { DISPLAY_MIN_ALT_NORM, VISUAL_ALTITUDE_OFFSET_NORM } from "./constants";
import type { GlobeCoords } from "./types";

const DISPLAY_ALT_FLOOR = DISPLAY_MIN_ALT_NORM + VISUAL_ALTITUDE_OFFSET_NORM;

/**
 * Avoid arcs/paths that connect valid orbit points to near-surface garbage (bad samples / decay).
 */
export function clampDisplayAltitude(coords: GlobeCoords[]): GlobeCoords[] {
  return coords.map((c) => ({
    ...c,
    alt: Math.max(DISPLAY_ALT_FLOOR, c.alt)
  }));
}

/**
 * Keep longitude continuous across samples so the globe does not "jump" ±360° between points.
 */
export function unwrapLongitudeSequence(coords: GlobeCoords[]): GlobeCoords[] {
  if (coords.length === 0) return [];
  const out: GlobeCoords[] = [{ ...coords[0] }];
  for (let i = 1; i < coords.length; i += 1) {
    let lng = coords[i].lng;
    const prevLng = out[i - 1].lng;
    while (lng - prevLng > 180) lng -= 360;
    while (lng - prevLng < -180) lng += 360;
    out.push({ lat: coords[i].lat, lng, alt: coords[i].alt });
  }
  return out;
}

const MAX_PATH_POINTS = 720;

function thinCoords(coords: GlobeCoords[], max: number): GlobeCoords[] {
  if (coords.length <= max) return coords;
  const step = (coords.length - 1) / (max - 1);
  const uniform: GlobeCoords[] = [];
  for (let i = 0; i < max; i += 1) {
    uniform.push(coords[Math.round(i * step)]);
  }
  return uniform;
}

/**
 * Prepare raw lat/lng/alt history for globe.gl paths (thin + clamp + unwrap).
 */
export function prepareOrbitPathPoints(coords: GlobeCoords[]): { lat: number; lng: number; alt: number }[] {
  if (coords.length < 2) return [];
  const thinned = thinCoords(coords, MAX_PATH_POINTS);
  const fixed = unwrapLongitudeSequence(clampDisplayAltitude(thinned));
  return fixed.map((c) => ({ lat: c.lat, lng: c.lng, alt: c.alt }));
}
