import { Canvas, useThree } from "@react-three/fiber"
import { Box, Edges, TrackballControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState } from "react";
import Cube from "./components/Cube";

const cubic_posiitons = []
const App = () => {
  const controlsRef = useRef();

  return (
    <div className="bg-white text-black h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl">Helllo</h1>
      <Canvas className="w-full h-full m-4 bg-gray-500" camera={{ position: [5, 5, 5] }} raycaster={{ firstHitOnly: true }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Cube controlsRef={controlsRef} />
        <TrackballControls ref={controlsRef} noZoom noPan/>\
      </Canvas>
    </div>
  )
}

export default App