import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { useRef } from "react";
import Cube from "../components/Cube";

const PuzzlePage = () => {
  const controlsRef = useRef();
  const undoRedoBtnRef = useRef([]);

  return (
    <div className="flex h-screen bg-gradient-to-bl from-white to-gray-200 text-black">
      
      {/* 🧠 Left Side – Instructions */}
      <div className="w-1/3 p-10 flex flex-col justify-between border-r border-gray-300">
        <div>
          <h2 className="text-3xl font-bold mb-4">Your Puzzle</h2>
          <p className="text-lg mb-2">
            <span className="font-semibold">Objective:</span> Complete the <span className="text-white font-bold bg-black px-1 rounded">white face</span> of the cube.
          </p>
          <p className="text-gray-700 mt-2">
            Rotate the cube and use the undo/redo buttons below to solve the puzzle.
          </p>
        </div>

        {/* Optional: Progress bar / Hint */}
        <div>
          <p className="text-sm text-gray-500">Hint: Start with the edge pieces!</p>
          <div className="mt-4">
            <label className="block text-sm mb-1">Progress</label>
            <div className="w-full bg-gray-300 h-3 rounded">
              <div className="bg-green-500 h-3 rounded" style={{ width: "45%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 🧊 Right Side – Cube */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="w-[32rem] h-[32rem]">
          <Canvas
            className="bg-gray-200 rounded-xl shadow-xl"
            camera={{ position: [3.5, 3.5, 3.5] }}
            raycaster={{ firstHitOnly: true }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <Cube controlsRef={controlsRef} undoRedoBtnRef={undoRedoBtnRef} />
            <TrackballControls ref={controlsRef} noZoom noPan rotateSpeed={3} />
          </Canvas>
        </div>

        {/* 🔴 Controls */}
        <div className="flex gap-4 mt-6">
          <button
            className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition"
            onClick={() => undoRedoBtnRef.current[0]()}
          >
            Undo
          </button>
          <button
            className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition"
            onClick={() => undoRedoBtnRef.current[1]()}
          >
            Redo
          </button>
          <button
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition"
            onClick={() => undoRedoBtnRef.current[2]()}
          >
            Solve All
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePage;
