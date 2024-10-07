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

import clsx from "clsx";
import { Link } from "react-router-dom";
import { getPlanetBySlug } from "../data";
import { dom } from "../dom-tunnel";
function InfographicCard({
  label,
  children,
}: {
  label: string;
  children?: ReactNode;
}) {
  return (
    <section className="mb-12 text-2xl">
      <h6 className="detail-label">{label}</h6>
      {children}
    </section>
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

function usePaperRefData(text?: string) {
  return useMemo(() => {
    if (!text) return { href: null, citation: null };
    const el = document.createElement("div");
    el.innerHTML = text;
    const link = el.querySelector("a");
    if (!link) return { href: null, citation: null };
    const href = link.getAttribute("href") ?? null;
    const citation = link.innerText.trim() || null;
    el.remove();
    return { href, citation };
  }, [text]);
}

function ActionButton({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <button className="bg-slate-700 p-4 rounded-2xl flex gap-4 items-center text-lg uppercase tracking-widest font-semibold leading-3 hover:scale-110 transition-all hover:bg-gradient-to-tr from-blue-700 to-blue-400">
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

export default function PlanetInfographic() {
  const { id } = useParams();
  const isVisible = useIsPresent();
  const planet = useMemo(() => getPlanetBySlug(id!), [id]);

  const paperRef = usePaperRefData(planet?.paperRefLink);
  console.log(paperRef);

  if (!planet) {
    return "lol whoops";
  }
  const isEarth = planet.slug === "earth";

  return (
    <>
      <dom.In>
        <div
          key={`planet-detail-${planet.slug}`}
          className="fixed top-0 left-0 text-white h-screen w-full flex justify-end items-start overflow-y-auto transition-all"
          style={{
            pointerEvents: isVisible ? "all" : "none",
            background: isVisible ? "rgba(0,0,0,0.5)" : "transparent",
          }}
        >
          <div
            className={clsx(
              "transition-all duration-1000",
              !isVisible && "opacity-0",
            )}
          >
            <motion2d.div
              className="w-[60vw] py-16 pr-16"
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 1, delay: isVisible ? 2.5 : 0 }}
              style={{ pointerEvents: isVisible ? "all" : "none" }}
            >
              <InfographicCard label="Planet">
                <h1 className="text-7xl font-bold">{planet.name}</h1>
                <Link to={`/systems/${planet.hostSystem.slug}`}>
                  <h3 className="flex gap-3 text-blue-400 items-center mb-4">
                    <OrbitIcon /> {planet.hostSystem.name}
                  </h3>
                </Link>
                <Link to={`/planets/${id}`}>
                  <ActionButton icon={<TelescopeIcon />}>
                    Enter the Exosky!
                  </ActionButton>
                </Link>
              </InfographicCard>
              <InfographicCard label="Discovery">
                {isEarth ? (
                  "We've known about this one for a while..."
                ) : (
                  <div className="mb-4">
                    This exoplanet was discovered
                    {planet.discoveryYear && <> in {planet.discoveryYear}</>}
                    {planet.discoveryFacility && (
                      <> by {planet.discoveryFacility}</>
                    )}
                    {planet.discoveryMethod && (
                      <> using the {planet.discoveryMethod} method</>
                    )}
                    .
                  </div>
                )}
                {!isEarth && paperRef.href && (
                  <div>
                    <a href={paperRef.href} target="_blank" rel="noreferrer">
                      <ActionButton icon={<NotebookTextIcon />}>
                        Read The Paper
                      </ActionButton>
                    </a>
                    {paperRef.citation && (
                      <div className="text-xl text-slate-600 mt-2">
                        {paperRef.citation}
                      </div>
                    )}
                  </div>
                )}
              </InfographicCard>
              <InfographicCard label="Metrics">
                <div className="flex gap-6 flex-wrap">
                  <div className="flex gap-6">
                    {planet.radiusRelEarth !== undefined && (
                      <InfographicFigure
                        label="Radius"
                        icon={<DraftingCompassIcon />}
                        subtext="× Earth's"
                      >
                        {formatter.format(planet.radiusRelEarth)}
                      </InfographicFigure>
                    )}
                    {planet.massRelEarth !== undefined && (
                      <InfographicFigure
                        label="Mass"
                        icon={<ScaleIcon />}
                        subtext="× Earth's"
                      >
                        {formatter.format(planet.massRelEarth)}
                      </InfographicFigure>
                    )}
                  </div>
                  <div className="flex gap-6">
                    {planet.distance !== undefined && (
                      <InfographicFigure
                        label="Distance"
                        icon={<RouteIcon />}
                        subtext="parsecs"
                      >
                        {formatter.format(planet.distance)}
                      </InfographicFigure>
                    )}
                    {planet.orbitalPeriod !== undefined && (
                      <InfographicFigure
                        label="Orbital Period"
                        icon={<OrbitIcon />}
                        subtext="Earth days"
                      >
                        {formatter.format(planet.orbitalPeriod)}
                      </InfographicFigure>
                    )}
                  </div>
                </div>
              </InfographicCard>
            </motion2d.div>

            <div className="fixed bottom-2 left-2 text-white bg-white/20 px-2 py-1 rounded-lg opacity-30 hover:opacity-70 transition-all">
              *Provisional Planet Model
            </div>
          </div>
        </div>
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
          <StarField reference={planet} />
        </motion.group>
      </motion.group>
      <motion.ambientLight intensity={0.1} />
      <motion.directionalLight position={[0.5, 1, -1]} />
    </>
  );
}
