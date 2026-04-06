import type { Vec3 } from "./types";

export const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const scale = (v: Vec3, s: number): Vec3 => ({ x: v.x * s, y: v.y * s, z: v.z * s });
export const dot = (a: Vec3, b: Vec3): number => a.x * b.x + a.y * b.y + a.z * b.z;
export const cross = (a: Vec3, b: Vec3): Vec3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x
});
export const mag = (v: Vec3): number => Math.sqrt(dot(v, v));
export const norm = (v: Vec3): Vec3 => {
  const m = mag(v);
  if (m < 1e-9) return { x: 0, y: 0, z: 0 };
  return scale(v, 1 / m);
};

export const rotateAroundAxis = (v: Vec3, axis: Vec3, degrees: number): Vec3 => {
  const k = norm(axis);
  const theta = (degrees * Math.PI) / 180;
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  const kv = cross(k, v);
  const kdotv = dot(k, v);
  return add(add(scale(v, c), scale(kv, s)), scale(k, kdotv * (1 - c)));
};
