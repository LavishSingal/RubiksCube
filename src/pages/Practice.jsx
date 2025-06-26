import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { useRef } from "react";
import Cube from "../components/Cube";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";

const PuzzlePage = () => {
  const controlsRef = useRef();
  const undoRedoBtnRef = useRef([]);

  useGSAP(() => {
    gsap.registerPlugin(SplitText);
    const split = new SplitText(".main-text", { type: "chars, words" });
    const tl = gsap.timeline();
    tl.from(split.words[0], {
      y: -200,
      duration: 1.1,
      opacity: 0,
      ease: "sine.Out",
    }).from(
      split.words[1],
      {
        y: 200,
        duration: 1.1,
        opacity: 0,
        ease: "sine.Out",
      },
      "<"
    );

    tl.to(split.words, {
      scale: 1.2,
      duration: 1.1,
      ease: "power4.Out",
    });

    tl.to(split.chars, {
      color: "#B13BFF",
      duration: 1.1,
      ease: "power4.Out",
      stagger: 0.1,
      rotateX: 180,
    }).to(
      split.chars,
      {
        color: "#FFCC00",
        duration: 1.1,
        ease: "power4.Out",
        stagger: 0.1,
        rotateX: 0,
      },
      "<+0.5"
    );
    tl.to(split.words, {
      scale: 1,
      duration: 1.1,
      ease: "power4.out",
    });
  });

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#090040] via-[#15005e] to-black text-white flex flex-col items-center">
      <h1 className="text-6xl text-[#FFCC00] font-bold text-shadow-lg main-text mt-20">
        Cube Coach
      </h1>

      <section className="w-full flex flex-col lg:flex-row items-center justify-center gap-16 my-16">
        {/* 🧠 Instruction Card */}
        <div className="w-[40rem] lg:w-[32rem] max-sm:w-[26rem] h-[36rem] bg-[#B13BFF] rounded-4xl p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-[#FFCC00]">Your Puzzle</h2>
            <p className="text-lg mb-2">
              <span className="font-semibold">Objective:</span> Complete the <span className="bg-black text-white px-1 rounded">white face</span> of the cube.
            </p>
            <p className="text-sm text-gray-200 mt-2">
              Rotate the cube and use the undo/redo buttons below to solve the puzzle.
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-300">Hint: Start with the edge pieces!</p>
            <div className="mt-4">
              <label className="block text-sm mb-1 text-white">Progress</label>
              <div className="w-full bg-gray-300 h-3 rounded">
                <div className="bg-green-500 h-3 rounded" style={{ width: "45%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* 🧊 Cube Card */}
        <div className="w-[40rem] lg:w-[32rem] max-sm:w-[26rem] h-[36rem] bg-[#B13BFF] rounded-4xl flex flex-col items-center justify-center p-4">
          <div className="w-[28rem] h-[28rem] bg-gray-200 rounded-xl shadow-xl">
            <Canvas
              camera={{ position: [3.5, 3.5, 3.5] }}
              raycaster={{ firstHitOnly: true }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Cube controlsRef={controlsRef} undoRedoBtnRef={undoRedoBtnRef} />
              <TrackballControls ref={controlsRef} noZoom noPan rotateSpeed={3} />
            </Canvas>
          </div>

          {/* 🔴 Buttons */}
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
      </section>
    </div>
  );
};

export default PuzzlePage;
