import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import { useGSAP } from "@gsap/react";

const Home = () => {
  const navigate = useNavigate();
  let anim = null;
  const handleMouseEnter = (e) => {
    // console.log("Mouse entered:", e.currentTarget);
    // console.log(e.currentTarget.classList.contains("coming-soon"));
    anim = gsap.timeline();
    anim.to(e.currentTarget, {
      scale: 1.1,
      boxShadow: "0 10px 20px rgba(177, 59, 255, 0.8)",
      duration: 0.3,
      ease: "power1.inOut",
    });
    if (e.currentTarget.classList.contains("coming-soon")) {
      anim.to(
        e.currentTarget.querySelector(".soon-text"),
        {
          y: 60,
          duration: 0.3,
          ease: "power1.inOut",
        },
        "<"
      );
    }
  };

  const handleMouseLeave = (e) => {
    // console.log("Mouse left:", e.currentTarget);
    if (anim) {
      anim.reverse();
      anim = null;
    }
  };

  const handleClick = () => {
    navigate("/practice");
  };

  // gsap.to();
  // split elements with the class "split" into words and characters
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
    <div className="w-full min-h-screen bg-gradient-to-b from-[#090040] via-[#15005e] to-black flex flex-col items-center">
      <h1 className="text-6xl text-[#FFCC00] font-bold text-shadow-lg main-text mt-20">
        Cube Coach
      </h1>
      <section className="w-full flex flex-col lg:flex-row items-center justify-center gap-30 my-40 mx-32">
        <div
          className="w-[40rem] lg:w-[32rem] max-sm:w-[26rem] h-[36rem] bg-[#B13BFF] rounded-4xl flex flex-col items-center relative coming-soon"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src="/train.svg"
            alt="Rubik's Cube"
            className="h-3/4 mx-auto mt-4"
          />
          <div className="relative mt-4 flex justify-center">
            {/* Front Heading */}
            <h1 className="text-3xl font-bold text-[#FFCC00] bg-[#471396] px-4 py-2 rounded-lg relative z-10 whitespace-nowrap">
              Tutorial Mode
            </h1>

            {/* Back Heading (centered by content, one-line only) */}
            <h1 className="text-xl font-bold text-[#FFCC00] bg-[#471396] px-4 py-2 rounded-lg absolute top-0 left-1/2 -translate-x-1/2 z-0 whitespace-nowrap soon-text">
              Coming Soon
            </h1>
          </div>
        </div>
        <div
          className="w-[40rem] lg:w-[32rem] max-sm:w-[26rem] h-[36rem] bg-[#B13BFF] rounded-4xl flex flex-col relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/a/a6/Rubik%27s_cube.svg"
            alt="Rubik's Cube"
            className="h-3/4 mx-auto mt-4"
          />
          <h1 className="text-3xl font-bold text-[#FFCC00] bg-[#471396] inline-block px-4 py-2 rounded-lg mt-4 mx-auto">
            Puzzle Mode
          </h1>
        </div>
      </section>
    </div>
  );
};

export default Home;
