import { useEffect, useMemo, useRef, useState } from "react";
import ControlPanel from "./components/ControlPanel";
import GlobeView, { coordsToArcs, type GlobeArcDatum, type GlobePointDatum } from "./components/GlobeView";
import { SAMPLE_TRUTH_SATELLITES } from "./data/sampleTles";
import { eciPositionToGlobeCoords } from "./sim/coords";
import { regimeMatchesFilter } from "./sim/filters";
import {
  addPlayerSatellite,
  advanceSimulation,
  applyBurn,
  createInitialWorld,
  playerTelemetryLine,
  truthTelemetryLine,
  type WorldState
} from "./sim/simulation";
import { initTruthSatellites, sampleTruthAt } from "./sim/truthSgp4";
import type { BurnType } from "./sim/types";

export default function App() {
  const [world, setWorld] = useState<WorldState>(() =>
    createInitialWorld(initTruthSatellites(SAMPLE_TRUTH_SATELLITES))
  );
  const [cameraLatitude, setCameraLatitude] = useState(20);
  const [cameraLongitude, setCameraLongitude] = useState(30);
  const globeController = useRef<{ setViewpoint: (lat: number, lng: number) => void } | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dtWall = (now - lastTime) / 1000;
      lastTime = now;
      setWorld((prev) => advanceSimulation(prev, dtWall));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    globeController.current?.setViewpoint(cameraLatitude, cameraLongitude);
  }, [cameraLatitude, cameraLongitude]);

  const simDate = useMemo(
    () => new Date(world.epochMs + world.simElapsedSec * 1000),
    [world.epochMs, world.simElapsedSec]
  );

  const { globePoints, globeArcs } = useMemo(() => {
    const points: GlobePointDatum[] = [];
    const arcs: GlobeArcDatum[] = [];

    if (world.showPlayer && world.player) {
      const coords = eciPositionToGlobeCoords(world.player.positionKm, simDate);
      points.push({ ...coords, size: 0.55, color: "#ffd166" });
      arcs.push(...coordsToArcs(world.playerHistory, "#06d6a0"));
    }

    if (world.showTruth) {
      for (const tr of world.truthRuntimes) {
        const sample = sampleTruthAt(tr.satrec, simDate);
        if (!sample || !regimeMatchesFilter(sample.regime, world.truthRegimeFilter)) {
          continue;
        }
        points.push({ ...sample.coords, size: 0.42, color: tr.config.color });
        const hist = world.truthHistories[tr.config.id] ?? [];
        arcs.push(...coordsToArcs(hist, tr.config.color));
      }
    }

    return { globePoints: points, globeArcs: arcs };
  }, [world, simDate]);

  const truthRows = useMemo(() => {
    return world.truthRuntimes.map((tr) => {
      const sample = sampleTruthAt(tr.satrec, simDate);
      return {
        id: tr.config.id,
        name: tr.config.name,
        regimeHint: tr.config.regimeHint,
        regime: sample?.regime ?? tr.config.regimeHint,
        altitudeKm: sample?.altitudeKm ?? null
      };
    });
  }, [world.truthRuntimes, simDate]);

  const onBurn = (burnType: BurnType) => {
    setWorld((prev) => applyBurn(prev, burnType));
  };

  return (
    <main className="app">
      <ControlPanel
        hasPlayer={Boolean(world.player)}
        burnHeadingDeg={world.burnHeadingDeg}
        cameraLatitude={cameraLatitude}
        cameraLongitude={cameraLongitude}
        timeWarp={world.timeWarp}
        showTruth={world.showTruth}
        showPlayer={world.showPlayer}
        truthRegimeFilter={world.truthRegimeFilter}
        truthRows={truthRows}
        onAddPlayer={() => setWorld((prev) => addPlayerSatellite(prev))}
        onBurnHeadingChange={(value) => setWorld((prev) => ({ ...prev, burnHeadingDeg: value }))}
        onCameraLatitudeChange={setCameraLatitude}
        onCameraLongitudeChange={setCameraLongitude}
        onTimeWarpChange={(value) => setWorld((prev) => ({ ...prev, timeWarp: value }))}
        onShowTruthChange={(value) => setWorld((prev) => ({ ...prev, showTruth: value }))}
        onShowPlayerChange={(value) => setWorld((prev) => ({ ...prev, showPlayer: value }))}
        onTruthRegimeFilterChange={(value) => setWorld((prev) => ({ ...prev, truthRegimeFilter: value }))}
        onBurn={onBurn}
        playerTelemetry={playerTelemetryLine(world)}
        truthTelemetry={truthTelemetryLine(world)}
      />

      <section className="viewport">
        <GlobeView
          points={globePoints}
          arcs={globeArcs}
          onReady={(controller) => {
            globeController.current = controller;
          }}
        />
      </section>
    </main>
  );
}
