import { useEffect, useMemo, useRef } from "react";
import Globe from "globe.gl";
import * as THREE from "three";
import type { Vec3 } from "../sim/types";

type GlobeController = {
  setViewpoint: (lat: number, lng: number) => void;
};

type Props = {
  satellite: Vec3 | null;
  history: Vec3[];
  onReady?: (controller: GlobeController) => void;
};

type PointDatum = {
  lat: number;
  lng: number;
  alt: number;
  size: number;
  color: string;
};

type ArcDatum = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  altitude: number;
};

const EARTH_RADIUS_KM = 6371;

const toLatLngAlt = (v: Vec3) => {
  const r = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  const lat = (Math.asin(v.z / r) * 180) / Math.PI;
  const lng = (Math.atan2(v.y, v.x) * 180) / Math.PI;
  const alt = Math.max(0, (r - EARTH_RADIUS_KM) / EARTH_RADIUS_KM);
  return { lat, lng, alt };
};

export default function GlobeView({ satellite, history, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<InstanceType<typeof Globe> | null>(null);

  const pointData = useMemo<PointDatum[]>(() => {
    if (!satellite) return [];
    const coords = toLatLngAlt(satellite);
    return [{ ...coords, size: 0.5, color: "#ffd166" }];
  }, [satellite]);

  const pathData = useMemo<ArcDatum[]>(() => {
    if (history.length < 2) return [];
    const arcs: ArcDatum[] = [];
    for (let i = 1; i < history.length; i += 1) {
      const a = toLatLngAlt(history[i - 1]);
      const b = toLatLngAlt(history[i]);
      arcs.push({
        startLat: a.lat,
        startLng: a.lng,
        endLat: b.lat,
        endLng: b.lng,
        altitude: Math.max(a.alt, b.alt),
        color: "#06d6a0"
      });
    }
    return arcs;
  }, [history]);

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
    globe.arcStroke(0.5);
    globe.arcDashLength(1);
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
