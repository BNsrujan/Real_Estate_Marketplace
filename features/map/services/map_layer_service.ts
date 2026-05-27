import mapboxgl from "mapbox-gl";

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
  map.addSource("india", { type: "geojson", data: "/data/india.geojson" });
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
        "interpolate",
        ["linear"],
        ["zoom"],
        6, 0,
        7, 0.08,
        12, 0,
      ],
    },
    minzoom: 6,
  });

  map.addLayer({
    id: "district-labels",
    type: "symbol",
    source: "district-centers",
    layout: {
      "text-field": ["get", "NAME_2"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        12,
        8,
        15,
      ],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#f8fdff",
      "text-halo-color": "#00141c",
      "text-halo-width": 1.5,
      "text-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        5,
        0,
        5.5,
        1,
      ],
    },
    minzoom: 5,
  });
}
