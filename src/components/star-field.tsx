import { motion } from "framer-motion-3d";
import { useMemo } from "react";
function raDecToCart(ra: number, dec: number, d: number) {
  const cos_ra = Math.cos(ra);
  const sin_ra = Math.sin(ra);
  const cos_dec = Math.cos(dec);
  const sin_dec = Math.sin(dec);
  return [d * cos_dec * cos_ra, d * cos_dec * sin_ra, d * sin_dec];
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

export default function StarField({ n, d }: { n: number; d: number }) {
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
        size={0.01}
        color={0xffffff}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 1.5, delay: 1 } }}
        exit={{
          opacity: 0,
          transition: { duration: 1.5, ease: "easeOut" },
        }}
        transparent
      />
    </points>
  );
}
