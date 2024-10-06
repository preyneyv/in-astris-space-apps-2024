import Papa from "papaparse";

let status = "ready";

export type CartesianCoords = { x: number; y: number; z: number };

export type WaypointPlanet = CartesianCoords & {
  slug: string;
  name: string;
  discoveryYear?: number;
  discoveryMethod?: string;
  discoveryFacility?: string;
  paperRefLink?: string;
  distance?: number; // parsecs
  radiusRelEarth?: number; // relative to earth
  massRelEarth?: number; // relative to earth
  massProvenance?: string;
  orbitalPeriod?: number; // days
  orbitalSemiMajorRadius?: number; // au
  orbitalEccentricity?: number; //
  hostSystem: WaypointHostSystem;
};

export type WaypointHostSystem = CartesianCoords & {
  slug: string;
  name: string;
  distance?: number; // parsecs
  numStars?: number;
  numPlanets?: number;
  gaiaMag?: number;
  spectralType?: string;
  planets: WaypointPlanet[];
};

const hostSystems: Record<string, WaypointHostSystem> = {};
const exoplanets: Record<string, WaypointPlanet> = {};

function tryNumber(src?: string): number | undefined {
  const cleaned = src?.trim();
  if (!cleaned || !cleaned.length) return undefined;
  const n = +cleaned;
  if (Number.isNaN(n)) return undefined;
  return n;
}

function tryString(src?: string): string | undefined {
  const cleaned = src?.trim();
  if (!cleaned || !cleaned.length) return undefined;
  return cleaned;
}

function prefetchWaypoints() {
  return new Promise<void>((res, rej) =>
    Papa.parse<{
      id: string;
      pl_name: string;
      pl_name_slug: string;
      hostname: string;
      hostname_slug: string;
      gaia_id: string;
      x: string;
      y: string;
      z: string;
      sy_gaiamag: string;
      st_spectype: string;
      st_teff: string;
      sy_dist: string;
      ra: string;
      dec: string;
      disc_year: string;
      discoverymethod: string;
      disc_facility: string;
      disc_refname: string;
      sy_snum: string;
      sy_pnum: string;
      pl_bmassprov: string;
      pl_bmasse: string;
      pl_orbper: string;
      pl_orbper_reflink: string;
      pl_orbsmax: string;
      pl_orbsmax_reflink: string;
      pl_rade: string;
      pl_rade_reflink: string;
      pl_orbeccen: string;
      pl_orbeccen_reflink: string;
    }>(window.location.origin + "/waypoints.csv", {
      download: true,
      header: true,
      error(e) {
        if (e) rej(e);
      },
      complete(results) {
        const data = results.data;
        for (const row of data) {
          if (!row.id?.length) continue;
          const x = +row.x;
          const y = +row.y;
          const z = +row.z;
          if (!hostSystems[row.hostname_slug]) {
            hostSystems[row.hostname_slug] = {
              slug: row.hostname_slug,
              name: row.hostname,
              x,
              y,
              z,
              distance: tryNumber(row.sy_dist),
              gaiaMag: tryNumber(row.sy_gaiamag),
              spectralType: tryString(row.st_spectype),
              planets: [],
            };
          }

          const planet: WaypointPlanet = {
            slug: row.pl_name_slug,
            name: row.pl_name,
            x,
            y,
            z,
            distance: tryNumber(row.sy_dist),
            discoveryYear: tryNumber(row.disc_year),
            discoveryMethod: tryString(row.discoverymethod),
            discoveryFacility: tryString(row.disc_facility),
            paperRefLink: tryString(row.disc_refname),
            radiusRelEarth: tryNumber(row.pl_rade),
            massRelEarth: tryNumber(row.pl_bmasse),
            massProvenance: tryString(row.pl_bmassprov),
            orbitalPeriod: tryNumber(row.pl_orbper),
            orbitalSemiMajorRadius: tryNumber(row.pl_orbsmax),
            orbitalEccentricity: tryNumber(row.pl_orbeccen),
            hostSystem: hostSystems[row.hostname_slug],
          };

          exoplanets[planet.slug] = planet;
          hostSystems[row.hostname_slug].planets.push(planet);
        }

        res();
      },
    }),
  );
}

export async function prefetchData() {
  if (status !== "ready") return;
  status = "loading";
  await prefetchWaypoints();
  status = "loaded";
  console.log(exoplanets);
}

export function getPlanetBySlug(slug: string): WaypointPlanet | null {
  return exoplanets[slug] ?? null;
}

export function getHostSystemBySlug(slug: string): WaypointHostSystem | null {
  return hostSystems[slug] ?? null;
}

export function getLocalizedWaypoints(planet: WaypointPlanet) {
  const meta = Object.values(hostSystems).filter(
    (k) => k.slug !== planet.hostSystem.slug,
  );

  const count = meta.length;
  const coordinates = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const si = i * 3;
    const host = meta[i];
    coordinates[si] = host.x - planet.x;
    coordinates[si + 1] = host.y - planet.y;
    coordinates[si + 2] = host.z - planet.z;
  }

  return { meta, coordinates };
}
