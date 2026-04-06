# orbit-playground

Client-side playground for understanding satellite orbits and experimenting with burns around Earth.

## Stack

- React + TypeScript + Vite
- globe.gl for the Earth scene

## Requirements

- **Node.js 18+** (including early Node 22.x such as 22.0.0). The project pins **Vite 5** so dev and build work without native Rolldown bindings and without needing Node 22.12+.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Controls

- **Add Satellite**: spawns one satellite in a default low Earth orbit.
- **Thruster Direction slider**: rotates burn direction around the Earth-relative radial axis.
- **Burn buttons**:
  - Prograde Burn
  - Retrograde Burn
  - Normal Burn
  - Anti-Normal Burn
- **View Latitude / View Longitude sliders**: rotate the camera frame to inspect orbits in 3D.

## Notes (v1 simplifications)

- Two-body Earth gravity only.
- One satellite at a time.
- Fixed burn impulse per click.
- Orbital path is always visible while satellite exists.
