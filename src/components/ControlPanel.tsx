import type { BurnType } from "../sim/types";

type Props = {
  hasSatellite: boolean;
  burnHeadingDeg: number;
  cameraLatitude: number;
  cameraLongitude: number;
  onAddSatellite: () => void;
  onBurnHeadingChange: (value: number) => void;
  onCameraLatitudeChange: (value: number) => void;
  onCameraLongitudeChange: (value: number) => void;
  onBurn: (burnType: BurnType) => void;
  telemetryText: string;
};

const burnLabel: Record<BurnType, string> = {
  prograde: "Prograde Burn",
  retrograde: "Retrograde Burn",
  normal: "Normal Burn",
  antiNormal: "Anti-Normal Burn"
};

const burnOrder: BurnType[] = ["prograde", "retrograde", "normal", "antiNormal"];

export default function ControlPanel({
  hasSatellite,
  burnHeadingDeg,
  cameraLatitude,
  cameraLongitude,
  onAddSatellite,
  onBurnHeadingChange,
  onCameraLatitudeChange,
  onCameraLongitudeChange,
  onBurn,
  telemetryText
}: Props) {
  return (
    <aside className="panel">
      <h1>Orbit Playground</h1>
      <p className="subtitle">Client-side orbital mechanics sandbox</p>

      <button className="primary" onClick={onAddSatellite}>
        Add Satellite
      </button>

      <label>
        Thruster Direction ({burnHeadingDeg.toFixed(0)} deg)
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={burnHeadingDeg}
          onChange={(event) => onBurnHeadingChange(Number(event.target.value))}
          disabled={!hasSatellite}
        />
      </label>

      <label>
        View Latitude ({cameraLatitude.toFixed(0)} deg)
        <input
          type="range"
          min={-89}
          max={89}
          step={1}
          value={cameraLatitude}
          onChange={(event) => onCameraLatitudeChange(Number(event.target.value))}
        />
      </label>

      <label>
        View Longitude ({cameraLongitude.toFixed(0)} deg)
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={cameraLongitude}
          onChange={(event) => onCameraLongitudeChange(Number(event.target.value))}
        />
      </label>

      <div className="burn-grid">
        {burnOrder.map((burnType) => (
          <button key={burnType} onClick={() => onBurn(burnType)} disabled={!hasSatellite}>
            {burnLabel[burnType]}
          </button>
        ))}
      </div>

      <div className="telemetry">
        <strong>Telemetry</strong>
        <p>{telemetryText}</p>
      </div>
    </aside>
  );
}
