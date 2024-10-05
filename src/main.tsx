import { Stats } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider } from "react-router";
import { createBrowserRouter, Link } from "react-router-dom";
import * as THREE from "three";

import { dom } from "./dom-tunnel";
import "./index.css";
import Planetarium from "./planetarium/planetarium";

const grey = new THREE.Color(0);
function Root() {
  return (
    <div id="container">
      <Canvas
        scene={{
          background: grey,
        }}
      >
        <Outlet />
        <Stats />
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
      {
        path: "wow",
        element: (
          <>
            <ambientLight intensity={0.5} />
            <dom.In>
              <div>hi</div>
              <Link to="/cool">hi</Link>
            </dom.In>
          </>
        ),
      },
      {
        path: "cool",
        element: (
          <>
            <ambientLight intensity={1} />
            <dom.In>
              <div>ez</div>
              <Link to="/wow">hi</Link>
            </dom.In>
          </>
        ),
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
