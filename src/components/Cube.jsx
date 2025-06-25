import * as THREE from "three";
import { useRef, useEffect } from "react";
import Cublet from "./Cublet";
import gsap from "gsap";
import { useThree } from "@react-three/fiber";
import { applyShiftToGrid } from "./gridLogic";

const Cube = ({ controlsRef, undoRedoBtnRef }) => {
  const cubletRefs = useRef({});
  const faces = ["x", "y", "z"];
  const mousePressRef = useRef(false);
  const pointerRef = useRef(false);
  const mouseInt = useRef(null);
  const face = useRef(null);
  const minus_face = useRef(1);
  const cubelets = [];
  const mouseScreen = useRef([0, 0]);
  const dirVectors = useRef({});
  const { camera, size } = useThree();
  const controlSwitch = useRef(true);
  const lastHeldKeyRef = { current: null };
  const centerCublets = {
    w: null,
    r: null,
    o: null,
    g: null,
    b: null,
    y: null,
  };
  const animationStack = useRef([]);
  const animationRedoStack = useRef([]);
  const faceNormal = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };
  const cubeState = useRef([
    ["W", "W", "W", "W", "W", "W", "W", "W", "W"],
    ["O", "O", "O", "O", "O", "O", "O", "O", "O"],
    ["G", "G", "G", "G", "G", "G", "G", "G", "G"],
    ["Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    ["R", "R", "R", "R", "R", "R", "R", "R", "R"],
    ["B", "B", "B", "B", "B", "B", "B", "B", "B"],
  ]);

  const updateCubeState = (face, faceSign, direction) => {
    applyShiftToGrid(cubeState.current, face, faceSign, direction);
  };

  const dotOverMagB = (a, b) => {
    if (a.length !== 2 || b.length !== 2) {
      throw new Error("Both vectors must have exactly 2 components");
    }
    // 1. dot product
    const dot = a[0] * b[0] + a[1] * b[1];

    // 2. magnitude of b
    const magB = Math.hypot(b[0], b[1]); // equivalent to sqrt(b0² + b1²)
    const magA = Math.hypot(a[0], a[1]);

    if (magB === 0 || magA === 0) {
      return 0; // Avoid division by zero
    }

    // 3. normalized dot
    return dot / magB;
  };

  const getAxisRoundedToOne = (vec) => {
    const rounded = {
      x: Math.round(vec.x * 100) / 100,
      y: Math.round(vec.y * 100) / 100,
      z: Math.round(vec.z * 100) / 100,
    };

    for (const key in rounded) {
      if (Math.abs(rounded[key]) === 1) {
        return key; // Return the first axis that matches
      }
    }
    return null;
  };

  const handlePointerUpGlobal = (event) => {
    let rotateface = null;
    if (!controlSwitch.current) return;
    if (!mousePressRef.current) return;
    mousePressRef.current = false;
    // console.log(event.clientX, event.clientY);

    const x_dir = event.clientX - mouseScreen.current[0];
    const y_dir = event.clientY - mouseScreen.current[1];
    const dir = [x_dir, y_dir];
    const deltas = {};

    for (const face of faces) {
      deltas[face] = dotOverMagB(dir, dirVectors.current[face]);
    }

    const maxAxis = Object.keys(deltas).reduce((a, b) =>
      Math.abs(deltas[a]) > Math.abs(deltas[b]) ? a : b
    );
    let maxValue = deltas[maxAxis];
    let direction = 0;
    if (maxAxis !== face.current && Math.abs(maxValue) > 10) {
      direction = maxValue === 0 ? 0 : maxValue > 0 ? 1 : -1;

      rotateface = ["x", "y", "z"].find(
        (axis) => axis !== maxAxis && axis !== face.current
      );
    } else rotateface = null;

    if (maxAxis === "z" || (rotateface === "z" && maxAxis === "x")) {
      maxValue = -1 * maxValue;
      direction = maxValue === 0 ? 0 : maxValue > 0 ? 1 : -1;
    }
    direction *= minus_face.current;
    if (rotateface === "x") {
      let sign =
        mouseInt.current[0] > 0.5 ? 1 : mouseInt.current[0] < -0.5 ? -1 : 0;
      controlSwitch.current = false;
      rotateFaceQuat("x", sign, -direction, 1);
    } else if (rotateface === "y") {
      let sign =
        mouseInt.current[1] > 0.5 ? 1 : mouseInt.current[1] < -0.5 ? -1 : 0;
      controlSwitch.current = false;
      rotateFaceQuat("y", sign, direction, 1);
    } else if (rotateface === "z") {
      let sign =
        mouseInt.current[2] > 0.5 ? 1 : mouseInt.current[2] < -0.5 ? -1 : 0;
      controlSwitch.current = false;
      rotateFaceQuat("z", sign, direction, 1);
    }
    mouseInt.current = null;
    face.current = null;
  };

  const handleKeyDown = (event) => {
    const key = event.key.toLowerCase();

    if (key in centerCublets) {
      lastHeldKeyRef.current = key;
    }

    if (key === "arrowleft" || key === "arrowright") {
      const heldKey = lastHeldKeyRef.current;

      if (heldKey && centerCublets[heldKey] && controlSwitch.current) {
        controlSwitch.current = false;

        let direction = key === "arrowleft" ? -1 : 1;
        const faceRef = centerCublets[heldKey];
        const currentPos = new THREE.Vector3();
        faceRef.current.getWorldPosition(currentPos);

        const face = getAxisRoundedToOne(currentPos);
        if (!face) return;

        direction *= -1; // Reverse direction for z-axis
        direction *= Math.round(currentPos[face]);

        rotateFaceQuat(face, Math.round(currentPos[face]), direction, 1);
      }
    }
  };

  const handleKeyUp = (event) => {
    const key = event.key.toLowerCase();
    if (key === lastHeldKeyRef.current) {
      lastHeldKeyRef.current = null;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("pointerup", handlePointerUpGlobal);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("pointerup", handlePointerUpGlobal);
    };
  }, []);

  const handleUndo = () => {
    // console.log("Undo key pressed");
    // console.log("U key pressed");
    if (animationStack.current.length > 0 && controlSwitch.current) {
      const lastAnimation = animationStack.current.pop();
      animationRedoStack.current.push(lastAnimation);
      controlSwitch.current = false;
      // console.log("Undoing last animation:", lastAnimation);
      rotateFaceQuat(
        lastAnimation[0],
        lastAnimation[1],
        -lastAnimation[2],
        lastAnimation[3],
        true
      );
      // console.log("move reversed");
      // Your custom logic here
    }
  };

  const handleRedo = () => {
    // console.log("Undo key pressed");
    // console.log("U key pressed");
    if (animationRedoStack.current.length > 0 && controlSwitch.current) {
      const lastAnimation = animationRedoStack.current.pop();
      animationStack.current.push(lastAnimation);
      controlSwitch.current = false;
      rotateFaceQuat(
        lastAnimation[0],
        lastAnimation[1],
        lastAnimation[2],
        lastAnimation[3],
        true
      );
      // Your custom logic here
    }
  };

  const handleDoAll = () => {
    const doNextUndo = () => {
      if (animationStack.current.length === 0) return;

      if (controlSwitch.current) {
        handleUndo();
        setTimeout(doNextUndo, 100); // delay for animation duration
      } else {
        setTimeout(doNextUndo, 100); // check again after a short delay
      }
    };

    doNextUndo();
  };

  const registerCublet = (position, ref, rotationRef) => {
    const key = position.join(",");
    cubletRefs.current[key] = { ref, rotationRef };
    if (position[0] === 1 && position[1] === 0 && position[2] === 0) {
      centerCublets.r = ref;
    }
    if (position[0] === -1 && position[1] === 0 && position[2] === 0) {
      centerCublets.o = ref;
    }
    if (position[0] === 0 && position[1] === 1 && position[2] === 0) {
      centerCublets.w = ref;
    }
    if (position[0] === 0 && position[1] === -1 && position[2] === 0) {
      centerCublets.y = ref;
    }
    if (position[0] === 0 && position[1] === 0 && position[2] === 1) {
      centerCublets.g = ref;
    }
    if (position[0] === 0 && position[1] === 0 && position[2] === -1) {
      centerCublets.b = ref;
    }
  };

  const rotateFaceQuat = (
    face,
    faceSign,
    direction,
    amount,
    isUndo = false
  ) => {
    // console.log("hello");
    if (!isUndo) {
      animationStack.current.push([face, faceSign, direction, amount]);
      animationRedoStack.current = [];
    }
    updateCubeState(face, faceSign, direction);
    // else{
    //   animationStack.current.pop();
    // }
    // const t1 = gsap.timeline();
    Object.values(cubletRefs.current).forEach(({ ref, rotationRef }) => {
      if (!ref.current) return;
      // console.log("step 1");

      const currentPos = new THREE.Vector3();
      ref.current.getWorldPosition(currentPos);
      const faceRotated = Math.round(currentPos[face]);
      // console.log(faceRotated, faceSign);
      if (faceRotated === faceSign) {
        // console.log("step2");
        const new_dir = rotationRef.current[face][1];
        const quat = new THREE.Quaternion();
        const mesh = ref.current;

        const targetPos = mesh.position.clone();

        quat.setFromAxisAngle(
          faceNormal[new_dir],
          (Math.PI / 2) * direction * rotationRef.current[face][0] * amount
        );
        const targetQuat = new THREE.Quaternion();
        const currentQuat = mesh.quaternion.clone();
        targetQuat.multiplyQuaternions(currentQuat, quat);
        targetQuat.normalize();

        const axisIndex = ["x", "y", "z"].indexOf(face);

        const fromQuat = mesh.quaternion.clone();
        const toQuat = targetQuat.clone();

        gsap.to(
          { t: 0, angle: 0 },
          {
            t: 1,
            angle: (Math.PI / 2) * direction * amount,
            duration: 0.3,
            ease: "sine.inOut",
            onUpdate() {
              const state = this.targets()[0];

              // Quaternion slerp
              mesh.quaternion.copy(fromQuat).slerp(toQuat, state.t);

              // Position circular path
              const theta = state.angle;
              const axisA = faces[(axisIndex + 1) % 3];
              const axisB = faces[(axisIndex + 2) % 3];

              mesh.position[axisA] =
                targetPos[axisA] * Math.cos(theta) -
                targetPos[axisB] * Math.sin(theta);
              mesh.position[axisB] =
                targetPos[axisA] * Math.sin(theta) +
                targetPos[axisB] * Math.cos(theta);

              mesh.position[faces[axisIndex]] = faceSign;
            },
            onComplete: () => {
              controlSwitch.current = true;
              // console.log("done");
            },
          }
        );

        // animationStack.current.push(t1);

        if (face === "x") {
          let origY = rotationRef.current.y[0];
          let origZ = rotationRef.current.z[0];
          rotationRef.current.y[0] = -origZ * direction;
          rotationRef.current.z[0] = origY * direction;

          origY = rotationRef.current.y[1];
          origZ = rotationRef.current.z[1];
          rotationRef.current.y[1] = origZ;
          rotationRef.current.z[1] = origY;
        } else if (face === "y") {
          let origX = rotationRef.current.x[0];
          let origZ = rotationRef.current.z[0];
          rotationRef.current.x[0] = origZ * direction;
          rotationRef.current.z[0] = -origX * direction;

          origX = rotationRef.current.x[1];
          origZ = rotationRef.current.z[1];
          rotationRef.current.x[1] = origZ;
          rotationRef.current.z[1] = origX;
        } else if (face === "z") {
          let origX = rotationRef.current.x[0];
          let origY = rotationRef.current.y[0];
          rotationRef.current.x[0] = -origY * direction;
          rotationRef.current.y[0] = origX * direction;

          origX = rotationRef.current.x[1];
          origY = rotationRef.current.y[1];
          rotationRef.current.x[1] = origY;
          rotationRef.current.y[1] = origX;
        }

        while (Math.abs(mesh.rotation[new_dir]) > Math.PI) {
          mesh.rotation[new_dir] -=
            Math.PI * 2 * Math.sign(mesh.rotation[new_dir]);
        }
      }
    });
  };

  const handleCubePointerDown = (event) => {
    if (!controlSwitch.current) return;
    mousePressRef.current = true;
    const worldPoint = event.point.clone();

    mouseInt.current = [
      worldPoint.clone().x,
      worldPoint.clone().y,
      worldPoint.clone().z,
    ].map((coord) => Math.round(coord * 1000) / 1000);

    mouseScreen.current = [event.clientX, event.clientY];
    // console.log("📦 Clicked on WHOLE cube at world point:", worldPoint);
    // console.log(mouseInt.current);
    // console.log("Mouse Screen Coordinates:", mouseScreen.current);

    if (Math.abs(mouseInt.current[0]) === 1.5) {
      face.current = "x";
      dirVectors.current.x = [0, 0];

      let tempArray = [...mouseInt.current];

      let temp1 = new THREE.Vector3(...tempArray);
      let ndc = temp1.project(camera);

      const x_x = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_x = Math.round(((-ndc.y + 1) / 2) * size.height);
      tempArray[1] += 1;

      temp1 = new THREE.Vector3(...tempArray);
      ndc = temp1.project(camera);

      // 3. convert NDC to pixel coordinates
      const x_y = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_y = Math.round(((-ndc.y + 1) / 2) * size.height);

      dirVectors.current.y = [x_y - x_x, y_y - y_x];

      tempArray[1] -= 1;
      tempArray[2] += 1;

      temp1 = new THREE.Vector3(...tempArray);
      ndc = temp1.project(camera);

      // 3. convert NDC to pixel coordinates
      const x_z = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_z = Math.round(((-ndc.y + 1) / 2) * size.height);

      dirVectors.current.z = [x_z - x_x, y_z - y_x];

      if (mouseInt.current[0] === -1.5) {
        minus_face.current = -1;
      } else {
        minus_face.current = 1;
      }
    } else if (Math.abs(mouseInt.current[1]) === 1.5) {
      face.current = "y";
      dirVectors.current.y = [0, 0];

      let tempArray = [...mouseInt.current];

      let temp1 = new THREE.Vector3(...tempArray);
      let ndc = temp1.project(camera);

      const x_x = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_x = Math.round(((-ndc.y + 1) / 2) * size.height);
      tempArray[0] += 1;

      temp1 = new THREE.Vector3(...tempArray);
      ndc = temp1.project(camera);

      // 3. convert NDC to pixel coordinates
      const x_y = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_y = Math.round(((-ndc.y + 1) / 2) * size.height);

      dirVectors.current.x = [x_y - x_x, y_y - y_x];

      tempArray[0] -= 1;
      tempArray[2] += 1;

      temp1 = new THREE.Vector3(...tempArray);
      ndc = temp1.project(camera);

      // 3. convert NDC to pixel coordinates
      const x_z = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_z = Math.round(((-ndc.y + 1) / 2) * size.height);

      dirVectors.current.z = [x_z - x_x, y_z - y_x];

      if (mouseInt.current[1] === -1.5) {
        minus_face.current = -1;
      } else {
        minus_face.current = 1;
      }
    } else if (Math.abs(mouseInt.current[2]) === 1.5) {
      face.current = "z";
      dirVectors.current.z = [0, 0];

      let tempArray = [...mouseInt.current];

      let temp1 = new THREE.Vector3(...tempArray);
      let ndc = temp1.project(camera);

      const x_x = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_x = Math.round(((-ndc.y + 1) / 2) * size.height);
      tempArray[0] += 1;

      temp1 = new THREE.Vector3(...tempArray);
      ndc = temp1.project(camera);

      // 3. convert NDC to pixel coordinates
      const x_y = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_y = Math.round(((-ndc.y + 1) / 2) * size.height);

      dirVectors.current.x = [x_y - x_x, y_y - y_x];

      tempArray[0] -= 1;
      tempArray[1] += 1;

      temp1 = new THREE.Vector3(...tempArray);
      ndc = temp1.project(camera);

      // 3. convert NDC to pixel coordinates
      const x_z = Math.round(((ndc.x + 1) / 2) * size.width);
      const y_z = Math.round(((-ndc.y + 1) / 2) * size.height);

      dirVectors.current.y = [x_z - x_x, y_z - y_x];

      if (mouseInt.current[2] === -1.5) {
        minus_face.current = -1;
      } else {
        minus_face.current = 1;
      }
    }

    event.stopPropagation();
  };

  undoRedoBtnRef.current.push(handleUndo);
  undoRedoBtnRef.current.push(handleRedo);
  undoRedoBtnRef.current.push(handleDoAll);

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        cubelets.push(
          <Cublet
            key={`${x}${y}${z}`}
            position={[x, y, z]}
            controlsRef={controlsRef}
            pointerRef={pointerRef}
            refCallback={registerCublet}
          />
        );
      }
    }
  }

  return (
    <group
      onPointerDown={handleCubePointerDown}
      // onPointerUp={handleCubePointerUp}
    >
      {cubelets}
    </group>
  );
};

export default Cube;
