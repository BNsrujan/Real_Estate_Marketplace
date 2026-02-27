"use client";
import {
  Canvas,
  extend,
  useLoader,
  useThree,
  useFrame,
} from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import * as THREE from "three";
import { Stars, Text, Html, Billboard } from "@react-three/drei";
import { type ThreeElement } from "@react-three/fiber";

declare module "@react-three/fiber" {
  interface ThreeElements {
    orbitControls: ThreeElement<typeof OrbitControls>;
  }
}

extend({ OrbitControls });

function Controls({ controlsRef }: any) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableZoom={true}
      minDistance={1.5}
      maxDistance={5}
    />
  );
}

function EarthModel({ visible }: { visible: boolean }) {
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
    <group
      visible={visible}
      ref={groupRef}
      rotation={[verticalFix, indiaFacing, 0]}
    >
      <primitive object={EarthGLTF.scene} scale={scale} />
    </group>
  );
}

function India({ visible }: { visible: boolean }) {
  const gltf = useLoader(GLTFLoader, "/india/India_Map/India_Full_Map.glb");

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
  }, [gltf]);

  return (
    <group
      visible={visible}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[1.8, 1.8, 1.8]}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

function Karnataka({ visible }: { visible: boolean }) {
  const gltf = useLoader(
    GLTFLoader,
    "/karnataka/Karnataka_map/Karnataka_Map.glb",
  );

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    gltf.scene.position.sub(center);
  }, [gltf]);

  return (
    <group
      visible={visible}
      rotation={[Math.PI / 2, 0, 0]}
      scale={[3.5, 3.5, 3.5]}
    >
      <primitive object={gltf.scene} />
    </group>
  );
}

function Zoom({ setEarth, setIndia, setKar, controlsRef }: any) {
  const { camera } = useThree();

  const last = useRef("earth");

  useFrame(() => {
    if (!controlsRef.current) return;

    const dist = camera.position.distanceTo(controlsRef.current.target);

    if (last.current === "earth") {
      if (dist < 3.4) {
        last.current = "india";
        setEarth(false);
        setIndia(true);
        setKar(false);
      }
    } else if (last.current === "india") {
      if (dist > 3.8) {
        last.current = "earth";
        setEarth(true);
        setIndia(false);
        setKar(false);
      } else if (dist < 2.2) {
        last.current = "kar";
        setEarth(false);
        setIndia(false);
        setKar(true);
      }
    } else if (last.current === "kar") {
      if (dist > 2.5) {
        last.current = "india";
        setEarth(false);
        setIndia(true);
        setKar(false);
      }
    }
  });

  return null;
}

export default function LandingPage() {
  const [showEarth, setShowEarth] = useState(true);
  const [showIndia, setShowIndia] = useState(false);
  const [showKar, setShowKar] = useState(false);

  const controlsRef = useRef<any>(null);

  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} />

        <EarthModel visible={showEarth} />
        <India visible={showIndia} />
        <Karnataka visible={showKar} />

        <Stars
          radius={300}
          depth={80}
          count={4000}
          factor={14}
          saturation={0}
          fade
          speed={3}
        />

        <Controls controlsRef={controlsRef} />

        <Zoom
          setEarth={setShowEarth}
          setIndia={setShowIndia}
          setKar={setShowKar}
          controlsRef={controlsRef}
        />
      </Canvas>
    </div>
  );
}
