import { Canvas, useFrame } from "@react-three/fiber"
import { Box, Edges, TrackballControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useEffect, useState, use } from "react";

const Cublet = ({ position, controlsRef, pointerRef, refCallback }) => {
  const meshRef = useRef();
  const rotationRef = useRef({ x: [1, 'x'], y: [1, 'y'], z: [1, 'z'] });
  // Run effect when position changes
  useEffect(() => {
    if (refCallback) {
      refCallback(position, meshRef, rotationRef);
    }
  }, []); 
  
  const handlePointerDown = (event) => {
    if (controlsRef.current) controlsRef.current.enabled = false;
  };

  const handlePointerUp = (event) => {
    if (controlsRef.current) controlsRef.current.enabled = true;
  };

  const handlePointerOut = () => {
    if (controlsRef.current) controlsRef.current.enabled = true;  };

  return (
    <Box
      ref={meshRef}
      args={[1, 1, 1]}
      position={position}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOut={handlePointerOut}
    >
      <meshBasicMaterial attach="material-0" color={(position[0] === 1) ? '#B71234' : 'black'} />
      <meshBasicMaterial attach="material-1" color={(position[0] === -1) ? '#FF5800' : 'black'} />
      <meshBasicMaterial attach="material-2" color={(position[1] === 1) ? '#FFFFFF' : 'black'} />
      <meshBasicMaterial attach="material-3" color={(position[1] === -1) ? '#FFD500' : 'black'} />
      <meshBasicMaterial attach="material-4" color={(position[2] === 1) ? '#009B48' : 'black'} />
      <meshBasicMaterial attach="material-5" color={(position[2] === -1) ? '#0046AD' : 'black'} />
      {/* <meshBasicMaterial attach="material-0" color={(true) ? 'red' : 'black'} />
      <meshBasicMaterial attach="material-1" color={(true) ? 'orange' : 'black'} />
      <meshBasicMaterial attach="material-2" color={(true) ? 'white' : 'black'} />
      <meshBasicMaterial attach="material-3" color={(true) ? 'yellow' : 'black'} />
      <meshBasicMaterial attach="material-4" color={(true) ? 'green' : 'black'} />
      <meshBasicMaterial attach="material-5" color={(true) ? 'blue' : 'black'} /> */}
      <Edges threshold={10} lineWidth={4} scale={1.01} color="black" />
    </Box>
  );
};

export default Cublet