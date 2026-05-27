import mapboxgl from "mapbox-gl";

const PROPERTY_MARKER_LAYER_ID = "properties-symbol-layer";
const PROPERTY_ACTIVE_MARKER_LAYER_ID = "properties-active-symbol-layer";

function getPropertyMarkerBeforeId(map: mapboxgl.Map): string | undefined {
  if (map.getLayer(PROPERTY_MARKER_LAYER_ID)) return PROPERTY_MARKER_LAYER_ID;
  if (map.getLayer(PROPERTY_ACTIVE_MARKER_LAYER_ID))
    return PROPERTY_ACTIVE_MARKER_LAYER_ID;
  return undefined;
}

export function addMapboxAdminBoundaries(map: mapboxgl.Map): void {
  // Add Mapbox Streets v8 source (includes administrative boundaries)
  if (!map.getSource("mapbox-streets")) {
    map.addSource("mapbox-streets", {
      type: "vector",
      url: "mapbox://mapbox.mapbox-streets-v8",
    });
  }

  // Country borders
  if (!map.getLayer("country-borders")) {
    map.addLayer({
      id: "country-borders",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "admin",
      filter: ["==", "admin_level", 0],
      paint: {
        "line-color": "#e6f2ff",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          2,
          0.5,
          4,
          1.5,
          8,
          2,
        ],
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          2,
          0.8,
          4,
          0.9,
          12,
          0.3,
        ],
      },
      minzoom: 2,
    });
  }

  // State/Province borders (admin_level 1)
  if (!map.getLayer("state-borders")) {
    map.addLayer({
      id: "state-borders",
      type: "line",
      source: "mapbox-streets",
      "source-layer": "admin",
      filter: ["==", "admin_level", 1],
      paint: {
        "line-color": "#00ffff",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          0.5,
          5,
          1,
          8,
          1.5,
        ],
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          0.4,
          5,
          0.6,
          12,
          0.2,
        ],
      },
      minzoom: 4,
    });
  }
}

/**
 * Add custom GeoJSON layers for India-specific boundaries
 * (Kept as fallback/supplement to Mapbox native borders)
 */
export function addMapLayers(map: mapboxgl.Map): void {
  if (!map.getSource("india")) {
    map.addSource("india", { type: "geojson", data: "/data/india.geojson" });
  }

  if (!map.getLayer("india-line")) {
    map.addLayer({
      id: "india-line",
      type: "line",
      source: "india",
      paint: {
        "line-color": "#e6f2ff",
        "line-width": 1.5,
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          4,
          0,
          5,
          0.9,
          12,
          0.2,
        ],
      },
      minzoom: 4,
    });
  }

  if (!map.getSource("karnataka")) {
    map.addSource("karnataka", {
      type: "geojson",
      data: "/data/karnataka.geojson",
    });
  }

  if (!map.getLayer("karnataka-line")) {
    map.addLayer({
      id: "karnataka-line",
      type: "line",
      source: "karnataka",
      paint: { "line-color": "#00ffff", "line-width": 3 },
      minzoom: 5,
    });
  }

  if (!map.getSource("cities")) {
    map.addSource("cities", { type: "geojson", data: "/data/cities.json" });
  }

  if (!map.getSource("district-centers")) {
    map.addSource("district-centers", {
      type: "geojson",
      data: "/data/district-centers.json",
    });
  }

  if (!map.getLayer("cities-fill")) {
    map.addLayer({
      id: "cities-fill",
      type: "fill",
      source: "cities",
      paint: {
        "fill-color": "#9ef0c4",
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          6,
          0,
          7,
          0.08,
          12,
          0,
        ],
      },
      minzoom: 6,
    });
  }

  if (!map.getLayer("district-labels")) {
    map.addLayer(
      {
        id: "district-labels",
        type: "symbol",
        source: "district-centers",
        layout: {
          "text-field": ["get", "NAME_2"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            10,
            8,
            12,
            12,
            14,
          ],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-halo-color": "#000000",
          "text-halo-width": 1.5,
        },
        minzoom: 5,
        maxzoom: 13,
      },
      getPropertyMarkerBeforeId(map),
    );
  }
}
