import { useEffect, useMemo, useRef, useState } from "react";
import GlobeView from "./components/GlobeView";
import ControlPanel from "./components/ControlPanel";
import { EARTH_RADIUS_KM, addSatellite, applyBurn, initialState, stepSimulation } from "./sim/orbitEngine";
import type { BurnType } from "./sim/types";
import { mag } from "./sim/vector";

const STEP_DT_SECONDS = 1.25;

export default function App() {
  const [simState, setSimState] = useState(initialState);
  const [burnHeadingDeg, setBurnHeadingDeg] = useState(0);
  const [cameraLatitude, setCameraLatitude] = useState(20);
  const [cameraLongitude, setCameraLongitude] = useState(30);
  const globeController = useRef<{ setViewpoint: (lat: number, lng: number) => void } | null>(null);

  useEffect(() => {
    let raf = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const steps = Math.max(1, Math.round((dt * 60) / 1.2));

      setSimState((prev) => {
        let next = prev;
        for (let i = 0; i < steps; i += 1) {
          next = stepSimulation(next, STEP_DT_SECONDS);
        }
        return next;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    globeController.current?.setViewpoint(cameraLatitude, cameraLongitude);
  }, [cameraLatitude, cameraLongitude]);

  const telemetry = useMemo(() => {
    const sat = simState.satellite;
    if (!sat) return "No satellite yet. Click Add Satellite to begin.";

    const radius = mag(sat.positionKm);
    const altitude = radius - EARTH_RADIUS_KM;
    const speed = mag(sat.velocityKmPerSec);

    return `Altitude: ${altitude.toFixed(1)} km | Speed: ${speed.toFixed(3)} km/s | Heading offset: ${burnHeadingDeg.toFixed(0)} deg`;
  }, [simState.satellite, burnHeadingDeg]);

  const onBurn = (burnType: BurnType) => {
    setSimState((prev) => applyBurn(prev, burnType, burnHeadingDeg));
  };

  return (
    <main className="app">
      <ControlPanel
        hasSatellite={Boolean(simState.satellite)}
        burnHeadingDeg={burnHeadingDeg}
        cameraLatitude={cameraLatitude}
        cameraLongitude={cameraLongitude}
        onAddSatellite={() => setSimState(addSatellite())}
        onBurnHeadingChange={setBurnHeadingDeg}
        onCameraLatitudeChange={setCameraLatitude}
        onCameraLongitudeChange={setCameraLongitude}
        onBurn={onBurn}
        telemetryText={telemetry}
      />

      <section className="viewport">
        <GlobeView
          satellite={simState.satellite?.positionKm ?? null}
          history={simState.history}
          onReady={(controller) => {
            globeController.current = controller;
          }}
        />
      </section>
    </main>
  );
}
