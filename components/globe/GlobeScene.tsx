"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import Earth from "./Earth";
import StarsBackground from "./StarsBackground";

function ResponsiveCamera() {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return (
    <PerspectiveCamera
      makeDefault
      position={isMobile ? [0, 0, 6.5] : [0, 0, 5.2]}
      fov={45}
    />
  );
}

export default function Globe() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-[#020617] via-[#050a1f] to-black">
      <Canvas>
        <ResponsiveCamera />

        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <pointLight position={[-5, -3, -5]} intensity={1.2} />

        <StarsBackground />

        <Earth />

        <OrbitControls
          enableZoom={false}
          autoRotate={false}
          enablePan={false}
        />
      </Canvas>
    </div>
  );
}
