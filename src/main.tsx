import { OrbitControls, Stats } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter } from "react-router-dom";
import * as THREE from "three";

import { dom } from "./dom-tunnel";
import "./index.css";
import Planetarium from "./planetarium/planetarium";

function CameraDebugger() {
  const { camera } = useThree();
  const [debugMode, setDebugMode] = useState(false);
  const [orbit, setOrbit] = useState(false);
  useEffect(() => {
    console.log(
      "cmd shift s: debug mode --- cmd shift d: orbit mode (need dbg)",
    );
    function handler(event: KeyboardEvent) {
      if (event.key === "s" && event.metaKey && event.shiftKey) {
        setDebugMode((e) => !e);
        event.preventDefault();
        event.stopPropagation();
      }
      if (event.key === "d" && event.metaKey && event.shiftKey) {
        setOrbit((e) => !e);
        event.preventDefault();
        event.stopPropagation();
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    console.log("Debugger:", debugMode, "Orbit:", orbit);
  }, [debugMode, orbit]);
  useEffect(() => {
    camera.setRotationFromEuler(new THREE.Euler(0, 0, 0));
    if (debugMode) {
      camera.position.set(0, 0, 15);
    } else {
      camera.position.set(0, 0, 0);
    }
  }, [debugMode, camera]);

  return debugMode && orbit && <OrbitControls enableDamping={false} />;
}

const BLACK = new THREE.Color(0);
function Root() {
  return (
    <div id="container">
      <Canvas scene={{ background: BLACK }}>
        <Outlet />
        <Stats />
        <CameraDebugger />
      </Canvas>
      <dom.Out />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,

    children: [
      {
        path: "/planets",
        element: <Planetarium />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
