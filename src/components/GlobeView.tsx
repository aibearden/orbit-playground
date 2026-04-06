import { useEffect, useMemo, useRef, useState } from "react";
import Globe from "globe.gl";
import * as THREE from "three";
import { canCreateWebGLContext, isLikelyDisabledWebGL } from "../lib/webglSupport";
import WebGLBlocked from "./WebGLBlocked";

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
  const onReadyRef = useRef(onReady);
  const [globeFailed, setGlobeFailed] = useState(false);

  onReadyRef.current = onReady;

  const pointData = useMemo(() => points, [points]);
  const pathData = useMemo(() => paths, [paths]);

  useEffect(() => {
    if (!containerRef.current || globeRef.current) return;

    if (!canCreateWebGLContext()) {
      setGlobeFailed(true);
      return;
    }

    let globe: InstanceType<typeof Globe>;
    try {
      globe = new Globe(containerRef.current, {
        rendererConfig: {
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false
        }
      });
    } catch {
      setGlobeFailed(true);
      return;
    }

    const gl = globe.renderer().getContext() as WebGLRenderingContext | WebGL2RenderingContext | null;
    if (!gl || isLikelyDisabledWebGL(gl)) {
      try {
        globe._destructor();
      } catch {
        /* ignore */
      }
      setGlobeFailed(true);
      return;
    }

    const canvas = globe.renderer().domElement;
    const onCanvasLost = (e: Event) => {
      e.preventDefault();
      setGlobeFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onCanvasLost);

    globe.globeImageUrl(`${import.meta.env.BASE_URL}earth-blue-marble.jpg`);
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

    onReadyRef.current?.({
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
      canvas.removeEventListener("webglcontextlost", onCanvasLost);
      try {
        globeRef.current?._destructor();
      } catch {
        /* ignore */
      }
      globeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!globeRef.current || globeFailed) return;
    globeRef.current.pointsData(pointData);
  }, [pointData, globeFailed]);

  useEffect(() => {
    if (!globeRef.current || globeFailed) return;
    globeRef.current.pathsData(pathData);
  }, [pathData, globeFailed]);

  if (globeFailed) {
    return (
      <div className="globe globe-fallback-wrap">
        <WebGLBlocked />
      </div>
    );
  }

  return <div ref={containerRef} className="globe" />;
}
