import { Grid, OrbitControls, Stats } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, Route, Routes, useLocation } from "react-router";
import { BrowserRouter } from "react-router-dom";
import * as THREE from "three";

import { AnimatePresence } from "framer-motion";
import { dom } from "./dom-tunnel";
import "./index.css";
import PlanetInfographic from "./planet-detail/infographic";
import Planetarium from "./planet-detail/planetarium";

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
      camera.position.set(2, 2, 5);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(0, 0, 5);
    }
    camera.updateProjectionMatrix();
  }, [debugMode, camera]);

  return (
    debugMode && (
      <>
        {orbit && <OrbitControls enableDamping={false} />}
        <Grid fadeStrength={10} cellSize={3} infiniteGrid />
        <mesh>
          <boxGeometry args={[100, 0.01, 0.01]} />
          <meshBasicMaterial color={0xff0000} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.01, 100, 0.01]} />
          <meshBasicMaterial color={0x00ff00} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.01, 0.01, 100]} />
          <meshBasicMaterial color={0x0000ff} />
        </mesh>
      </>
    )
  );
}

const BLACK = new THREE.Color(0);
function Root() {
  const location = useLocation();
  return (
    <div id="container">
      <Canvas scene={{ background: BLACK }}>
        <AnimatePresence>
          <Routes location={location} key={location.pathname}>
            <Route index element={<Navigate to="/planets/Earth/info" />} />
            <Route
              path="/planets/:id"
              element={<Planetarium key="planetarium" />}
            />
            <Route path="/planets/:id/info" element={<PlanetInfographic />} />
          </Routes>
        </AnimatePresence>
        <Stats />
        <CameraDebugger />
      </Canvas>
      <dom.Out />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Root />
    </BrowserRouter>
    {/* <RouterProvider router={router} /> */}
  </StrictMode>,
);
