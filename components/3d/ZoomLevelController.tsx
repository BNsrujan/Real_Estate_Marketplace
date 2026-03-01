"use client";

import { useThree, useFrame } from "@react-three/fiber";

export default function ZoomLevelController({
  setZoomLevel,
  controlsRef,
}: any) {
  const { camera } = useThree();

  useFrame(() => {
    if (!controlsRef.current) return;

    const distance = camera.position.distanceTo(controlsRef.current.target);

    if (distance > 4) {
      setZoomLevel(0); // India
    } else if (distance > 2.2) {
      setZoomLevel(1); // Karnataka
    } else {
      setZoomLevel(2); // Cities
    }
  });

  return null;
}
