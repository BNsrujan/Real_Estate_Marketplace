"use client";
import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Stars3D() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const geometry = useMemo(() => {
    const count = window.innerWidth < 768 ? 2500 : 6000;
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
  }, []);

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

    pointsRef.current.position.x +=
      (mouseRef.current.x * 4 - pointsRef.current.position.x) * 0.02;
  });

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial size={1.2} color="#9ddcff" transparent opacity={1} sizeAttenuation />
      </points>
    </>
  );
}

export default function StarField() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 100], fov: 75, far: 10000 }}
        style={{ width: "100%", height: "100%", display: "block" }}
        dpr={typeof window !== "undefined" ? window.devicePixelRatio : 1}
        gl={{ antialias: true, alpha: false, stencil: false }}
      >
        <Stars3D />
      </Canvas>
    </div>
  );
}
