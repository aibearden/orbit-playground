/** Mean Earth radius (km) — visualization scale matches globe.gl usage. */
export const EARTH_RADIUS_KM = 6371;

/** Floor for bad/near-zero heights before the visual offset (alt / Earth radius). */
export const DISPLAY_MIN_ALT_NORM = 0.015;

/**
 * Extra lift for rendering only (alt / Earth radius), added on top of physical altitude.
 * ~0.05 ≈ 320 km — keeps markers and paths visibly off the globe at typical zoom.
 */
export const VISUAL_ALTITUDE_OFFSET_NORM = 0.05;

export const MU_EARTH_KM3_PER_SEC2 = 398600.4418;

/** WGS84 Earth equatorial radius (km), used for J2 term. */
export const EARTH_EQUATORIAL_RADIUS_KM = 6378.137;

/** J2 zonal harmonic (dimensionless). */
export const J2_WGS84 = 0.00108263;
