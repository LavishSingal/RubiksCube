import { Canvas, useThree } from "@react-three/fiber";
import { Box, Edges, TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useState } from "react";

import Cublet from "./Cublet";
import { max } from "three/tsl";

const Cube = ({ controlsRef }) => {
  const cubletRefs = useRef({});
  const faceNormal = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };

  const registerCublet = (position, ref, rotationRef) => {
    const key = position.join(",");
    cubletRefs.current[key] = { ref, rotationRef };
  };

  const rotateFace = (face, faceSign, direction) => {
    Object.values(cubletRefs.current).forEach(({ ref, rotationRef }) => {
      if (!ref.current) return;

      const currentPos = new THREE.Vector3();
      ref.current.getWorldPosition(currentPos);
      const faceRotated = Math.round(currentPos[face]);

      currentPos.x = Math.round(currentPos.x * 1000) / 1000; // Ensure precision
      currentPos.y = Math.round(currentPos.y * 1000) / 1000;
      currentPos.z = Math.round(currentPos.z * 1000) / 1000;

      if (faceRotated === faceSign) {
        console.log(currentPos);

        const mesh = ref.current;

        mesh.position.applyAxisAngle(
          faceNormal[face],
          (Math.PI / 2) * direction
        );
        const new_dir = rotationRef.current[face][1];
        const invert =
          face === "x" || face === "y" ? rotationRef.current[face][0] : 1;
        console.log(face, new_dir);
        console.log(mesh.rotation);
        mesh.rotation[new_dir] +=
          (Math.PI / 2) * direction * rotationRef.current[face][0] * invert;
        console.log(mesh.rotation);
        console.log(rotationRef.current);
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
          rotationRef.current.x[0] = origY;
          rotationRef.current.y[0] = origX;

          // origX = rotationRef.current.x[1];
          // origY = rotationRef.current.y[1];
          // rotationRef.current.x[1] = origY;
          // rotationRef.current.y[1] = origX;
        }
        console.log(rotationRef.current);
        while (Math.abs(mesh.rotation[new_dir]) > Math.PI) {
          mesh.rotation[new_dir] -=
            Math.PI * 2 * Math.sign(mesh.rotation[new_dir]);
        }
        const currentPos1 = new THREE.Vector3();
        mesh.getWorldPosition(currentPos1);
        console.log("New position after rotation:", currentPos1);
      }
    });
  };

  const rotateXPositiveFace = () => {
    Object.values(cubletRefs.current).forEach(({ ref, rotationRef }) => {
      if (!ref.current) return;

      const currentPos = new THREE.Vector3();
      ref.current.getWorldPosition(currentPos);
      const x = Math.round(currentPos.x); // Make sure we're comparing correctly

      if (x === 1) {
        // const center = new THREE.Vector3(0, 0, 0);
        const mesh = ref.current;

        // mesh.position.sub(center);
        mesh.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);
        // mesh.position.add(center);

        mesh.rotation[rotationRef.current["x"][1]] +=
          (Math.PI / 2) * rotationRef.current["x"][0];

        let origY = rotationRef.current.y[0];
        let origZ = rotationRef.current.z[0];
        rotationRef.current.y[0] = -origZ;
        rotationRef.current.z[0] = origY;

        origY = rotationRef.current.y[1];
        origZ = rotationRef.current.z[1];
        rotationRef.current.y[1] = origZ;
        rotationRef.current.z[1] = origY;
      }
    });
  };

  const rotateYPositiveFace = () => {
    Object.values(cubletRefs.current).forEach(({ ref, rotationRef }) => {
      if (!ref.current) return;

      const currentPos = new THREE.Vector3();
      ref.current.getWorldPosition(currentPos);
      const y = Math.round(currentPos.y); // Make sure we're comparing correctly

      if (y === 1) {
        // const center = new THREE.Vector3(0, 1, 0);
        const mesh = ref.current;

        // mesh.position.sub(center);
        mesh.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        // mesh.position.add(center);

        mesh.rotation[rotationRef.current["y"][1]] +=
          (Math.PI / 2) * rotationRef.current["y"][0];
        let origX = rotationRef.current.x[0];
        let origZ = rotationRef.current.z[0];
        rotationRef.current.x[0] = origZ;
        rotationRef.current.z[0] = -origX;

        origX = rotationRef.current.x[1];
        origZ = rotationRef.current.z[1];
        rotationRef.current.x[1] = origZ;
        rotationRef.current.z[1] = origX;
      }
    });
  };

  const mousePressRef = useRef(false);
  const axes = ["x", "y", "z"];
  const pointerRef = useRef(false);
  const mouseInt = useRef(null);
  const face = useRef(null);
  const cubelets = [];

  const { camera, size } = useThree();

  const handleCubePointerDown = (event) => {
    mousePressRef.current = true;
    const worldPoint = event.point.clone();

    // Project to screen space

    // console.log("📦 Clicked on WHOLE cube at world point:", worldPoint);
    mouseInt.current = [
      worldPoint.clone().x,
      worldPoint.clone().y,
      worldPoint.clone().z,
    ].map((coord) => Math.round(coord * 1000) / 1000);
    // console.log("mouseInt:", mouseInt.current);
    if (Math.abs(mouseInt.current[0]) === 1.5) {
      face.current = "x";
      // console.log("Face detected: X-axis");
    } else if (Math.abs(mouseInt.current[1]) === 1.5) {
      face.current = "y";
      // console.log("Face detected: Y-axis");
    } else if (Math.abs(mouseInt.current[2]) === 1.5) {
      face.current = "z";
      // console.log("Face detected: Z-axis");
    }

    event.stopPropagation(); // prevents bubbling into individual cublets if needed
  };

  const handleCubePointerUp = (event) => {
    let rotateface = null;
    mousePressRef.current = false;
    const worldPoint = event.point.clone();

    // console.log("📦 Clicked on WHOLE cube at world point:", worldPoint);
    const dx = (worldPoint.clone().x * 1000) / 1000 - mouseInt.current[0];
    const dy = (worldPoint.clone().y * 1000) / 1000 - mouseInt.current[1];
    const dz = (worldPoint.clone().z * 1000) / 1000 - mouseInt.current[2];

    const deltas = { x: dx, y: dy, z: dz };

    const maxAxis = Object.keys(deltas).reduce((a, b) =>
      Math.abs(deltas[a]) > Math.abs(deltas[b]) ? a : b
    );
    let maxValue = deltas[maxAxis];
    // console.log(maxAxis, maxValue);
    let direction = 0;
    if (maxAxis !== face.current && Math.abs(maxValue) > 0.5) {
      direction = maxValue === 0 ? 0 : maxValue > 0 ? 1 : -1;

      rotateface = ["x", "y", "z"].find(
        (axis) => axis !== maxAxis && axis !== face.current
      );
    } else rotateface = null;
    // console.log(`Rotate face:, ${rotateface}`);
    // console.log([maxAxis, rotateface] == reversePairs[0]);
    if (maxAxis === "z" || (rotateface === "z" && maxAxis === "x")) {
      // console.log("Reversing direction for side face");
      maxValue = -1 * maxValue; // Reverse direction if it's a side face
      direction = maxValue === 0 ? 0 : maxValue > 0 ? 1 : -1;
    }
    if (rotateface === "x") {
      let sign =
        mouseInt.current[0] > 0.5 ? 1 : mouseInt.current[0] < -0.5 ? -1 : 0;
      // console.log("Rotating +X face");
      rotateFace("x", sign, -direction);
      // console.log("x", sign, -direction);
    } else if (rotateface === "y") {
      let sign =
        mouseInt.current[1] > 0.5 ? 1 : mouseInt.current[1] < -0.5 ? -1 : 0;
      // console.log("Rotating +Y face");
      rotateFace("y", sign, direction);
      // console.log("y", sign, direction);
    } else if (rotateface === "z") {
      let sign =
        mouseInt.current[2] > 0.5 ? 1 : mouseInt.current[2] < -0.5 ? -1 : 0;
      // console.log("Rotating +Z face");
      rotateFace("z", sign, direction);
      // console.log("z", sign, direction);
    }

    event.stopPropagation(); // prevents bubbling into individual cublets if needed
  };

  const handleCubePointerMove = (event) => {
    if (!mousePressRef.current) return; // Ignore if not pressed
    const worldPoint = event.point.clone();

    // console.log("📦 Clicked on WHOLE cube at world point:", worldPoint);

    event.stopPropagation(); // prevents bubbling into individual cublets if needed
  };

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
      onPointerUp={handleCubePointerUp}
    >
      {cubelets}
    </group>
  );
};

export default Cube;
