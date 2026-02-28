"use client";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

export default function Clouds() {
  const clouds = useLoader(THREE.TextureLoader, "/8k_earth_clouds.jpg");

  return (
    <mesh>
      <sphereGeometry args={[1.01, 128, 128]} />
      <meshPhongMaterial
        map={clouds}
        transparent
        opacity={0.7}
        depthWrite={false}
      />
    </mesh>
  );
}
