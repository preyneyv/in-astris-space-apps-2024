import { motion as motion2d, useIsPresent } from "framer-motion";
import { motion } from "framer-motion-3d";
import {
  DraftingCompassIcon,
  NotebookTextIcon,
  OrbitIcon,
  RouteIcon,
  ScaleIcon,
  TelescopeIcon,
} from "lucide-react";
import { ReactNode, useMemo } from "react";
import { useParams } from "react-router";
import StarField from "../components/star-field";

import { Link } from "react-router-dom";
import { dom } from "../dom-tunnel";

function usePlanetDetail(id: string) {
  return useMemo(
    () => ({
      data: {
        name: id,
        discoveryYear: 2020,
        discoveryMethod: "Radial Velocity",
        discoveryFacility: "Thueringer Landessternwarte Tautenburg",
        link: "https://google.com",
        planetRadiusRelEarth: 21.59, // rel earth
        massRelEarth: 3932, // rel earth, mass or mass sin i
        massProvenance: "mass",
        distanceFromEarth: 12.2341, // pc
        orbitalPeriod: 4.2889731, // days
        orbitalEccentricity: 0, //
        orbitalSemiMajorRadius: 0.0656, // au
        hostSystem: {
          name: "Gliese 12",
          numStars: 1,
          numPlanets: 1,
        },
      },
    }),
    [id],
  );
}

// function useHostSystemDetail(id: string) {
//   return useMemo(
//     () => ({
//       data: {
//         name: id,
//         discoveredIn: 2020,
//         stars: [
//           {
//             name: "asdf",
//             // information needed to derive color
//           },
//         ],
//         planets: [
//           {
//             name: "wow cool",
//             orbitalSemiMajorRadius: 0.0656, // au
//           },
//         ],
//       },
//     }),
//     [id],
//   );
// }

// const infographicsVariants: Variants = {
//   hidden: {
//     transform: `translateX(20px)`,
//     opacity: 0,
//   },
//   visible: {
//     transform: `none`,
//     opacity: 1,
//   },
//   away: {
//     transform: `translateY(-20px)`,
//     opacity: 0,
//     transition: {
//       opacity: { duration: 0.5 },
//       duration: 1.8,
//     },
//   },
// };
function InfographicCard({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  return (
    <motion.section
      className="mb-12 text-2xl"
      // variants={infographicsVariants}
      // transition={{ duration: 1 }}
    >
      <h6 className="detail-label">{label}</h6>
      {children}
    </motion.section>
  );
}

function InfographicFigure({
  label,
  children,
  icon,
  subtext,
}: {
  label: string;
  children: ReactNode;
  icon: ReactNode;
  subtext: string;
}) {
  return (
    <figure className="bg-neutral-900/80 rounded-2xl px-6 py-5">
      <figcaption className="flex items-center gap-3 text-xl">
        {icon} {label}
      </figcaption>
      <div className="text-7xl font-bold mt-2">{children}</div>
      <div className="text-right opacity-50">{subtext}</div>
    </figure>
  );
}

const formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function ActionButton({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button className="bg-blue-200/20 p-4 rounded-2xl flex gap-4 items-center text-lg uppercase tracking-widest font-semibold leading-3 hover:scale-110 transition-all hover:bg-gradient-to-tr from-blue-700 to-blue-400">
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default function PlanetInfographic() {
  const { id } = useParams();
  const { data: planet } = usePlanetDetail(id!);

  const isVisible = useIsPresent();

  return (
    <>
      <dom.In>
        <motion.div
          key="planet-detail"
          className="fixed top-0 left-0 text-white h-screen w-full flex justify-end items-start overflow-y-auto"
          style={{ pointerEvents: isVisible ? "all" : "none" }}
        >
          <motion2d.div
            className="w-[60vw] py-16 pr-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 1, delay: isVisible ? 2.5 : 0 }}
          >
            <InfographicCard label="Name">
              <h1 className="text-7xl font-bold">{planet.name}</h1>
              <h3 className="flex gap-3 text-blue-400 items-center mb-4">
                <OrbitIcon /> {planet.hostSystem.name}
              </h3>
              <Link to={`/planets/${id}`}>
                <ActionButton icon={<TelescopeIcon />}>
                  Enter the Exosky!
                </ActionButton>
              </Link>
            </InfographicCard>
            <InfographicCard label="Discovery">
              <div className="mb-4">
                This exoplanet was discovered in{" "}
                <span>{planet.discoveryYear}</span> by{" "}
                <span>{planet.discoveryFacility}</span> using{" "}
                <span>{planet.discoveryMethod}</span>.
              </div>
              <a href={planet.link} target="_blank" rel="noreferrer">
                <ActionButton icon={<NotebookTextIcon />}>
                  Read The Paper
                </ActionButton>
              </a>
            </InfographicCard>
            <InfographicCard label="Metrics">
              <div className="flex gap-6 flex-wrap">
                <div className="flex gap-6">
                  <InfographicFigure
                    label="Radius"
                    icon={<DraftingCompassIcon />}
                    subtext="× Earth's"
                  >
                    {formatter.format(planet.planetRadiusRelEarth)}
                  </InfographicFigure>
                  <InfographicFigure
                    label="Mass"
                    icon={<ScaleIcon />}
                    subtext="× Earth's"
                  >
                    {formatter.format(planet.massRelEarth)}
                  </InfographicFigure>
                </div>
                <div className="flex gap-6">
                  <InfographicFigure
                    label="Distance"
                    icon={<RouteIcon />}
                    subtext="parsecs"
                  >
                    {formatter.format(planet.distanceFromEarth)}
                  </InfographicFigure>
                  <InfographicFigure
                    label="Orbital Period"
                    icon={<OrbitIcon />}
                    subtext="Earth days"
                  >
                    {formatter.format(planet.orbitalPeriod)}
                  </InfographicFigure>
                </div>
              </div>
            </InfographicCard>
          </motion2d.div>

          <div className="fixed bottom-3 left-3 text-white bg-white/20 px-2 py-1 rounded-lg opacity-30 hover:opacity-70 transition-all">
            *Placeholder Visualization
          </div>
        </motion.div>
      </dom.In>
      <motion.group
        position={[-2.75, -1, 2.5]}
        animate={{ rotateY: Math.PI * 2 }}
        transition={{
          duration: 300,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <motion.group
          variants={{
            initial: {
              rotateY: -2,
              rotateX: 0.5,
            },
            enter: {
              rotateY: 0,
              rotateX: 0,
              transition: {
                duration: 5,
                ease: "easeOut",
              },
            },
            // exit: { rotateY: 1, transition: { duration:  } },
          }}
          initial="initial"
          animate="enter"
          exit="exit"
        >
          <motion.mesh
            variants={{
              initial: { x: -20, z: 10 },
              enter: {
                x: 0,
                z: 1,
                y: 0,
                transition: { duration: 2, delay: 0 },
              },
              exit: { x: 10, y: -10, transition: { duration: 3 } },
            }}
          >
            <sphereGeometry args={[2, 64, 32]} />
            <motion.meshPhongMaterial
              color={0x00aaff}
              alphaTest={0.1}
              transparent
              variants={{
                initial: { opacity: 0 },
                enter: { opacity: 1, transition: { duration: 2 } },
                exit: { opacity: 0, transition: { duration: 2, delay: 1 } },
              }}
            />
          </motion.mesh>
          <StarField n={5000} d={10} />
        </motion.group>
      </motion.group>
      <motion.ambientLight intensity={0.1} />
      <motion.directionalLight position={[0.5, 1, -1]} />
    </>
  );
}
