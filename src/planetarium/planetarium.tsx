import { Line, OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
const starCount = 5000;

function raDecToCart(ra: number, dec: number, d: number) {
  const cos_ra = Math.cos(ra);
  const sin_ra = Math.sin(ra);
  const cos_dec = Math.cos(dec);
  const sin_dec = Math.sin(dec);
  return [d * cos_dec * cos_ra, d * cos_dec * sin_ra, d * sin_dec];
}

function makeStars(n = 5000, d = 10) {
  const positions = new Float32Array(n * 3);
  for (let i = 0; i < starCount; i++) {
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

export default function Planetarium() {
  const starCount = 5000;
  const starPositions = useMemo(
    () => makeStars(starCount, STAR_PROJ_DIST),
    [starCount],
  );
  return (
    <>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            itemSize={3}
            array={starPositions}
          />
        </bufferGeometry>
        <pointsMaterial size={0.04} color={0xffffff} />
      </points>
      <ReferenceGuides />
      {/* <FPOrbitControls /> */}
      <OrbitControls />
    </>
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

function FPOrbitControls() {
  return (
    <OrbitControls
      minDistance={1e-5}
      maxDistance={1e-5}
      rotateSpeed={-0.5}
      dampingFactor={0.04}
      enableZoom={false}
      enablePan={false}
    />
  );
}
