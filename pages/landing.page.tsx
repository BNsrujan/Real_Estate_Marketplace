"use client"
import { Canvas, extend, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { type ThreeElement, type ThreeElements } from '@react-three/fiber'

declare module '@react-three/fiber' {
  interface ThreeElements {
    orbitControls: ThreeElement<typeof OrbitControls>
  }
}


extend({OrbitControls})

function Controls(){
    const camera = useThree((state) => state.camera)
    const gl = useThree((state) => state.gl)
    const size = useThree((state) => state.size)
    const controlsRef = useRef<any>(null);

    useEffect(()=>{
        controlsRef.current?.update();
    });

    return(
        <orbitControls
            ref={controlsRef}
            args={[camera,gl.domElement]}
            enableZoom={true}
        />
    )
}


function EarchModel(){
    const {viewport} = useThree();
    const isMobile = viewport.width < 6; 

     const scale = isMobile
    ? viewport.height * 0.05   
    : viewport.height * 0.10; 


    const EarthGLTF = useLoader(GLTFLoader,"/earth/earth_planet.glb")
    return <primitive object={EarthGLTF.scene} scale={scale} />
}

export default function LandingPage(){
    return(
        <div className="w-full h-screen">
            <Canvas camera={{position:[0,0,5],fov:75}} className="h-scree">
                <ambientLight intensity={0.2}/>
                <directionalLight position={[5,5,5]}/>             
                <Controls />
                <EarchModel />
            </Canvas>
        </div>
    )
}