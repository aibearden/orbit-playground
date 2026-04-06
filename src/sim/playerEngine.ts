import { computeBurnImpulse } from "./burns";
import {
  EARTH_EQUATORIAL_RADIUS_KM,
  EARTH_RADIUS_KM,
  J2_WGS84,
  MU_EARTH_KM3_PER_SEC2
} from "./constants";
import type { BurnType, PlayerState, Vec3 } from "./types";
import { add, dot, mag, scale } from "./vector";

/** Two-body + J2 (ECI). Burns are not part of this acceleration. */
function centralAndJ2Acceleration(r: Vec3): Vec3 {
  const r2 = dot(r, r);
  const r1 = Math.sqrt(r2);
  const mu = MU_EARTH_KM3_PER_SEC2;
  const a0 = scale(r, -mu / (r2 * r1));

  const invR2 = 1 / r2;
  const z2 = r.z * r.z;
  const zr2 = z2 * invR2;
  const t = (-1.5 * J2_WGS84 * mu * EARTH_EQUATORIAL_RADIUS_KM * EARTH_EQUATORIAL_RADIUS_KM) / (r2 * r2 * r1);
  const aJ2: Vec3 = {
    x: t * r.x * (1 - 5 * zr2),
    y: t * r.y * (1 - 5 * zr2),
    z: t * r.z * (3 - 5 * zr2)
  };
  return add(a0, aJ2);
}

function rk4Step(state: PlayerState, dt: number): PlayerState {
  const r0 = state.positionKm;
  const v0 = state.velocityKmPerSec;

  const k1r = v0;
  const k1v = centralAndJ2Acceleration(r0);

  const r2 = add(r0, scale(k1r, 0.5 * dt));
  const v2 = add(v0, scale(k1v, 0.5 * dt));
  const k2r = v2;
  const k2v = centralAndJ2Acceleration(r2);

  const r3 = add(r0, scale(k2r, 0.5 * dt));
  const v3 = add(v0, scale(k2v, 0.5 * dt));
  const k3r = v3;
  const k3v = centralAndJ2Acceleration(r3);

  const r4 = add(r0, scale(k3r, dt));
  const v4 = add(v0, scale(k3v, dt));
  const k4r = v4;
  const k4v = centralAndJ2Acceleration(r4);

  const dr = scale(add(add(k1r, scale(k2r, 2)), add(scale(k3r, 2), k4r)), dt / 6);
  const dv = scale(add(add(k1v, scale(k2v, 2)), add(scale(k3v, 2), k4v)), dt / 6);

  return {
    positionKm: add(r0, dr),
    velocityKmPerSec: add(v0, dv)
  };
}

export function createDefaultPlayer(): PlayerState {
  const altitudeKm = 600;
  const orbitalRadiusKm = EARTH_RADIUS_KM + altitudeKm;
  const speed = Math.sqrt(MU_EARTH_KM3_PER_SEC2 / orbitalRadiusKm);
  return {
    positionKm: { x: orbitalRadiusKm, y: 0, z: 0 },
    velocityKmPerSec: { x: 0, y: speed, z: 0 }
  };
}

export function stepPlayer(player: PlayerState | null, dtSimSec: number): PlayerState | null {
  if (!player) {
    return null;
  }

  let state = player;
  let remaining = dtSimSec;
  const maxSubStep = 3;
  while (remaining > 1e-9) {
    const h = Math.min(maxSubStep, remaining);
    state = rk4Step(state, h);
    remaining -= h;
  }

  return state;
}

export function applyBurnToPlayer(
  player: PlayerState | null,
  burnType: BurnType,
  directionDegrees: number
): PlayerState | null {
  if (!player) return null;
  const deltaV = computeBurnImpulse(player, burnType, directionDegrees);
  return {
    ...player,
    velocityKmPerSec: add(player.velocityKmPerSec, deltaV)
  };
}

export function playerAltitudeKm(player: PlayerState): number {
  return mag(player.positionKm) - EARTH_RADIUS_KM;
}

export function playerSpeedKmPerSec(player: PlayerState): number {
  return mag(player.velocityKmPerSec);
}
