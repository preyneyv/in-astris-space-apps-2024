import { Line } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { animate, useMotionValue, useSpring, useVelocity } from "framer-motion";
import { motion } from "framer-motion-3d";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

function raDecToCart(ra: number, dec: number, d: number) {
  const cos_ra = Math.cos(ra);
  const sin_ra = Math.sin(ra);
  const cos_dec = Math.cos(dec);
  const sin_dec = Math.sin(dec);
  return [d * cos_dec * cos_ra, d * cos_dec * sin_ra, d * sin_dec];
}

function makeStars(n = 5000, d = 10) {
  const positions = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;

    const ra = Math.random() * Math.PI * 2;
    const dec = Math.random() * Math.PI * 2;
    const [x, y, z] = raDecToCart(ra, dec, d);
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
  }
  return positions;
}
const STAR_PROJ_DIST = 5;
const GUIDE_DIST = STAR_PROJ_DIST + 1;

function useTouchRotation(root: HTMLElement) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSmooth = useSpring(useVelocity(x), {
    duration: 0.1,
    bounce: 0,
  });
  const ySmooth = useSpring(useVelocity(y), {
    duration: 0.1,
    bounce: 0,
  });
  useEffect(() => {
    let mouseDown = false;
    let lastX = 0,
      lastY = 0;
    const oldTouchAction = root.style.touchAction;
    function onMouseDown(event: MouseEvent | TouchEvent) {
      mouseDown = true;
      event.preventDefault();
      event.stopPropagation();
      x.animation?.stop();
      y.animation?.stop();
      if (event instanceof TouchEvent) {
        lastX = event.touches[0].clientX;
        lastY = event.touches[0].clientY;
      }
    }
    function onMouseMove(event: MouseEvent | TouchEvent) {
      if (!mouseDown) return;
      event.preventDefault();
      event.stopPropagation();
      const sf = Math.min(root.offsetWidth, root.offsetHeight) * -0.8;
      let dx = 0,
        dy = 0;
      if (event instanceof TouchEvent) {
        dx = event.touches[0].clientX - lastX;
        dy = event.touches[0].clientY - lastY;
        lastX = event.touches[0].clientX;
        lastY = event.touches[0].clientY;
      } else {
        dx = event.movementX;
        dy = event.movementY;
      }
      const newX = x.get() + dx / sf;
      const newY = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, y.get() + dy / sf),
      );

      x.set(newX);
      y.set(newY);
    }
    function onMouseUp(event: MouseEvent | TouchEvent) {
      mouseDown = false;
      event.preventDefault();
      event.stopPropagation();
      animate(x, 0, {
        type: "inertia",
        restDelta: 0.0001,
        power: 0.1,
        velocity: xSmooth.get(),
      });
      animate(y, 0, {
        type: "inertia",
        restDelta: 0.0001,
        power: 0.1,
        velocity: ySmooth.get(),
      });
    }
    root.style.touchAction = "none";
    root.addEventListener("mousedown", onMouseDown);
    root.addEventListener("touchstart", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("touchmove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchend", onMouseUp);
    return () => {
      root.style.touchAction = oldTouchAction;
      root.removeEventListener("mousedown", onMouseDown);
      root.removeEventListener("touchstart", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [root, x, y, xSmooth, ySmooth]);
  return [x, y];
}

export default function Planetarium() {
  const {
    gl: { domElement: root },
  } = useThree();
  const [xRotation, yRotation] = useTouchRotation(root);
  return (
    <>
      <motion.group rotation={[yRotation, xRotation, 0]}>
        <StarCloud n={50_000} />
        <ReferenceGuides />
      </motion.group>
    </>
  );
}

function StarCloud({ n }: { n: number }) {
  const starPositions = useMemo(() => makeStars(n, STAR_PROJ_DIST), [n]);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={n}
          itemSize={3}
          array={starPositions}
        />
      </bufferGeometry>
      <pointsMaterial size={0.01} color={0xffffff} />
    </points>
  );
}

function ReferenceGuides() {
  const circlePts = useMemo(() => {
    const circleRadius = GUIDE_DIST;
    const circleShape = new THREE.Shape().absarc(
      0,
      0,
      circleRadius,
      0,
      Math.PI * 2,
    );

    return circleShape.getPoints(10);
  }, []);

  const guideRotations = useMemo(
    () =>
      (
        [
          [90, 0, 0, true], // horizon
          [0, 90, 0, true], // prime meridian
          [0, 0, 0, false], // 90deg meridian

          [0, 60, 0, false],
          [0, 30, 0, false],
          [0, -30, 0, false],
          [0, -60, 0, false],
        ] as [number, number, number, boolean][]
      ).map(
        ([x, y, z, i]) =>
          [
            (x * Math.PI) / 180,
            (y * Math.PI) / 180,
            (z * Math.PI) / 180,
            i,
          ] as [number, number, number, boolean],
      ),
    [],
  );
  return (
    <>
      {guideRotations.map(([x, y, z, highlight], i) => (
        <Line
          points={circlePts}
          rotation={[x, y, z]}
          key={i}
          dashed={!highlight}
          dashScale={40}
          lineWidth={2}
          color={highlight ? 0x555555 : 0x444444}
        />
      ))}
    </>
  );
}
