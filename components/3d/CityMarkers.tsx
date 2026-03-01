"use client";

import { latLngToSphere } from "@/lib/latLngToSphere";
import * as THREE from "three";

const cities = [
  { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
  { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
  { name: "Hubli", lat: 15.3647, lng: 75.124 },
  { name: "Ballari", lat: 15.1394, lng: 76.9214 },
  { name: "Chitradurga", lat: 14.2306, lng: 76.398 },
  { name: "Davanagere", lat: 14.4644, lng: 75.9218 },
];

export default function CityMarkers({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <>
      {cities.map((city, index) => {
        const base = latLngToSphere(city.lat, city.lng, 1.01);
        const top = latLngToSphere(city.lat, city.lng, 1.12);

        const direction = base.clone().normalize();
        const position = base.clone().add(direction.multiplyScalar(0.05));

        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          direction,
        );

        return (
          <mesh key={index} position={position} quaternion={quaternion}>
            <cylinderGeometry args={[0.01, 0.01, 0.1, 16]} />
            <meshStandardMaterial color="red" emissive="red" />
          </mesh>
        );
      })}
    </>
  );
}
