import type { TruthRegimeFilter } from "../sim/filters";
import type { BurnType } from "../sim/types";
import type { OrbitRegime } from "../sim/regime";

export type { TruthRegimeFilter };

type TruthRow = {
  id: string;
  name: string;
  regime: OrbitRegime;
  regimeHint: OrbitRegime;
  altitudeKm: number | null;
};

type Props = {
  hasPlayer: boolean;
  burnHeadingDeg: number;
  cameraLatitude: number;
  cameraLongitude: number;
  timeWarp: number;
  showTruth: boolean;
  showPlayer: boolean;
  truthRegimeFilter: TruthRegimeFilter;
  truthRows: TruthRow[];
  onAddPlayer: () => void;
  onBurnHeadingChange: (value: number) => void;
  onCameraLatitudeChange: (value: number) => void;
  onCameraLongitudeChange: (value: number) => void;
  onTimeWarpChange: (value: number) => void;
  onShowTruthChange: (value: boolean) => void;
  onShowPlayerChange: (value: boolean) => void;
  onTruthRegimeFilterChange: (value: TruthRegimeFilter) => void;
  onBurn: (burnType: BurnType) => void;
  playerTelemetry: string;
  truthTelemetry: string;
};

const burnLabel: Record<BurnType, string> = {
  prograde: "Prograde Burn",
  retrograde: "Retrograde Burn",
  normal: "Normal Burn",
  antiNormal: "Anti-Normal Burn"
};

const burnOrder: BurnType[] = ["prograde", "retrograde", "normal", "antiNormal"];

export default function ControlPanel({
  hasPlayer,
  burnHeadingDeg,
  cameraLatitude,
  cameraLongitude,
  timeWarp,
  showTruth,
  showPlayer,
  truthRegimeFilter,
  truthRows,
  onAddPlayer,
  onBurnHeadingChange,
  onCameraLatitudeChange,
  onCameraLongitudeChange,
  onTimeWarpChange,
  onShowTruthChange,
  onShowPlayerChange,
  onTruthRegimeFilterChange,
  onBurn,
  playerTelemetry,
  truthTelemetry
}: Props) {
  return (
    <aside className="panel">
      <h1>Orbit Playground</h1>
      <p className="subtitle">Two models: SGP4 catalog truth vs your numerical vehicle.</p>

      <section className="callout" aria-label="Model disclaimer">
        <strong>Truth</strong> uses <abbr title="Simplified General Perturbations 4">SGP4</abbr> with NORAD-style TLEs (mixed LEO/GEO).
        <br />
        <strong>Your satellite</strong> uses a Runge–Kutta integrator with two-body gravity + J2; burns apply as impulses.
      </section>

      <label>
        Time warp ({timeWarp.toFixed(0)}× sim s per real s)
        <input
          type="range"
          min={1}
          max={8000}
          step={1}
          value={timeWarp}
          onChange={(event) => onTimeWarpChange(Number(event.target.value))}
        />
      </label>

      <fieldset className="fieldset">
        <legend>Layers</legend>
        <label className="inline">
          <input type="checkbox" checked={showTruth} onChange={(e) => onShowTruthChange(e.target.checked)} />
          Show truth (SGP4)
        </label>
        <label className="inline">
          <input type="checkbox" checked={showPlayer} onChange={(e) => onShowPlayerChange(e.target.checked)} />
          Show your satellite
        </label>
      </fieldset>

      <label>
        Truth regime filter
        <select
          value={truthRegimeFilter}
          onChange={(e) => onTruthRegimeFilterChange(e.target.value as TruthRegimeFilter)}
        >
          <option value="all">All regimes</option>
          <option value="LEO">LEO</option>
          <option value="MEO">MEO</option>
          <option value="GEO">GEO</option>
        </select>
      </label>

      <section className="truth-list" aria-label="Truth satellites">
        <h2 className="h2">Truth catalog</h2>
        <ul>
          {truthRows.map((row) => (
            <li key={row.id}>
              <span className={`badge badge-${row.regime}`}>{row.regime}</span>
              <span className="truth-name">{row.name}</span>
              <span className="truth-alt">
                {row.altitudeKm != null ? `${row.altitudeKm.toFixed(0)} km` : "—"}
              </span>
            </li>
          ))}
        </ul>
        <p className="hint">Badge uses live altitude band from the latest SGP4 sample (not your integrator).</p>
      </section>

      <hr className="sep" />

      <h2 className="h2">Your satellite</h2>
      <button className="primary" onClick={onAddPlayer}>
        Add / reset your satellite
      </button>

      <label>
        Thruster direction ({burnHeadingDeg.toFixed(0)}°)
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={burnHeadingDeg}
          onChange={(event) => onBurnHeadingChange(Number(event.target.value))}
          disabled={!hasPlayer}
        />
      </label>

      <div className="burn-grid">
        {burnOrder.map((burnType) => (
          <button key={burnType} onClick={() => onBurn(burnType)} disabled={!hasPlayer}>
            {burnLabel[burnType]}
          </button>
        ))}
      </div>

      <label>
        View latitude ({cameraLatitude.toFixed(0)}°)
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
        View longitude ({cameraLongitude.toFixed(0)}°)
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={cameraLongitude}
          onChange={(event) => onCameraLongitudeChange(Number(event.target.value))}
        />
      </label>

      <div className="telemetry">
        <strong>Your vehicle</strong>
        <p>{playerTelemetry}</p>
      </div>

      <div className="telemetry">
        <strong>Truth layer</strong>
        <p>{truthTelemetry}</p>
      </div>
    </aside>
  );
}
