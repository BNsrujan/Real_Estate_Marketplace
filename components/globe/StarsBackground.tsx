"use client";

import { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

export default function StarsBackground() {
  const starsRef = useRef<THREE.Points>(null!);

  const starTexture = useLoader(TextureLoader, "/textures/spark1.png");

  const starCount = 5000;

  const positions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const radius = 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }

    return pos;
  }, []);

  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;

      const material = starsRef.current.material as THREE.PointsMaterial;

      material.opacity = 0.7 + Math.sin(clock.elapsedTime * 1.9) * 0.3;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>

      <pointsMaterial
        map={starTexture}
        size={1.9}
        transparent
        opacity={3.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}
