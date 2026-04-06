import type { OrbitRegime } from "./regime";

export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type BurnType = "prograde" | "retrograde" | "normal" | "antiNormal";

/** Numerically integrated vehicle state (ECI, km / km/s). */
export type PlayerState = {
  positionKm: Vec3;
  velocityKmPerSec: Vec3;
};

export type TruthSatelliteConfig = {
  id: string;
  name: string;
  tleLine1: string;
  tleLine2: string;
  /** Hint for UI; actual regime from altitude at propagate time. */
  regimeHint: OrbitRegime;
  color: string;
};

export type GlobeCoords = {
  lat: number;
  lng: number;
  alt: number;
};
