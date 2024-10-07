import { cubicBezier, motion as motion2d, useIsPresent } from "framer-motion";
import { motion } from "framer-motion-3d";
import { TelescopeIcon } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router-dom";
import StarField from "../components/star-field";
import { dom } from "../dom-tunnel";

const CENTER = { x: 0, y: 0, z: 0 };
const easing = cubicBezier(0, 0.8, 0, 1);

export default function Landing() {
  const id = useId();
  const isPresent = useIsPresent();
  return (
    <>
      <dom.In>
        <div
          key={id}
          className="transition-all duration-1000"
          style={{ opacity: isPresent ? 1 : 0 }}
        >
          <div className="fixed bottom-2 left-3 text-blue-100/80 opacity-30 hover:opacity-70 transition-all duration-500">
            <a rel="noreferrer" href="https://www.cosmos.esa.int/web/gaia/dr3">
              Gaia DR3
            </a>{" "}
            &middot;{" "}
            <a
              rel="noreferrer"
              href="https://exoplanetarchive.ipac.caltech.edu/index.html"
            >
              NASA Exoplanet Archive
            </a>
          </div>
          <div className="fixed top-2 right-3 text-blue-200/80 text-right opacity-70 hover:opacity-100 transition-all duration-500">
            <h3 className="flex items-center gap-2">
              <a
                rel="noreferrer"
                href="https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/where-space/"
              >
                Space Apps Challenge 2024
              </a>
            </h3>
            <h1 className="text-4xl flex gap-4 items-center justify-end">
              In Astris
            </h1>
          </div>
          <div className="fixed bottom-2 right-2 text-white">
            <Link to="/planets/earth/info">
              <motion2d.div
                className="relative bg-blue-200/10 w-12 h-12 flex items-center justify-center rounded-xl text-blue-200/90 hover:bg-gradient-to-tr from-blue-700 to-blue-400 hover:scale-105 hover:text-white transition-all group"
                whileHover="hover"
              >
                <div className="absolute whitespace-nowrap -left-2 -translate-x-full opacity-0 group-hover:opacity-100 group-hover:-left-4 transition-all pointer-events-none">
                  Explore the Cosmos
                </div>
                <TelescopeIcon />
              </motion2d.div>
            </Link>
          </div>
        </div>
      </dom.In>
      <motion.group
        initial="initial"
        animate="enter"
        exit="exit"
        variants={{
          initial: {
            scale: 1,
          },
          enter: {
            scale: 0.0015,
            transition: {
              duration: 10,
              ease: easing,
            },
          },
          exit: {
            scale: 0.1,
            transition: {
              duration: 10,
              ease: "easeIn",
            },
          },
        }}
      >
        <motion.group
          animate={{
            rotateY: Math.PI * 6,
            rotateX: Math.PI * 4,
            rotateZ: Math.PI * 2,
          }}
          transition={{
            duration: 120,
            ease: "linear",
            repeat: Infinity,
          }}
        >
          <StarField reference={CENTER} />
        </motion.group>
      </motion.group>
    </>
  );
}
