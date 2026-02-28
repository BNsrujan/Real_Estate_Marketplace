"use client";

import { latLngToSphere } from "@/lib/latLngToSphere";
import * as THREE from "three";

export default function KarnatakaHighlight({ visible }: { visible: boolean }) {
  if (!visible) return null;

  const position = latLngToSphere(15.3, 75.7, 1.02);

  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal,
  );

  return (
    <mesh position={position} quaternion={quaternion}>
      <circleGeometry args={[0.12, 64]} />
      <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} />
    </mesh>
  );
}
