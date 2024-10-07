import { motion } from "framer-motion-3d";
import { sortBy } from "lodash-es";
import { ReactNode, useMemo } from "react";
import { useParams } from "react-router";

import { Link } from "react-router-dom";
import StarField from "../components/star-field";
import { getHostSystemBySlug, WaypointPlanet } from "../data";
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

function PlanetMiniCard({ planet }: { planet: WaypointPlanet }) {
  return (
    <Link to={`/planets/${planet.slug}/info`}>
      <div className="bg-blue-200/20 p-6 rounded-3xl mt-2 mb-6 hover:bg-gradient-to-tr from-blue-700 to-blue-400 hover:scale-105 transition-all">
        <h3 className="text-4xl font-semibold">{planet.name}</h3>
        <div className="text-lg">
          Discovered in {planet.discoveryYear} by {planet.discoveryFacility}
        </div>
      </div>
    </Link>
  );
}
export default function SystemInfographic() {
  const { id } = useParams();
  const system = useMemo(() => getHostSystemBySlug(id!), [id]);
  if (!system) return "lol xd";

  return (
    <>
      <dom.In>
        <div
          key="system-detail"
          className="fixed top-0 left-0 text-white h-screen w-screen flex justify-center items-start overflow-y-auto"
        >
          <div className="py-16 w-full max-w-3xl">
            <InfographicCard label="Host System">
              <h1 className="text-7xl font-bold">{system.name}</h1>
            </InfographicCard>
            <InfographicCard label="">
              <div>
                This system contains{" "}
                {system.numStars === undefined &&
                system.numPlanets === undefined ? (
                  "an unknown number of stars and exoplanets."
                ) : (
                  <>
                    {system.numStars === undefined
                      ? "an unknown number of"
                      : system.numStars}{" "}
                    star{system.numStars !== 1 && "s"} and{" "}
                    {system.numPlanets === undefined
                      ? "an unknown number of"
                      : system.numPlanets}{" "}
                    exoplanet{system.numPlanets !== 1 && "s"}.
                  </>
                )}
              </div>
            </InfographicCard>
            <InfographicCard label="Planets">
              {sortBy(system.planets, "name").map((planet) => (
                <PlanetMiniCard planet={planet} key={planet.slug} />
              ))}
            </InfographicCard>
          </div>
        </div>
      </dom.In>
      <motion.group
        position={[-15, 0, -50]}
        animate={{ rotateY: Math.PI * 2 }}
        transition={{
          duration: 100,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <StarField reference={system} />
      </motion.group>
    </>
  );
}
