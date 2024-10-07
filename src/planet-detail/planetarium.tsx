import { Line, PresentationControls } from "@react-three/drei";
import {
  animate,
  useIsPresent,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { motion } from "framer-motion-3d";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import * as THREE from "three";

import { useFrame, useThree } from "@react-three/fiber";
import { RulerIcon } from "lucide-react";
import { PlanetBadge } from "../components/earth-distance-badge";
import { MenuToggleButton } from "../components/menu";
import StarField from "../components/star-field";
import WaypointField from "../components/waypoint-field";
import { getPlanetBySlug } from "../data";
import { dom, menu } from "../dom-tunnel";

// const GUIDE_DIST = STAR_PROJ_DIST + 1;

// function useTouchRotation(root: HTMLElement) {
//   const x = useMotionValue(0);
//   const y = useMotionValue(0);
//   const xSmooth = useSpring(useVelocity(x), {
//     duration: 0.1,
//     bounce: 0,
//   });
//   const ySmooth = useSpring(useVelocity(y), {
//     duration: 0.1,
//     bounce: 0,
//   });
//   useEffect(() => {
//     let mouseDown = false;
//     let lastX = 0,
//       lastY = 0;
//     const oldTouchAction = root.style.touchAction;
//     function onMouseDown(event: MouseEvent | TouchEvent) {
//       mouseDown = true;
//       event.preventDefault();
//       event.stopPropagation();
//       x.animation?.stop();
//       y.animation?.stop();
//       if (event instanceof TouchEvent) {
//         lastX = event.touches[0].clientX;
//         lastY = event.touches[0].clientY;
//       }
//     }
//     function onMouseMove(event: MouseEvent | TouchEvent) {
//       if (!mouseDown) return;
//       event.preventDefault();
//       event.stopPropagation();
//       const sf = Math.min(root.offsetWidth, root.offsetHeight) * -0.8;
//       let dx = 0,
//         dy = 0;
//       if (event instanceof TouchEvent) {
//         dx = event.touches[0].clientX - lastX;
//         dy = event.touches[0].clientY - lastY;
//         lastX = event.touches[0].clientX;
//         lastY = event.touches[0].clientY;
//       } else {
//         dx = event.movementX;
//         dy = event.movementY;
//       }
//       const newX = x.get() + dx / sf;
//       const newY = Math.max(
//         -Math.PI / 2,
//         Math.min(Math.PI / 2, y.get() + dy / sf),
//       );

//       x.set(newX);
//       y.set(newY);
//     }
//     function onMouseUp(event: MouseEvent | TouchEvent) {
//       mouseDown = false;
//       event.preventDefault();
//       event.stopPropagation();
//       animate(x, 0, {
//         type: "inertia",
//         restDelta: 0.0001,
//         power: 0.1,
//         velocity: xSmooth.get(),
//       });
//       animate(y, 0, {
//         type: "inertia",
//         restDelta: 0.0001,
//         power: 0.1,
//         velocity: ySmooth.get(),
//       });
//     }
//     root.style.touchAction = "none";
//     root.addEventListener("mousedown", onMouseDown);
//     root.addEventListener("touchstart", onMouseDown);
//     document.addEventListener("mousemove", onMouseMove);
//     document.addEventListener("touchmove", onMouseMove);
//     document.addEventListener("mouseup", onMouseUp);
//     document.addEventListener("touchend", onMouseUp);
//     return () => {
//       root.style.touchAction = oldTouchAction;
//       root.removeEventListener("mousedown", onMouseDown);
//       root.removeEventListener("touchstart", onMouseDown);
//       document.removeEventListener("mousemove", onMouseMove);
//       document.removeEventListener("touchmove", onMouseMove);
//       document.removeEventListener("mouseup", onMouseUp);
//       document.removeEventListener("touchend", onMouseUp);
//     };
//   }, [root, x, y, xSmooth, ySmooth]);
//   return [x, y];
// }

function useCameraScrollZoom() {
  const isPresent = useIsPresent();
  const z = useMotionValue(1);

  useEffect(() => {
    function handleScroll(ev: WheelEvent) {
      ev.preventDefault();

      const isPinch = Math.abs(ev.deltaY) < 50;
      let zo = z.get();
      if (isPinch) {
        const factor = -0.01 * ev.deltaY;
        zo += factor;
        // z.set(z.get())
      } else {
        const strength = 1;
        const factor = ev.deltaY < 0 ? strength : -strength;
        zo += factor;
      }
      z.set(Math.min(10, Math.max(1, zo)));
    }
    document.addEventListener("wheel", handleScroll, { passive: false });
    return () => document.removeEventListener("wheel", handleScroll);
  }, [z]);

  const zSmooth = useSpring(z, { duration: 100, bounce: 0 });
  useFrame(({ camera }) => {
    if (!isPresent) return;
    camera.zoom = zSmooth.get();
    camera.updateProjectionMatrix();
  });
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (!isPresent) {
      animate(camera.zoom, 1, {
        onUpdate(v) {
          camera.zoom = v;
          camera.updateProjectionMatrix();
        },
      });
    }
  }, [isPresent, camera]);
}

export default function Planetarium() {
  const [showGrid, setShowGrid] = useState(true);

  const isPresent = useIsPresent();

  const { id } = useParams();
  const planet = useMemo(() => getPlanetBySlug(id!), [id]);
  useCameraScrollZoom();
  if (!planet) return null;
  return (
    <>
      {isPresent && (
        <>
          <dom.In>
            {/* <div
              key="planetarium-btns"
              className="flex gap-2 [&>button]:bg-white  [&>button]:p-1"
              style={{ position: "fixed", top: 0, right: 0 }}
            >
              <button
                onClick={() => {
                  animate(camera.zoom, camera.zoom === 1 ? 10 : 1, {
                    onUpdate(v) {
                      camera.zoom = v;
                      camera.updateProjectionMatrix();
                    },
                  });
                }}
              >
                zoom
              </button>

              <button
                onClick={() => {
                  navigate("./info");
                }}
              >
                Back to Info
              </button>
            </div> */}

            <PlanetBadge planet={planet} />
          </dom.In>
          <menu.In>
            <MenuToggleButton
              icon={<RulerIcon />}
              label="Planetary Grid"
              isEnabled={showGrid}
              onActivate={() => setShowGrid((g) => !g)}
            />
          </menu.In>
        </>
      )}
      <motion.group
        position={[0, 0, 5]}
        exit={{
          rotateX: -0.5,
          rotateY: 1,
          transition: {
            duration: 1.5,
            ease: "easeIn",
          },
        }}
      >
        <PresentationControls
          global
          speed={-1}
          polar={[-Math.PI / 2, Math.PI / 2]}
          azimuth={[-Infinity, Infinity]}
          cursor={false}
        >
          <StarField reference={planet} />
          <WaypointField planet={planet} />
          {showGrid && <ReferenceGuides />}
        </PresentationControls>
      </motion.group>
    </>
  );
}
function ReferenceGuides() {
  const isPresent = useIsPresent();
  const circlePts = useMemo(() => {
    const circleRadius = 10;
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
  // TODO: add a drawing animation for entry/exit?
  if (!isPresent) return null;

  return (
    <>
      {guideRotations.map(([x, y, z, highlight], i) => (
        <Line
          depthTest={false}
          depthWrite={false}
          points={circlePts}
          rotation={[x, y, z]}
          key={i}
          dashed={!highlight}
          dashScale={20}
          lineWidth={2}
          color={0xffffff}
          transparent
          opacity={highlight ? 0.4 : 0.2}
        />
      ))}
    </>
  );
}
