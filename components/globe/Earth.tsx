import { useRef } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { TextureLoader } from "three";
import * as THREE from "three";

export default function Earth() {
  const earthRef = useRef<THREE.Mesh>(null!);
  const { viewport } = useThree();

  const isMobile = viewport.width < 6;

  const scale = isMobile ? 1.2 : 1.5;

  const dayMap = useLoader(TextureLoader, "/textures/earth_day.jpg");
  const nightMap = useLoader(TextureLoader, "/textures/earth_night.jpg");

  const indiaRotation = -1.36;

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0004;
    }
  });

  return (
    <mesh ref={earthRef} rotation={[0, indiaRotation, 0]} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        map={dayMap}
        emissiveMap={nightMap}
        emissive={"#ffffff"}
        emissiveIntensity={0.6}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
}
