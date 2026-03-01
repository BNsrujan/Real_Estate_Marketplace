"use client";

import { useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { latLngToSphere } from "@/lib/latLngToSphere";
import * as THREE from "three";

type GLTFResult = GLTF & {
  scene: THREE.Group;
};

function CityModel({
  path,
  lat,
  lng,
}: {
  path: string;
  lat: number;
  lng: number;
}) {
  const gltf = useGLTF(path) as GLTFResult;

  const position = latLngToSphere(lat, lng, 1.02);

  const normal = position.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    normal,
  );

  return (
    <primitive
      object={gltf.scene}
      position={position}
      quaternion={quaternion}
      scale={0.02}
    />
  );
}

export default function CityModels({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <>
      <CityModel
        path="/bengaluru/City_Bengaluru/City_Bengaluru.glb"
        lat={12.9716}
        lng={77.5946}
      />

      <CityModel
        path="/mysuru/City_Mysuru/City_Mysuru.glb"
        lat={12.2958}
        lng={76.6394}
      />

      <CityModel
        path="/hubli/City_Hubli/City_Hubli.glb"
        lat={15.3647}
        lng={75.124}
      />

      <CityModel
        path="/ballari/City_Ballari/City_Ballari.glb"
        lat={15.1394}
        lng={76.9214}
      />

      <CityModel
        path="/chitradurga/City_Chitradurga/City_Chitradurga.glb"
        lat={14.2306}
        lng={76.398}
      />

      <CityModel
        path="/davanagere/City_Davanagere/City_Davanagere.glb"
        lat={14.4644}
        lng={75.9218}
      />
    </>
  );
}
