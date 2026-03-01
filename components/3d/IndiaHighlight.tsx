"use client";

import { latLngToSphere } from "@/lib/latLngToSphere";
import * as THREE from "three";

export default function IndiaHighlight({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const position = latLngToSphere(22, 78, 1.01);

  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal,
  );

  return (
    <mesh position={position} quaternion={quaternion}>
      <circleGeometry args={[0.35, 64]} />
      <meshBasicMaterial color="#00ff88" transparent opacity={0.35} />
    </mesh>
  );
}
