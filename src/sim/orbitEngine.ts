import type { BurnType, SatelliteState, SimulationState } from "./types";
import { computeBurnImpulse } from "./burns";
import { add, mag, norm, scale } from "./vector";

export const EARTH_RADIUS_KM = 6371;
const MU_EARTH_KM3_PER_SEC2 = 398600.4418;
const HISTORY_LIMIT = 300;

export const createDefaultSatellite = (): SatelliteState => {
  const altitudeKm = 600;
  const orbitalRadiusKm = EARTH_RADIUS_KM + altitudeKm;
  const speed = Math.sqrt(MU_EARTH_KM3_PER_SEC2 / orbitalRadiusKm);

  return {
    positionKm: { x: orbitalRadiusKm, y: 0, z: 0 },
    velocityKmPerSec: { x: 0, y: speed, z: 0 }
  };
};

export const initialState = (): SimulationState => ({
  satellite: null,
  history: []
});

export const stepSimulation = (state: SimulationState, dtSec: number): SimulationState => {
  if (!state.satellite) {
    return state;
  }

  const { positionKm, velocityKmPerSec } = state.satellite;
  const radius = mag(positionKm);
  const gravAccel = scale(norm(positionKm), -MU_EARTH_KM3_PER_SEC2 / (radius * radius));

  const newVelocity = add(velocityKmPerSec, scale(gravAccel, dtSec));
  const newPosition = add(positionKm, scale(newVelocity, dtSec));
  const history = [...state.history, newPosition];

  return {
    satellite: {
      positionKm: newPosition,
      velocityKmPerSec: newVelocity
    },
    history: history.length > HISTORY_LIMIT ? history.slice(history.length - HISTORY_LIMIT) : history
  };
};

export const addSatellite = (): SimulationState => {
  const sat = createDefaultSatellite();
  return {
    satellite: sat,
    history: [sat.positionKm]
  };
};

export const applyBurn = (
  state: SimulationState,
  burnType: BurnType,
  directionDegrees: number
): SimulationState => {
  if (!state.satellite) {
    return state;
  }

  const deltaV = computeBurnImpulse(state.satellite, burnType, directionDegrees);
  return {
    ...state,
    satellite: {
      ...state.satellite,
      velocityKmPerSec: add(state.satellite.velocityKmPerSec, deltaV)
    }
  };
};
