import { motion } from "framer-motion-3d";
import { useMemo } from "react";
import * as THREE from "three";
import { CartesianCoords, getLocalizedStars } from "../data";

function raDecToCart(ra: number, dec: number, d: number) {
  const cos_ra = Math.cos(ra);
  const sin_ra = Math.sin(ra);
  const cos_dec = Math.cos(dec);
  const sin_dec = Math.sin(dec);
  return [d * cos_dec * cos_ra, d * cos_dec * sin_ra, d * sin_dec] as const;
}

function makeStars(n: number, d: number) {
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

export function RandomStarField({ n, d }: { n: number; d: number }) {
  const starPositions = useMemo(() => makeStars(n, d), [n, d]);
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
      <motion.pointsMaterial
        size={5}
        color={0xffffff}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5, transition: { duration: 1.5, delay: 1 } }}
        exit={{
          opacity: 0,
          transition: { duration: 1.5, ease: "easeOut" },
        }}
        sizeAttenuation={false}
        transparent
      />
    </points>
  );
}

// function cartToSphereCart(
//   x: number,
//   y: number,
//   z: number,
//   d: number,
// ): [number, number, number] {
//   const mag = Math.hypot(x, y, z);
//   const fac = d / mag;
//   return [x * fac, y * fac, z * fac];
// }

export default function StarField({
  reference,
}: {
  reference: CartesianCoords;
}) {
  const raDec = (
    [
      // Crux constellation
      // [
      //   // alpha 1
      //   // "12h 27m 59s",
      //   // "-63d 14m 9s",
      //   186.9958333, -63.2358333,
      // ],
      // [
      //   // alpha 2
      //   // "12h 28m 0s",
      //   // "-63d 14m 10s",
      //   187.0, -63.2361111,
      // ],
      // [
      //   // beta
      //   // "12h 49m 11s",
      //   // "-59d 49m 24s",
      //   192.2958333, -59.8233333,
      // ],
      // [
      //   // gamma
      //   // "12h 32m 33s",
      //   // "-57d 14m 59s",
      //   188.1375, -57.2497222,
      // ],
      // [
      //   //delta
      //   // "12h 16m 28s",
      //   // "-58d 53m 11s",
      //   184.1166667, -58.8863889,
      // ],
      // [270.8839167, -30.0352667],
      // [266.4168333, -29.0078056], // galactic center
      // [277.3708333, -25.4041667], //kaus borealis
      // [276.45, -34.3694444], // kaus australis
      // [284.1958333, -26.2630556], // nunki
      // [275.6416667, -29.8147222], // kaus media
      // [271.85, -30.42], // alnasl
    ] as [number, number][]
  )

    .map(([ra, dec]) => [(ra * Math.PI) / 180, (dec * Math.PI) / 180])
    .map(([ra, dec]) => raDecToCart(ra, dec, 20));
  const localized = useMemo(() => getLocalizedStars(reference), [reference]);
  const { coordinates, colors, count } = useMemo(() => {
    // THIS MUTATES LOCALIZEDWAYPOINTS!!!!
    // DO NOT BE ALARMED!!!!
    const [count, coordinates, colors] = localized;
    // for (let i = 0; i < count; i++) {
    //   const i3 = i * 3;
    //   const [x, y, z] = cartToSphereCart(
    //     coordinates[i3],
    //     coordinates[i3 + 1],
    //     coordinates[i3 + 2],
    //     r,
    //   );
    //   coordinates[i3] = x;
    //   coordinates[i3 + 1] = y;
    //   coordinates[i3 + 2] = z;
    // }
    return { count, coordinates, colors };
  }, [localized]);
  return (
    <>
      {raDec.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.1, 1, 1]} />
          <meshBasicMaterial color={0xffffff} wireframe />
        </mesh>
      ))}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            itemSize={3}
            array={coordinates}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            itemSize={3}
            array={colors}
          />
        </bufferGeometry>
        <motion.pointsMaterial
          size={1}
          transparent
          depthTest={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5, transition: { duration: 1.5, delay: 1 } }}
          exit={{
            opacity: 0,
            transition: { duration: 1.5, ease: "easeOut" },
          }}
          blending={THREE.AdditiveBlending}
          vertexColors
          sizeAttenuation={false}
        />
      </points>
    </>
  );
}
