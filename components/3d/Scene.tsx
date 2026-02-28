"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Globe from "./Globe";

export default function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={2} />

      <Globe />

      <OrbitControls
        enableZoom
        enablePan={false}
        minDistance={1.2}
        maxDistance={8}
      />
    </Canvas>
  );
}
