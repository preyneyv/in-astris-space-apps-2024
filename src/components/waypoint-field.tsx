import { useFrame } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import "../data";

function raDecToCart(ra: number, dec: number, d: number) {
  const cos_ra = Math.cos(ra);
  const sin_ra = Math.sin(ra);
  const cos_dec = Math.cos(dec);
  const sin_dec = Math.sin(dec);
  return [d * cos_dec * cos_ra, d * cos_dec * sin_ra, d * sin_dec];
}

function makeStars(n: number, d: number) {
  const positions = new Float32Array(n * 3);
  const colors = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const i3 = i * 3;

    const ra = Math.random() * Math.PI * 2;
    const dec = Math.random() * Math.PI * 2;
    const [x, y, z] = raDecToCart(ra, dec, d);
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    colors[i3 + 0] = Math.random();
    colors[i3 + 1] = Math.random();
    colors[i3 + 2] = Math.random();
  }

  return [positions, colors];
}

// View source file in public/star.svg
const STAR_TEX = new THREE.TextureLoader().load(
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAABKJJREFUWIXFl89u2zgQhz/KlCXLUqDUTnvooUD7GLkWBdqn2ocqCrSnXvoYPRQ9tYljp/pDiqKkPRRkZFnpJruHJTCI7Nieb4Yzwx8FMPCIJYRACOGfAYZh8H/d80OXfKjTIAgIgsADCCGIogiApmm882EY6Puevu8fBPOPAIvFgsVi4QHGEEmSAMw67/ueruvouu7fAQRB4J1PIRxAlmUAtG17AtB1nf9813X0ff9wgCAIkFIipZwFcBAuA2VZnkQ//ay1dhbiBCAIAsIw9M7nIFwG1us1AGEYHmVgHP24Ztq2PYGQU+cu8rHNZUFK6TOwWq18hHPRj7tlmokjgHHE90G4H46iyAPEcUzTNCcAzrFz7myxWCCEoO/7O4BxlHNZmEKMAaIoOkn/2LnLbhRF9H2PMQatNdba3wBCiJOKvw9kuVwSxzF5nnNxceGL8HA4oLXGGHPkXErpX7dti1KKvu+x1t5tgUvZnyDCMCRJErIsI0kSzs/P2W63HkBKSV3XFEVBXdf+ewBd16G1pmkamqbxWeq67hjgPhBXcHmec3Z2RpqmPHnyhM1m4wFcipfLJWmaYq1lGAaapqGqKpqmQWt9NFW7rkO6Kp1CjGGWyyVZlnF2dkae52RZxmaz4fz83AO4waSUoqoqbm9vKYoCrTVVVWGtne0OOe5TBzIFiuOYJElI05Qsy8jznBcvXvDu3TsAPn36RBzHfgu6ruPm5oayLFFK4epsOheEECyEEH/NVXsURaxWK1arFRcXF2y3W7bbLU+fPuXVq1e8ffuW5XKJlJKXL1+ilMJaizGGuq6pqso7d0U3npSuY6QQgtVqRZqmPkL3nCQJ6/XaA2w2G/I85/Xr1965i+7y8pLPnz8jpSSKIr9NVVVR1zVlWVKWJUVR+Oe2bQl4xBJCEIbh0XQbDxl3KD1myWEYUErRdR1KKW5vbwnD0Kc/jmOePXvG8+fPaZoGay1fvnzh8vLSnwHGGD5+/Mi3b9+4vr729uPHD7TWKKVQStG2LcYYb8Mw/G7D8Zh0Zq1Fa42U0n+xqiqurq6oqoqiKHjz5g0AHz584OvXrxwOB/b7Pbvdjt1uR13XGGN8S07NZ2AqKNw/XW0sFgu01tzc3KCUYrlcorXm/fv3AHz//p3D4eD3t65rtNZHBTf+7bHJsWNnUkrW6zVxHPs+11oTRRHr9Zo0TRmGgTRNAdjtduz3e8qy5NevXxRFgTHGC5E58wCuTdybcRwTRRFCCD86rbVegBhj/MnnAK6vr9nv90ej2FrrJZmzKQRwB+B6PwgCrLVe5QB+PlRVRdu23oEDuLq6OjqMrLXephBjEA8gpfSzua5r4FicjNvNHafGGA/w8+dPv+fOyT9BjIL7fVxqrdFaezkWhuFRv86d9w62aRqMMSdqeAwxBfFzwJ3LLurxnJ46H6udYRg8gBMXU4AxhHueyvQjSeZm9ljDzaldJzAdgFLqRJSOAcYgfxSlDmKs8+/T+kIIqqoC7u4Fc5eSPzmfBRhn4j6t77bIZcCN1SnstPLn1r03o7mjcwpQFMW9AP/5auaWo5+7aLhaGQM89nIq+J+v538DpYfTUW9840YAAAAASUVORK5CYII=",
);

export default function WaypointField({ n, d }: { n: number; d: number }) {
  const [positions, colors] = useMemo(() => makeStars(n, d), [n, d]);
  const pointsRef = useRef<THREE.Points>(null);
  useFrame(({ raycaster, camera }) => {
    raycaster.params.Points.threshold = 0.2 / camera.zoom;
  });
  return (
    <points
      ref={pointsRef}
      onPointerMove={(e) => {
        if (!e.index) return;

        pointsRef.current!.geometry.attributes.color.array[e.index! * 3] = 0;
        pointsRef.current!.geometry.attributes.color.needsUpdate = true;
      }}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-color"
          count={n}
          itemSize={3}
          array={colors}
        />
        <bufferAttribute
          attach="attributes-position"
          count={n}
          itemSize={3}
          array={positions}
        />
      </bufferGeometry>
      <motion.pointsMaterial
        size={40}
        color={0xffffff}
        transparent
        depthTest={false}
        map={STAR_TEX}
        blending={THREE.AdditiveBlending}
        vertexColors
        sizeAttenuation={false}
      />
    </points>
  );
}
