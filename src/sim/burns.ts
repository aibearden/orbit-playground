import type { BurnType, SatelliteState, Vec3 } from "./types";
import { cross, norm, rotateAroundAxis, scale } from "./vector";

export const BURN_DELTA_V_KM_PER_SEC = 0.08;

const burnVector = (state: SatelliteState, burnType: BurnType): Vec3 => {
  const vHat = norm(state.velocityKmPerSec);
  const normal = norm(cross(state.positionKm, state.velocityKmPerSec));

  switch (burnType) {
    case "prograde":
      return vHat;
    case "retrograde":
      return scale(vHat, -1);
    case "normal":
      return normal;
    case "antiNormal":
      return scale(normal, -1);
  }
};

export const computeBurnImpulse = (
  state: SatelliteState,
  burnType: BurnType,
  directionDegrees: number
): Vec3 => {
  const base = burnVector(state, burnType);
  const rotated = rotateAroundAxis(base, state.positionKm, directionDegrees);
  return scale(norm(rotated), BURN_DELTA_V_KM_PER_SEC);
};
