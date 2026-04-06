# orbit-playground

Client-side playground for comparing **catalog orbits (SGP4 / TLE)** with a **maneuvering vehicle** integrated numerically in Earth-centered inertial coordinates.

## Stack

- React + TypeScript + Vite
- globe.gl for the Earth scene (orbit trails use **paths** with great-circle subdivision, not chained two-point arcs)
- [satellite.js](https://github.com/shashwatak/satellite-js) **6.x** (pure JS SGP4) for truth tracks — pinned to avoid WASM/worker bundling issues with Vite 8

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

## Two propagation models (read this)

| Layer | What it is | Use for |
| --- | --- | --- |
| **Truth** | SGP4 propagation from NORAD-style two-line elements | Realistic catalog motion (sample LEO + GEO ships included). Not a maneuvering physics model. |
| **Your satellite** | RK4 integration with two-body gravity + **J2** | Burns as impulses; this is the sandbox vehicle. |

These models are **different** and are labeled in the UI. Do not expect them to match each other numerically.

## Controls

- **Time warp**: simulation seconds advanced per real-time second.
- **Layers**: toggle truth (SGP4) and your satellite independently.
- **Truth regime filter**: show only LEO / MEO / GEO by live altitude band.
- **Add / reset your satellite**: spawns a default low Earth orbit for the numerical vehicle.
- **Thruster direction** + **burn buttons** (prograde, retrograde, normal, anti-normal): apply only to **your** satellite.
- **View latitude / longitude**: rotate the camera.

## Data

Sample TLEs live in [`src/data/sampleTles.ts`](src/data/sampleTles.ts). Replace them with fresh lines from [Celestrak](https://celestrak.org/) or similar when epochs drift too far from your simulation clock.

## Notes

- Mixed **LEO** and **GEO** truth objects are supported; regime badges use altitude bands from the latest SGP4 sample.
- No drag or third-body gravity on the **player** model yet (J2 only beyond point mass).
- Globe markers and paths use a **display-only** altitude offset so orbits read clearly above the Earth texture; telemetry still uses physical altitude.
