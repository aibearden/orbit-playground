# orbit-playground

Client-side playground for understanding satellite orbits and experimenting with burns around Earth.

## Stack

- React + TypeScript + Vite
- globe.gl for the Earth scene

## Requirements

- **Vite 8** needs a supported Node.js version: **20.19+** (LTS 20.x) or **22.12+** (current 22.x). Earlier releases such as **22.0.0** are not supported and may fail with Rolldown native binding errors.
- Use [nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), or your OS package manager to install a matching Node, then reinstall dependencies.

## Run

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

If `npm install` fails with missing `@rolldown/binding-*` or native binding errors, remove the install and retry after upgrading Node (see Requirements). As a last resort:

```bash
rm -rf node_modules package-lock.json
npm install
```

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
