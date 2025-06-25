import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { useRef, useState } from "react";
import Cube from "../components/Cube";

const Test = () => {
  const controlsRef = useRef();
  const undoRedoBtnRef = useRef([]);

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* 🎲 3D Canvas */}
      <div className="flex flex-1 items-center justify-center">
        <div className="m-4 w-[32rem] h-[32rem]">
          <Canvas
            className="bg-gray-500 rounded-lg shadow-lg"
            camera={{ position: [3.5, 3.5, 3.5] }}
            raycaster={{ firstHitOnly: true }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Cube controlsRef={controlsRef} undoRedoBtnRef={undoRedoBtnRef} />
            <TrackballControls ref={controlsRef} noZoom noPan rotateSpeed={3} />
          </Canvas>
        </div>
      </div>

      {/* 🔴 Undo/Redo Buttons */}
      <div className="flex justify-center items-center gap-6 p-6 border-t border-red-500 bg-red-100">
        <button
          className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
          onClick={(e) => undoRedoBtnRef.current[0]()}
        >
          {/* <img
            src="https://cube.rider.biz/visualcube.php?fmt=svg&size=150&pzl=3&fc=rwywwwbwborggrryobygybgyrbryyyyyyyyyooooooooobbbbbbbbb&bg=t"
            width={150}
            height={150}
            alt="Rubik's Cube"
          /> */}
          Undo
        </button>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
          onClick={(e) => undoRedoBtnRef.current[1]()}
        >
          Redo
        </button>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
          onClick={(e) => undoRedoBtnRef.current[2]()}
        >
          Do all
        </button>
      </div>
    </div>
  );
};

export default Test;
