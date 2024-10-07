import { FuseWorker } from "@iosio/fuse-worker";
import lruMemoize from "lru-memoize";
import Papa from "papaparse";
import { Star, StarCollection } from "./protobuf/gaia_star_data";

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

export type WaypointFuzzyResult = {
  name: string;
  slug: string;
  type: "planet" | "system";
};

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

const hostSystems: Record<string, WaypointHostSystem> = {};
const exoplanets: Record<string, WaypointPlanet> = {};
// let fuse: Fuse<WaypointFuzzyResult>;
const fuse = FuseWorker({
  workerURL: window.location.origin + "/fuse-worker.js",
});

function prefetchWaypoints() {
  const solarSystem: WaypointHostSystem = {
    name: "Solar System",
    slug: "solar-system",
    x: 0,
    y: 0,
    z: 0,
    planets: [],
    distance: 0,
    numPlanets: 8,
    numStars: 1,
  };
  const earth: WaypointPlanet = {
    name: "Earth",
    slug: "earth",
    x: 0,
    y: 0,
    z: 0,
    hostSystem: solarSystem,
    massRelEarth: 1,
    radiusRelEarth: 1,
    orbitalPeriod: 365.26,
    distance: 0,
  };
  solarSystem.planets.push(earth);
  hostSystems[solarSystem.slug] = solarSystem;
  exoplanets[earth.slug] = earth;
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
              numStars: tryNumber(row.sy_snum),
              numPlanets: tryNumber(row.sy_pnum),
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

        const searchables = Object.values(exoplanets)
          .map<WaypointFuzzyResult>((planet) => ({
            name: planet.name,
            slug: `/planets/${planet.slug}/info`,
            type: "planet",
          }))
          .concat(
            Object.values(hostSystems).map((system) => ({
              name: system.name,
              slug: `/systems/${system.slug}`,
              type: "system",
            })),
          );

        fuse.set({
          list: searchables,
          options: {
            keys: ["name"],
          },
        });

        res();
      },
    }),
  );
}

class DynamicFloat32Array {
  arr: Float32Array;
  size = 0;
  constructor(private cap: number = 2) {
    this.arr = new Float32Array(cap);
  }

  push(...els: number[]) {
    for (const el of els) {
      if (this.size === this.cap) {
        this.cap *= 2;
        const newArr = new Float32Array(this.cap);
        newArr.set(this.arr);
        this.arr = newArr;
      }
      this.arr[this.size++] = el;
    }
  }
}

const starCoordinates = new DynamicFloat32Array();
const starColorMeta = new DynamicFloat32Array();

function prefetchStars() {
  return new Promise<void>((res, rej) => {
    fetch(window.location.origin + "/883269_stars.protobuf")
      .then((response) => response.arrayBuffer())
      .then((buffer) => {
        // deserialize the protubuf binary data
        const starCollection = StarCollection.fromBinary(
          new Uint8Array(buffer),
        );

        // loop through each start in the collection
        starCollection.stars.forEach((star: Star) => {
          if (star.sourceId) {
            starCoordinates.push(star.x, star.y, star.z);
            starColorMeta.push(star.photGMeanMag);
          }
        });

        // console.log(starColorMeta.size);

        res();
      })
      .catch((error) => {
        rej(error);
      });
  });
}

export async function prefetchData() {
  if (status === "loaded") return true;
  if (status !== "ready") return false;
  status = "loading";
  await prefetchWaypoints();
  await prefetchStars();
  status = "loaded";
  return true;
}

// Waypoint-related data utilities

export function getPlanetBySlug(slug: string): WaypointPlanet | null {
  return exoplanets[slug] ?? null;
}

export function getHostSystemBySlug(slug: string): WaypointHostSystem | null {
  return hostSystems[slug] ?? null;
}

export const getLocalizedWaypoints = lruMemoize(3)((planet: WaypointPlanet) => {
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
});

export function getFuzzySearchResults(search: string) {
  return new Promise<WaypointFuzzyResult[]>((res) => {
    if (!search.trim().length) return res([]);
    fuse.search(search, (result: WaypointFuzzyResult[]) =>
      res(result.slice(0, 3)),
    );
  });
}

// Star-related data utilities

export const getLocalizedStars = lruMemoize(
  3,
  undefined,
  true,
)((reference: CartesianCoords) => {
  const count = starCoordinates.size / 3;
  const coordinates = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const si = i * 3;
    coordinates[si] = starCoordinates.arr[si] - reference.x;
    coordinates[si + 1] = starCoordinates.arr[si + 1] - reference.y;
    coordinates[si + 2] = starCoordinates.arr[si + 2] - reference.z;

    // TODO: move this into starfield
    colors[si] =
      colors[si + 1] =
      colors[si + 2] =
        1 / starColorMeta.arr[i] ** 1.2;
  }
  return [count, coordinates, colors] as const;
});
