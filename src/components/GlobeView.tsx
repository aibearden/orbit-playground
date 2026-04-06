import { useEffect, useMemo, useRef } from "react";
import Globe from "globe.gl";
import * as THREE from "three";
import type { GlobeCoords } from "../sim/types";

type GlobeController = {
  setViewpoint: (lat: number, lng: number) => void;
};

export type GlobePointDatum = {
  lat: number;
  lng: number;
  alt: number;
  size: number;
  color: string;
};

export type GlobeArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  altitude: number;
  color: string;
};

type Props = {
  points: GlobePointDatum[];
  arcs: GlobeArcDatum[];
  onReady?: (controller: GlobeController) => void;
};

export function coordsToArcs(coords: GlobeCoords[], color: string): GlobeArcDatum[] {
  if (coords.length < 2) return [];
  const arcs: GlobeArcDatum[] = [];
  for (let i = 1; i < coords.length; i += 1) {
    const a = coords[i - 1];
    const b = coords[i];
    arcs.push({
      startLat: a.lat,
      startLng: a.lng,
      endLat: b.lat,
      endLng: b.lng,
      altitude: Math.max(a.alt, b.alt),
      color
    });
  }
  return arcs;
}

export default function GlobeView({ points, arcs, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<InstanceType<typeof Globe> | null>(null);

  const pointData = useMemo(() => points, [points]);
  const pathData = useMemo(() => arcs, [arcs]);

  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;

    const globe = new Globe(containerRef.current);
    globe.globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
    globe.backgroundColor("#05070d");
    globe.pointAltitude("alt");
    globe.pointColor("color");
    globe.pointRadius("size");
    globe.arcColor("color");
    globe.arcAltitude("altitude");
    globe.arcStroke(0.45);
    globe.arcDashLength(0);
    globe.arcDashAnimateTime(0);

    const controls = globe.controls();
    controls.enablePan = false;
    controls.minDistance = 170;
    controls.maxDistance = 450;

    const ambient = new THREE.AmbientLight(0xffffff, 1.0);
    globe.scene().add(ambient);

    globe.pointOfView({ lat: 20, lng: 30, altitude: 2.2 }, 0);

    globeRef.current = globe;

    onReady?.({
      setViewpoint: (lat, lng) => {
        globe.pointOfView({ lat, lng, altitude: 2.2 }, 350);
      }
    });

    const onResize = () => {
      if (!containerRef.current || !globeRef.current) return;
      globeRef.current.width(containerRef.current.clientWidth);
      globeRef.current.height(containerRef.current.clientHeight);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onReady]);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.pointsData(pointData);
  }, [pointData]);

  useEffect(() => {
    if (!globeRef.current) return;
    globeRef.current.arcsData(pathData);
  }, [pathData]);

  return <div ref={containerRef} className="globe" />;
}
