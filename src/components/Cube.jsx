import { Canvas, useThree } from "@react-three/fiber";
import { Box, Edges, TrackballControls } from "@react-three/drei";
import * as THREE from "three";
import { use, useRef } from "react";

import Cublet from "./Cublet";
import { max } from "three/tsl";
import gsap from "gsap";

const Cube = ({ controlsRef }) => {
  const cubletRefs = useRef({});
  const midAnim = useRef(false);
  const midAnimHelper = useRef({});

  const faceNormal = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };

  const registerCublet = (position, ref, rotationRef) => {
    const key = position.join(",");
    cubletRefs.current[key] = { ref, rotationRef };
  };

  const rotateFaceQuat = (face, faceSign, direction, amount) => {
    Object.values(cubletRefs.current).forEach(({ ref, rotationRef }) => {
      if (!ref.current) return;

      const currentPos = new THREE.Vector3();
      ref.current.getWorldPosition(currentPos);
      const faceRotated = Math.round(currentPos[face]);

      if (faceRotated === faceSign) {
        const new_dir = rotationRef.current[face][1];
        const quat = new THREE.Quaternion();
        const mesh = ref.current;

        // const targetPos = mesh.position
        //   .clone()
        //   .applyAxisAngle(faceNormal[face], (Math.PI / 2) * direction * amount);

        mesh.position.applyAxisAngle(
          faceNormal[face],
          (Math.PI / 2) * direction * amount
        );

        quat.setFromAxisAngle(
          faceNormal[new_dir],
          (Math.PI / 2) * direction * rotationRef.current[face][0] * amount
        );
        // const targetQuat = new THREE.Quaternion();
        // const currentQuat = mesh.quaternion.clone();
        // targetQuat.multiplyQuaternions(currentQuat, quat);
        // targetQuat.normalize();

        mesh.quaternion.multiply(quat);
        mesh.quaternion.normalize(); // Normalize the quaternion to avoid drift

        // gsap.to(mesh.position, {
        //   duration: 5,
        //   x: targetPos.x,
        //   y: targetPos.y,
        //   z: targetPos.z,
        //   ease: "none",
        // });

        // const targetEuler = new THREE.Euler().setFromQuaternion(
        //   targetQuat,
        //   mesh.rotation.order
        // ); // use current order ('XYZ')
        // gsap.to(mesh.rotation, {
        //   duration: 5,
        //   x: targetEuler.x,
        //   y: targetEuler.y,
        //   z: targetEuler.z,
        //   ease: "none",
        // });

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
        const currentPos1 = new THREE.Vector3();
        mesh.getWorldPosition(currentPos1);
      }
    });
  };

  const mousePressRef = useRef(false);
  const pointerRef = useRef(false);
  const mouseInt = useRef(null);
  const face = useRef(null);
  const minus_face = useRef(1);
  const cubelets = [];

  const handleCubePointerDown = (event) => {
    mousePressRef.current = true;
    const worldPoint = event.point.clone();

    mouseInt.current = [
      worldPoint.clone().x,
      worldPoint.clone().y,
      worldPoint.clone().z,
    ].map((coord) => Math.round(coord * 1000) / 1000);
    // console.log("mouseInt:", mouseInt.current);
    if (Math.abs(mouseInt.current[0]) === 1.5) {
      face.current = "x";
      if (mouseInt.current[0] === -1.5){
        minus_face.current = -1;
      }
      // console.log("Face detected: X-axis");
    } else if (Math.abs(mouseInt.current[1]) === 1.5) {
      face.current = "y";
      if (mouseInt.current[1] === -1.5){
        minus_face.current = -1;
      }
      // console.log("Face detected: Y-axis");
    } else if (Math.abs(mouseInt.current[2]) === 1.5) {
      face.current = "z";
      if (mouseInt.current[2] === -1.5){
        minus_face.current = -1;
      }
      // console.log("Face detected: Z-axis");
    }

    event.stopPropagation(); // prevents bubbling into individual cublets if needed
  };

  const handleCubePointerUp = (event) => {
    let rotateface = null;
    if (!mousePressRef.current) return;

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
    let direction = 0;
    if (maxAxis !== face.current && Math.abs(maxValue) > 0.5) {
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
      rotateFaceQuat("x", sign, -direction, 1);
    } else if (rotateface === "y") {
      let sign =
        mouseInt.current[1] > 0.5 ? 1 : mouseInt.current[1] < -0.5 ? -1 : 0;
      rotateFaceQuat("y", sign, direction, 1);
    } else if (rotateface === "z") {
      let sign =
        mouseInt.current[2] > 0.5 ? 1 : mouseInt.current[2] < -0.5 ? -1 : 0;
      rotateFaceQuat("z", sign, direction, 1);
    }
    mouseInt.current = null;
    face.current = null;

    event.stopPropagation(); // prevents bubbling into individual cublets if needed
  };

  const handleCubePointerMove = (event) => {
    if (!mousePressRef.current) return;
    const worldPoint = event.point.clone();
    midAnimHelper.current.midDx =
      (worldPoint.clone().x * 1000) / 1000 - mouseInt.current[0];
    midAnimHelper.current.midDy =
      (worldPoint.clone().y * 1000) / 1000 - mouseInt.current[1];
    midAnimHelper.current.midDz =
      (worldPoint.clone().z * 1000) / 1000 - mouseInt.current[2];
    midAnimHelper.current.midDeltas = {
      x: midAnimHelper.current.midDx,
      y: midAnimHelper.current.midDy,
      z: midAnimHelper.current.midDz,
    };

    midAnimHelper.current.maxAxis = Object.keys(
      midAnimHelper.current.midDeltas
    ).reduce((a, b) =>
      Math.abs(midAnimHelper.current.midDeltas[a]) >
      Math.abs(midAnimHelper.current.midDeltas[b])
        ? a
        : b
    );
    midAnimHelper.current.maxValue =
      midAnimHelper.current.midDeltas[midAnimHelper.current.maxAxis];

    if (!midAnim.current) {
      midAnimHelper.current.direction = 0;
      if (
        midAnimHelper.current.maxAxis !== face.current &&
        Math.abs(midAnimHelper.current.maxValue) > 0.1
      ) {
        midAnim.current = true;
        midAnimHelper.current.direction =
          midAnimHelper.current.maxValue === 0
            ? 0
            : midAnimHelper.current.maxValue > 0
            ? 1
            : -1;
        midAnimHelper.current.rotateface = ["x", "y", "z"].find(
          (axis) =>
            axis !== midAnimHelper.current.maxAxis && axis !== face.current
        );
      } else {
        midAnimHelper.current.rotateface = null;
      }

      if (
        midAnimHelper.current.maxAxis === "z" ||
        (midAnimHelper.current.rotateface === "z" &&
          midAnimHelper.current.maxAxis === "x")
      ) {
        midAnimHelper.current.maxValue = -1 * midAnimHelper.current.maxValue;
        midAnimHelper.current.direction =
          midAnimHelper.current.maxValue === 0
            ? 0
            : midAnimHelper.current.maxValue > 0
            ? 1
            : -1;
      }
    } else {
      if (
        midAnimHelper.current.maxAxis === "z" ||
        (midAnimHelper.current.rotateface === "z" &&
          midAnimHelper.current.maxAxis === "x")
      ) {
        midAnimHelper.current.maxValue = -1 * midAnimHelper.current.maxValue;
        midAnimHelper.current.direction =
          midAnimHelper.current.maxValue === 0
            ? 0
            : midAnimHelper.current.maxValue > 0
            ? 1
            : -1;
      }

      if (midAnimHelper.current.rotateface === "x") {
        let sign =
          mouseInt.current[0] > 0.5 ? 1 : mouseInt.current[0] < -0.5 ? -1 : 0;
        rotateFaceQuat("x", sign, -midAnimHelper.current.direction, 0.01);
      } else if (midAnimHelper.current.rotateface === "y") {
        let sign =
          mouseInt.current[1] > 0.5 ? 1 : mouseInt.current[1] < -0.5 ? -1 : 0;
        rotateFaceQuat("y", sign, midAnimHelper.current.direction, 0.01);
      } else if (midAnimHelper.current.rotateface === "z") {
        let sign =
          mouseInt.current[2] > 0.5 ? 1 : mouseInt.current[2] < -0.5 ? -1 : 0;
        rotateFaceQuat("z", sign, midAnimHelper.current.direction, 0.01);
      }
    }

    event.stopPropagation();
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
      // onPointerMove={handleCubePointerMove}
    >
      {cubelets}
    </group>
  );
};

export default Cube;
