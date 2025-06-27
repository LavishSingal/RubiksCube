import { Canvas } from "@react-three/fiber";
import { TrackballControls } from "@react-three/drei";
import { useRef, useState } from "react";
import Cube from "../components/Cube";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/all";

const useMoveGenerator = () => {
  const moveStackRef = useRef([]);

  const generateRandomMove = () => {
    const faces = ["x", "y", "z"];
    const faceSigns = [-1, 0, 1];
    const directions = [-1, 1];

    return [
      faces[Math.floor(Math.random() * faces.length)],
      faceSigns[Math.floor(Math.random() * faceSigns.length)],
      directions[Math.floor(Math.random() * directions.length)],
    ];
  };

  const generateMoves = (count = 30) => {
    moveStackRef.current = []; // clear stack
    for (let i = 0; i < count; i++) {
      moveStackRef.current.push(generateRandomMove());
    }
    console.log("Generated Moves (as arrays):", moveStackRef.current);
  };

  return { moveStackRef, generateMoves };
};

const PuzzlePage = () => {
  const lockedRef = useRef(true);
  const controlsRef = useRef();
  const undoRedoBtnRef = useRef([]);
  const { moveStackRef, generateMoves } = useMoveGenerator();
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

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

  const handleCompleted = () => {
    if (!completed) {
      setCompleted(true);
      let tl_temp = gsap.timeline();
      tl_temp.to(".completed-text", {
        y: -100,
        duration: 1.5,
        ease: "power4.out",
        opacity: 1,
      });
      tl_temp.to(".completed-text", {
        y: 0,
        duration: 1.5,
        ease: "power4.in",
        opacity: 0,
        delay: 1.5,
      });
    }
  };

  const handleStartOrReset = () => {
    if (!started) {
      // lockedRef.current = false;
      undoRedoBtnRef.current[2](true);
      generateMoves(30);
      undoRedoBtnRef.current[3](moveStackRef.current);
      setStarted(true);
      setCompleted(false);
    } else {
      window.location.reload();
    }
  };

  // ✅ Dynamic button label
  const getButtonLabel = () => {
    if (!started) return "Start";
    if (completed) return "New Puzzle";
    return "Reset";
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-[#090040] via-[#15005e] to-black text-white flex flex-col items-center">
      <h1 className="text-6xl text-[#FFCC00] font-bold text-shadow-lg main-text mt-20">
        Cube Coach
      </h1>

      <section className="w-full flex flex-col lg:flex-row items-center justify-center gap-16 my-16">
        <div className="w-[40rem] lg:w-[32rem] max-sm:w-[26rem] h-[36rem] bg-[#B13BFF] rounded-4xl p-10 flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4 text-[#FFCC00]">
              Your Puzzle
            </h2>
            <p className="text-lg mb-2">
              <span className="font-semibold">Objective:</span> Complete the{" "}
              <span className="bg-black text-white px-1 rounded">
                white face
              </span>{" "}
              of the cube. (More puzzles coming soon!)
            </p>
            <p className="text-sm text-gray-200 mt-2">
              Rotate the cube using your mouse and use the undo/redo buttons
              below to solve the puzzle.
            </p>
            <button
              className="bg-[#FFCC00] text-white px-5 py-2 mt-8 rounded-lg hover:bg-yellow-600 transition"
              onClick={handleStartOrReset}
            >
              {getButtonLabel()}
            </button>
          </div>
          <div>
            <p className="text-sm text-gray-300">
              Hint: Start with the edge pieces!
            </p>
          </div>
        </div>

        {/* 🧊 Cube Card */}
        <div className="w-[40rem] lg:w-[32rem] max-sm:w-[26rem] h-[36rem] bg-[#B13BFF] rounded-4xl flex flex-col items-center justify-center p-4 relative">
          {/* 🔵 Background Text */}
          <h1 className="text-3xl font-bold text-[#FFCC00] bg-[#471396] px-4 py-2 rounded-lg absolute top-8 left-1/2 transform -translate-x-1/2 z-0 whitespace-nowrap opacity-0 pointer-events-none completed-text">
            Puzzle Completed
          </h1>

          {/* 🟣 Cube Canvas */}
          <div className="w-[28rem] max-sm:w-[24rem] h-[28rem] bg-gray-200 rounded-xl shadow-xl z-10">
            <Canvas
              camera={{ position: [3.5, 3.5, 3.5] }}
              raycaster={{ firstHitOnly: true }}
            >
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <Cube
                controlsRef={controlsRef}
                undoRedoBtnRef={undoRedoBtnRef}
                goal={"white"}
                setComp={handleCompleted}
              />
              <TrackballControls
                ref={controlsRef}
                noZoom
                noPan
                rotateSpeed={3}
              />
            </Canvas>
          </div>

          {/* 🔴 Buttons */}
          <div className="flex gap-4 mt-6 z-10">
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
          </div>
        </div>
      </section>
    </div>
  );
};

export default PuzzlePage;
