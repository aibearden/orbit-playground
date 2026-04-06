import type { TruthSatelliteConfig } from "../sim/types";

/**
 * Sample catalog TLEs (SGP4 truth layer). Epoch dates are fixed in the TLE;
 * for best match to “now”, refresh from Celestrak periodically.
 */
export const SAMPLE_TRUTH_SATELLITES: TruthSatelliteConfig[] = [
  {
    id: "iss",
    name: "ISS (ZARYA)",
    regimeHint: "LEO",
    color: "#4cc9f0",
    tleLine1: "1 25544U 98067A   26096.00498673  .00007825  00000+0  15107-3 0  9998",
    tleLine2: "2 25544  51.6327 297.3095 0006349 277.1679  82.8588 15.48794122560566"
  },
  {
    id: "tdrs3",
    name: "TDRS 3",
    regimeHint: "GEO",
    color: "#f72585",
    tleLine1: "1 19548U 88091B   26096.09157319 -.00000297  00000+0  00000+0 0  9998",
    tleLine2: "2 19548  12.6569 341.4766 0042031 356.3060 200.5246  1.00267131124661"
  }
];
