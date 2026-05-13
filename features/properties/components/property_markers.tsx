import maplibregl from "maplibre-gl";
import type { Property } from "@/shared/types";

const SOURCE_ID = "property-markers-source";
const LAYER_ID = "property-markers-layer";

/**
 * Renders property markers using a GeoJSON source and circle layer for perfect sync.
 * This implementation fixes the "drift" issue in globe projection.
 */
export function addPropertyMarkers(
  map: maplibregl.Map,
  properties: Property[],
  onClick?: (property: Property) => void,
): maplibregl.Marker[] {
  if (!map) return [];

  // 1. Ensure Source exists
  let source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
  if (!source) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
  }

  // 2. Update data
  source.setData({
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [p.lng, p.lat],
      },
      properties: { ...p },
    })),
  });

  // 3. Ensure Layer exists
  if (!map.getLayer(LAYER_ID)) {
    map.addLayer({
      id: LAYER_ID,
      type: "circle",
      source: SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5, 5,
          10, 10,
          15, 15
        ],
        "circle-color": [
          "match",
          ["get", "type"],
          "house", "#10B981",
          "apartment", "#3B82F6",
          "agriculture land", "#6FCF97",
          "commercial space", "#F59E0B",
          "commercial plots", "#EC4899",
          "site", "#8B5CF6",
          "#FFFFFF"
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-opacity": 0.85,
      },
    });

    // 4. Handle Click
    map.on("click", LAYER_ID, (e) => {
      if (e.features && e.features[0]) {
        const props = e.features[0].properties as Property;
        onClick?.(props);
      }
    });

    // 5. Handle Cursor
    map.on("mouseenter", LAYER_ID, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", LAYER_ID, () => {
      map.getCanvas().style.cursor = "";
    });
  }

  // Return empty array to maintain compatibility with legacy marker refs
  return [];
}
