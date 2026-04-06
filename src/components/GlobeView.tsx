import { useEffect, useMemo, useRef } from "react";
import Globe from "globe.gl";
import * as THREE from "three";

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

/** One continuous orbit polyline for globe.gl `pathsData`. */
export type GlobePathDatum = {
  color: string;
  points: { lat: number; lng: number; alt: number }[];
};

type Props = {
  points: GlobePointDatum[];
  paths: GlobePathDatum[];
  onReady?: (controller: GlobeController) => void;
};

export default function GlobeView({ points, paths, onReady }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<InstanceType<typeof Globe> | null>(null);

  const pointData = useMemo(() => points, [points]);
  const pathData = useMemo(() => paths, [paths]);

  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;

    const globe = new Globe(containerRef.current);
    globe.globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg");
    globe.backgroundColor("#05070d");
    globe.pointAltitude("alt");
    globe.pointColor("color");
    globe.pointRadius("size");

    globe.pathsData([]);
    globe.pathPoints("points");
    globe.pathPointLat("lat");
    globe.pathPointLng("lng");
    globe.pathPointAlt("alt");
    globe.pathColor("color");
    globe.pathStroke(0.35);
    globe.pathResolution(14);
    globe.pathDashLength(0);
    globe.pathDashAnimateTime(0);

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
    globeRef.current.pathsData(pathData);
  }, [pathData]);

  return <div ref={containerRef} className="globe" />;
}
