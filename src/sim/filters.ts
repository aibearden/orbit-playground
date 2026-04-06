import type { OrbitRegime } from "./regime";

export type TruthRegimeFilter = "all" | OrbitRegime;

export function regimeMatchesFilter(regime: OrbitRegime, filter: TruthRegimeFilter): boolean {
  if (filter === "all") return true;
  return regime === filter;
}
