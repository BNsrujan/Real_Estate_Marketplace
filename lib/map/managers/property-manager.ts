// Minimal PropertyManager skeleton
import { GLASS } from "@/shared/styles/glass";

export type Property = {
  id: string | number;
  lat: number;
  lon: number;
  [k: string]: any;
};

const SOURCE_ID = "properties-source";
const LAYER_ID = "properties-layer";
const CLUSTER = true;

function buildGeoJSON(properties: Property[]) {
  return {
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      properties: { ...p, id: p.id },
      geometry: { type: "Point", coordinates: [p.lon, p.lat] },
    })),
  } as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
}

export class PropertyManager {
  private map: any | null = null;
  private data: Property[] = [];
  private cachedGeoJSON: GeoJSON.FeatureCollection<GeoJSON.Geometry> | null = null;

  init(map: any) {
    this.map = map;

    // Ensure source exists and is configured for clustering
    try {
      if (!this.map.getSource(SOURCE_ID)) {
        this.map.addSource(SOURCE_ID, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
          cluster: CLUSTER,
          clusterRadius: 50,
          clusterMaxZoom: 14,
        });
      }

      // Add a simple layer for unclustered points if missing
      if (!this.map.getLayer(LAYER_ID)) {
        this.map.addLayer({
          id: LAYER_ID,
          type: "circle",
          source: SOURCE_ID,
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-radius": 6,
            "circle-color": "#66f",
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(255,255,255,0.12)",
          },
        });
      }
    } catch (e) {
      // map may not be ready
    }
  }

  setProperties(properties: Property[]) {
    // quick shallow check
    if (this.data === properties) return;
    this.data = properties;

    // memoize GeoJSON
    this.cachedGeoJSON = buildGeoJSON(properties);

    if (!this.map) return;

    // Efficient source update (no remove/add)
    try {
      const src = this.map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource | undefined;
      if (src) {
        src.setData(this.cachedGeoJSON);
      } else {
        this.map.addSource(SOURCE_ID, {
          type: "geojson",
          data: this.cachedGeoJSON,
          cluster: CLUSTER,
          clusterRadius: 50,
          clusterMaxZoom: 14,
        });
      }
    } catch (e) {
      // swallow — best-effort update
    }
  }

  getGeoJSON() {
    return this.cachedGeoJSON;
  }

  filter(predicate: (p: Property) => boolean) {
    const filtered = this.data.filter(predicate);
    this.setProperties(filtered);
  }

  dispose() {
    // do not remove source/layer here to avoid surprising the rest of the app
    this.map = null;
    this.data = [];
    this.cachedGeoJSON = null;
  }
}

