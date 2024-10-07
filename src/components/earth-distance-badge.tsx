import { InfoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { WaypointPlanet } from "../data";

const formatter = new Intl.NumberFormat("en-US");
export function PlanetBadge({ planet }: { planet: WaypointPlanet }) {
  return (
    <div className="fixed bottom-2 right-2 flex flex-col items-end z-10 text-white/50 gap-2">
      <Link to={`/planets/${planet.slug}/info`}>
        <div className="bg-blue-200/20 px-2 py-1 rounded-lg text-lg flex gap-2 items-center hover:scale-110 transition-all hover:bg-gradient-to-tr from-blue-700 to-blue-400 hover:text-white">
          {planet.name} <InfoIcon />
        </div>
      </Link>
      {!!planet.distance && (
        <div className="bg-neutral-800/80 px-2 py-1 rounded-lg">
          {formatter.format(planet.distance)} pc from Earth
        </div>
      )}
    </div>
  );
}
