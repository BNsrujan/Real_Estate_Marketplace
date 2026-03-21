import maplibregl from "maplibre-gl";

/**
 * Adds all GeoJSON sources and map layers to the map.
 * Called once inside map's "style.load" event.
 *
 * Extracted from GlobeView so MapCanvas stays declarative.
 */
export function addMapLayers(map: maplibregl.Map): void {
  // ── India boundary ──────────────────────────────────────────────────────────
  map.addSource("india", { type: "geojson", data: "/data/india.geojson" });
  map.addLayer({
    id: "india-line",
    type: "line",
    source: "india",
    paint: {
      "line-color": "#e6f2ff",
      "line-width": 1.5,
      "line-opacity": [
        "interpolate", ["linear"], ["zoom"],
        4, 0, 5, 0.9, 12, 0.2,
      ],
    },
    minzoom: 4,
  });

  // ── Karnataka boundary ──────────────────────────────────────────────────────
  map.addSource("karnataka", {
    type: "geojson",
    data: "/data/karnataka.geojson",
  });
  map.addLayer({
    id: "karnataka-line",
    type: "line",
    source: "karnataka",
    paint: { "line-color": "#00ffff", "line-width": 3 },
    minzoom: 5,
  });

  // ── Cities + districts ──────────────────────────────────────────────────────
  map.addSource("cities", { type: "geojson", data: "/data/cities.json" });
  map.addSource("district-centers", {
    type: "geojson",
    data: "/data/district-centers.json",
  });

  map.addLayer({
    id: "cities-fill",
    type: "fill",
    source: "cities",
    paint: {
      "fill-color": "#9ef0c4",
      "fill-opacity": [
        "interpolate", ["linear"], ["zoom"],
        6, 0, 7, 0.08, 12, 0,
      ],
    },
    minzoom: 6,
  });

  map.addLayer({
    id: "cities-line",
    type: "line",
    source: "cities",
    paint: {
      "line-color": "#c8faff",
      "line-width": [
        "interpolate", ["linear"], ["zoom"],
        6, 1.5, 10, 3, 14, 6,
      ],
      "line-opacity": 1,
    },
    minzoom: 6,
  });

  map.addLayer({
    id: "city-labels",
    type: "symbol",
    source: "district-centers",
    layout: {
      "text-field": ["get", "NAME_2"],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
      "text-justify": "center",
      "text-size": [
        "interpolate", ["linear"], ["zoom"],
        5, 12, 8, 18, 12, 24,
      ],
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-color": "#000000",
      "text-halo-width": 2,
      "text-halo-blur": 1,
    },
    minzoom: 4.9,
  });

  map.addLayer({
    id: "cities-glow",
    type: "line",
    source: "cities",
    paint: {
      "line-color": "#00ffff",
      "line-width": [
        "interpolate", ["linear"], ["zoom"],
        8, 2, 12, 10, 14, 18,
      ],
      "line-opacity": [
        "interpolate", ["linear"], ["zoom"],
        8, 0, 10, 0.3, 14, 0.6,
      ],
      "line-blur": 1.5,
    },
    minzoom: 8,
  });
}
