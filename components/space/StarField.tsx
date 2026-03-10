"use client";
import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ── Inner Three.js component ─────────────────────────────────────────────────
function Stars3D() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Build geometry once
  const geometry = useMemo(() => {
    const count = 7000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread stars in a large sphere shell (so they surround the viewer)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 160 + Math.random() * 200;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Slight blue-white colour variation for realism
      const warm = Math.random() * 0.3;
      colors[i * 3] = 0.75 + warm;
      colors[i * 3 + 1] = 0.85 + warm * 0.5;
      colors[i * 3 + 2] = 1.0;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Track mouse for parallax
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;

    // Slow drift rotation for depth feeling
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.008;
    pointsRef.current.rotation.x = clock.getElapsedTime() * 0.003;

    // Smooth parallax with mouse
    const targetX = mouseRef.current.x * 4;
    const targetY = -mouseRef.current.y * 4;
    pointsRef.current.position.x +=
      (targetX - pointsRef.current.position.x) * 0.025;
    pointsRef.current.position.y +=
      (targetY - pointsRef.current.position.y) * 0.025;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.55}
        sizeAttenuation
        transparent
        opacity={0.85}
        fog={false}
      />
    </points>
  );
}

// ── Exported wrapper ─────────────────────────────────────────────────────────
export default function StarField() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        // Deep-space radial gradient as background
        background:
          "radial-gradient(ellipse at 50% 50%, #0b1230 0%, #050a1a 45%, #000000 100%)",
        pointerEvents: "none",
      }}
    >
      <Canvas
        dpr={1} // keep GPU load low for a background element
        camera={{ position: [0, 0, 1], fov: 90, near: 0.1, far: 1000 }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
        frameloop="always"
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <Stars3D />
      </Canvas>
    </div>
  );
}
