"use client";

import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function Globe() {
  const texture = useLoader(THREE.TextureLoader, "/8k_earth_daymap.jpg");

  return (
    <mesh>
      <sphereGeometry args={[1, 128, 128]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
