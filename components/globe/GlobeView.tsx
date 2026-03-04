// "use client";

// import { useEffect, useRef } from "react";
// import maplibregl from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css";

// export default function GlobeView() {
//   const mapContainer = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!mapContainer.current) return;

//     const map = new maplibregl.Map({
//       container: mapContainer.current,
//       style: "https://demotiles.maplibre.org/style.json",
//       center: [78.9629, 22.5937],
//       zoom: 1.3,
//       minZoom: 1,
//       maxZoom: 10,
//     });

//     map.on("load", () => {
//       map.setProjection({ type: "globe" });

//       // ===============================
//       // 🇮🇳 INDIA
//       // ===============================

//       map.addSource("india", {
//         type: "geojson",
//         data: "/data/india.geojson",
//       });

//       map.addLayer({
//         id: "india-line",
//         type: "line",
//         source: "india",
//         paint: {
//           "line-color": "#ffffff",
//           "line-width": 1.5,
//         },
//         minzoom: 3,
//       });

//       // ===============================
//       // 🌿 KARNATAKA
//       // ===============================

//       map.addSource("karnataka", {
//         type: "geojson",
//         data: "/data/karnataka.geojson",
//       });

//       map.addLayer({
//         id: "karnataka-line",
//         type: "line",
//         source: "karnataka",
//         paint: {
//           "line-color": "#22c55e",
//           "line-width": 2,
//         },
//         minzoom: 5,
//       });

//       // ===============================
//       // 🏙 Cities
//       // ===============================

//       map.addSource("cities", {
//         type: "geojson",
//         data: "/data/cities.geojson",
//       });

//       map.addLayer({
//         id: "city-points",
//         type: "circle",
//         source: "cities",
//         paint: {
//           "circle-radius": 6,
//           "circle-color": "#22c55e",
//           "circle-stroke-color": "#ffffff",
//           "circle-stroke-width": 1,
//         },
//         minzoom: 7,
//       });
//     });

//     map.addControl(new maplibregl.NavigationControl(), "top-right");

//     return () => map.remove();
//   }, []);

//   return (
//     <div
//       ref={mapContainer}
//       style={{
//         width: "100%",
//         height: "100vh",
//         backgroundColor: "black",
//       }}
//     />
//   );
// }

"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function GlobeView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      center: [78.9629, 22.5937], // India facing
      zoom: 2.5, // ✅ Full globe visible
      minZoom: 1,
      maxZoom: 10,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: "raster",
            tiles: [
              "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.setProjection({ type: "globe" });

      map.addSource("india", {
        type: "geojson",
        data: "/data/india.geojson",
      });

      map.addLayer({
        id: "india-line",
        type: "line",
        source: "india",
        paint: {
          "line-color": "#ffff00",
          "line-width": 2,
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
        paint: {
          "line-color": "#00ff00",
          "line-width": 2,
        },
        minzoom: 6,
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100vh",
      }}
    />
  );
}
