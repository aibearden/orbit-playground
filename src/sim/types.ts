export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export type BurnType = "prograde" | "retrograde" | "normal" | "antiNormal";

export type SatelliteState = {
  positionKm: Vec3;
  velocityKmPerSec: Vec3;
};

export type SimulationState = {
  satellite: SatelliteState | null;
  history: Vec3[];
};
