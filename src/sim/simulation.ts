import { eciPositionToGlobeCoords } from "./coords";
import {
  applyBurnToPlayer,
  createDefaultPlayer,
  playerAltitudeKm,
  playerSpeedKmPerSec,
  stepPlayer
} from "./playerEngine";
import type { TruthRuntime } from "./truthSgp4";
import { sampleTruthAt } from "./truthSgp4";
import type { TruthRegimeFilter } from "./filters";
import type { BurnType, GlobeCoords, PlayerState } from "./types";

const PLAYER_HISTORY_LIMIT = 450;
const TRUTH_HISTORY_LIMIT = 400;

export type WorldState = {
  epochMs: number;
  simElapsedSec: number;
  timeWarp: number;
  player: PlayerState | null;
  playerHistory: GlobeCoords[];
  truthRuntimes: TruthRuntime[];
  truthHistories: Record<string, GlobeCoords[]>;
  burnHeadingDeg: number;
  showTruth: boolean;
  showPlayer: boolean;
  truthRegimeFilter: TruthRegimeFilter;
};

export function createInitialWorld(truthRuntimes: TruthRuntime[]): WorldState {
  return {
    epochMs: Date.now(),
    simElapsedSec: 0,
    timeWarp: 600,
    player: null,
    playerHistory: [],
    truthRuntimes,
    truthHistories: {},
    burnHeadingDeg: 0,
    showTruth: true,
    showPlayer: true,
    truthRegimeFilter: "all"
  };
}

export function advanceSimulation(prev: WorldState, dtWallSec: number): WorldState {
  const simDt = dtWallSec * prev.timeWarp;
  const simElapsedSec = prev.simElapsedSec + simDt;
  const simDate = new Date(prev.epochMs + simElapsedSec * 1000);

  let player = prev.player;
  let playerHistory = prev.playerHistory;

  if (player) {
    const stepped = stepPlayer(player, simDt);
    player = stepped;
    if (player) {
      const coords = eciPositionToGlobeCoords(player.positionKm, simDate);
      playerHistory = [...playerHistory, coords].slice(-PLAYER_HISTORY_LIMIT);
    } else {
      playerHistory = [];
    }
  }

  const truthHistories = { ...prev.truthHistories };
  for (const tr of prev.truthRuntimes) {
    const sample = sampleTruthAt(tr.satrec, simDate);
    if (!sample) continue;
    const id = tr.config.id;
    const h = truthHistories[id] ?? [];
    truthHistories[id] = [...h, sample.coords].slice(-TRUTH_HISTORY_LIMIT);
  }

  return {
    ...prev,
    simElapsedSec,
    player,
    playerHistory,
    truthHistories
  };
}

export function addPlayerSatellite(prev: WorldState): WorldState {
  const p = createDefaultPlayer();
  const simDate = new Date(prev.epochMs + prev.simElapsedSec * 1000);
  const coords = eciPositionToGlobeCoords(p.positionKm, simDate);
  return {
    ...prev,
    player: p,
    playerHistory: [coords]
  };
}

export function applyBurn(prev: WorldState, burnType: BurnType): WorldState {
  const nextPlayer = applyBurnToPlayer(prev.player, burnType, prev.burnHeadingDeg);
  return { ...prev, player: nextPlayer };
}

export function playerTelemetryLine(w: WorldState): string {
  if (!w.player) {
    return "No vehicle. Add your satellite to enable burns (numerical model).";
  }
  const alt = playerAltitudeKm(w.player);
  const spd = playerSpeedKmPerSec(w.player);
  return `Altitude ${alt.toFixed(1)} km | Speed ${spd.toFixed(3)} km/s | RK4 + J2 (ECI)`;
}

export function truthTelemetryLine(w: WorldState): string {
  const simDate = new Date(w.epochMs + w.simElapsedSec * 1000);
  const parts: string[] = [];
  for (const tr of w.truthRuntimes) {
    const s = sampleTruthAt(tr.satrec, simDate);
    if (!s) {
      parts.push(`${tr.config.name}: propagate error`);
      continue;
    }
    parts.push(`${tr.config.name}: ${s.altitudeKm.toFixed(0)} km (${s.regime}) SGP4`);
  }
  return parts.join(" · ") || "No truth satellites.";
}
