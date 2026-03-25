/**
 * Loads GeoJSON files from the public/data directory.
 * All functions are async and cache-friendly.
 */

export async function fetchGeoJSON(
  path: string
): Promise<GeoJSON.FeatureCollection> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load GeoJSON from ${path}: ${res.status}`);
  return res.json();
}

export async function fetchIndiaGeoJSON(): Promise<GeoJSON.FeatureCollection> {
  return fetchGeoJSON("/data/india.geojson");
}

export async function fetchKarnatakaGeoJSON(): Promise<GeoJSON.FeatureCollection> {
  return fetchGeoJSON("/data/karnataka.geojson");
}

export async function fetchDistrictCenters(): Promise<GeoJSON.FeatureCollection> {
  return fetchGeoJSON("/data/district-centers.json");
}

export async function fetchCities(): Promise<GeoJSON.FeatureCollection> {
  return fetchGeoJSON("/data/cities.json");
}
