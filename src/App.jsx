import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";
import Cube from "./components/Cube";

const App = () => {
  const controlsRef = useRef();
  const undoRedoBtnRef = useRef([]);
  const [showAlert, setShowAlert] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* 🔵 Alert Message */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-100 border border-blue-300 text-blue-800 px-6 py-4 rounded-lg shadow-md flex items-center justify-between w-[90%] max-w-xl z-50">
          <p className="text-sm">
            You can rotate cube faces using the keys <strong>W, R, G, B, Y, O</strong> + <strong>← / →</strong> arrows — or use your mouse!
          </p>
          <button
            className="ml-4 text-blue-700 hover:text-blue-900 font-bold text-lg"
            onClick={() => setShowAlert(false)}
          >
            &times;
          </button>
        </div>
      )}

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
            <TrackballControls
              ref={controlsRef}
              noZoom
              noPan
              rotateSpeed={3}
            />
          </Canvas>
        </div>
      </div>

      {/* 🔴 Undo/Redo Buttons */}
      <div className="flex justify-center items-center gap-6 p-6 border-t border-red-500 bg-red-100">
        <button
          className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition duration-200"
          onClick={(e) => undoRedoBtnRef.current[0](e)}
        >
          Undo
        </button>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
          onClick={(e) => undoRedoBtnRef.current[1](e)}
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default App;
