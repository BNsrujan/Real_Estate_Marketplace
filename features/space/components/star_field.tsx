"use client";
import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function createStarGeometry(count: number): THREE.BufferGeometry {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 160 + Math.random() * 200;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}

function Stars3D({ count }: { count: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    const nextGeometry = createStarGeometry(count);
    let disposed = false;

    queueMicrotask(() => {
      if (disposed) return;
      setGeometry(nextGeometry);
    });

    return () => {
      disposed = true;
      nextGeometry.dispose();
    };
  }, [count]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.008;

    const targetX = mouseRef.current.x * 3;
    const targetY = mouseRef.current.y * 2;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const nextX = lerp(pointsRef.current.position.x, targetX, 0.03);
    const nextY = lerp(pointsRef.current.position.y, targetY, 0.03);

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    pointsRef.current.position.x = clamp(nextX, -8, 8);
    pointsRef.current.position.y = clamp(nextY, -6, 6);
  });

  return geometry ? (
    <>
      <color attach="background" args={["#000000"]} />
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial size={1.2} color="#9ddcff" transparent opacity={1} sizeAttenuation />
      </points>
    </>
  ) : null;
}

export default function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const [canvasConfig, setCanvasConfig] = useState<{ dpr: number; starCount: number } | null>(null);

  useEffect(() => {
    let disposed = false;

    queueMicrotask(() => {
      if (disposed) return;
      setCanvasConfig({
        dpr: window.devicePixelRatio || 1,
        starCount: window.innerWidth < 768 ? 2500 : 6000,
      });
    });

    return () => {
      disposed = true;
    };
  }, []);

  // After mount, forcibly kill pointer-events on R3F's internal wrapper div
  // and use a MutationObserver to keep it none if R3F re-renders the wrapper.
  useEffect(() => {
    if (!canvasWrapperRef.current) return;
    canvasWrapperRef.current.style.pointerEvents = "none";

    const observer = new MutationObserver(() => {
      if (canvasWrapperRef.current) {
        canvasWrapperRef.current.style.pointerEvents = "none";
      }
    });
    observer.observe(canvasWrapperRef.current, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, [canvasConfig]);

  if (!canvasConfig) return null;

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <Canvas
        ref={canvasWrapperRef as React.Ref<HTMLCanvasElement>}
        camera={{ position: [0, 0, 100], fov: 75, far: 10000 }}
        style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
        dpr={canvasConfig.dpr}
        gl={{ antialias: true, alpha: false, stencil: false }}
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
        onCreated={({ gl }) => {
          gl.domElement.style.pointerEvents = "none";
          if (gl.domElement.parentElement) {
            gl.domElement.parentElement.style.pointerEvents = "none";
          }
        }}
      >
        <Stars3D count={canvasConfig.starCount} />
      </Canvas>
    </div>
  );
}
