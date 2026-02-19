"use client";

import {
  Canvas,
  extend,
  useLoader,
  useThree,
  useFrame,
} from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { Stars } from "@react-three/drei";
import { type ThreeElement } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    orbitControls: ThreeElement<typeof OrbitControls>;
  }
}

extend({ OrbitControls });

function Controls() {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    controlsRef.current?.update();
  });

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={true}
    />
  );
}

function EarthModel() {
  const { viewport } = useThree();
  const isMobile = viewport.width < 6;

  const scale = isMobile ? viewport.height * 0.05 : viewport.height * 0.1;

  const groupRef = useRef<any>(null);
  const EarthGLTF = useLoader(GLTFLoader, "/earth/earth_planet.glb");
  const indiaFacing = -1.6;
  const verticalFix = 0.4;
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.09;
    }
  });

  return (
    <group ref={groupRef} rotation={[verticalFix, indiaFacing, 0]}>
      <primitive object={EarthGLTF.scene} scale={scale} />
    </group>
  );
}
//glb
function SpaceModel() {
  const { viewport } = useThree();
  const spaceRef = useRef<any>(null);

  const scale =
    viewport.width < 6 ? viewport.height * 0.6 : viewport.height * 1.2;

  const GalaxyGLTF = useLoader(GLTFLoader, "/earth/galaxy.glb");

  useFrame(() => {
    if (spaceRef.current) {
      spaceRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <primitive
      ref={spaceRef}
      object={GalaxyGLTF.scene}
      scale={scale}
      position={[0, 0, -5]}
    />
  );
}

//jpg-space
function SpaceBackground() {
  const texture = useLoader(THREE.TextureLoader, "/earth/galaxy1.jpg");

  const spaceRef = useRef<THREE.Mesh>(null!);

  useFrame(() => {
    if (spaceRef.current) {
      spaceRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <mesh ref={spaceRef}>
      <sphereGeometry args={[50, 64, 64]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

//Drei-stars
function StarsBG() {
  return (
    <Stars
      radius={300}
      depth={80}
      count={4000}
      factor={14}
      saturation={0}
      fade
      speed={3}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} />

        {/* <SpaceBackground /> */}
        {/* <SpaceModel /> */}
        <EarthModel />
        <StarsBG />
        <Controls />
      </Canvas>
    </div>
  );
}
