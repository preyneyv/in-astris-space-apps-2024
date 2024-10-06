import Papa from "papaparse";

// let waypointsData: any;

let status = "ready";

export async function prefetchData() {
  if (status === "loaded") return;
  if (status !== "ready")
    throw new Error("Tried to fetch while status was " + status);
  status = "loading";
  await new Promise<void>((res, rej) =>
    Papa.parse(window.location.origin + "/public/waypoints.csv", {
      download: true,
      worker: true,
      header: true,
      error(e) {
        if (e) rej(e);
      },
      complete(results) {
        console.log(results);
        res();
        // res(results.errors);
      },
    }),
  );
  status = "loaded";
}

// const waypointsData = (async () => {
//   const data =
//   return data;
// })();
