import { propagate, twoline2satrec } from "satellite.js";
import type { SatRec } from "satellite.js";
import { eciPositionToGlobeCoords } from "./coords";
import { EARTH_RADIUS_KM } from "./constants";
import { regimeFromAltitudeKm, type OrbitRegime } from "./regime";
import type { TruthSatelliteConfig, Vec3 } from "./types";

export type TruthRuntime = {
  config: TruthSatelliteConfig;
  satrec: SatRec;
};

export function initTruthSatellites(configs: TruthSatelliteConfig[]): TruthRuntime[] {
  return configs.map((config) => ({
    config,
    satrec: twoline2satrec(config.tleLine1, config.tleLine2)
  }));
}

export type TruthSample = {
  eciKm: Vec3;
  coords: ReturnType<typeof eciPositionToGlobeCoords>;
  altitudeKm: number;
  regime: OrbitRegime;
};

export function sampleTruthAt(satrec: SatRec, at: Date): TruthSample | null {
  const pv = propagate(satrec, at);
  if (!pv) {
    return null;
  }
  const pos = pv.position as { x: number; y: number; z: number } | false;
  if (pos === false) {
    return null;
  }
  const eciKm: Vec3 = { x: pos.x, y: pos.y, z: pos.z };
  const coords = eciPositionToGlobeCoords(eciKm, at);
  const altitudeKm = coords.alt * EARTH_RADIUS_KM;
  const regime = regimeFromAltitudeKm(altitudeKm);
  return { eciKm, coords, altitudeKm, regime };
}
