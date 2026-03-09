"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function GlobeView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      center: [78.9629, 22.5937],
      zoom: 2.5,
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
            id: "background",
            type: "background",
            paint: {
              "background-color": "rgba(0,0,0,0)",
            },
          },
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("style.load", () => {
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
          "line-color": "#e6f2ff",
          "line-width": 2,
        },
        minzoom: 4,
      });

      map.addSource("cities", {
        type: "geojson",
        data: "/data/cities.json",
      });

      map.addLayer({
        id: "cities-fill",
        type: "fill",
        source: "cities",
        paint: {
          "fill-color": "#9ef0c4",
          "fill-opacity": 0.15,
        },
        minzoom: 6,
      });

      map.addLayer({
        id: "cities-line",
        type: "line",
        source: "cities",
        paint: {
          "line-color": "#9ef0c4",
          "line-width": 2,
        },
        minzoom: 6,
      });

      let userInteracting = false;

      map.on("mousedown", () => (userInteracting = true));
      map.on("touchstart", () => (userInteracting = true));
      map.on("wheel", () => (userInteracting = true));

      map.on("mouseup", () => {
        setTimeout(() => (userInteracting = false), 200);
      });

      map.on("touchend", () => {
        setTimeout(() => (userInteracting = false), 200);
      });

      const rotationSpeed = 0.02;

      function rotateGlobe() {
        if (!userInteracting) {
          const center = map.getCenter();

          center.lng -= rotationSpeed;

          map.setCenter(center);
        }

        requestAnimationFrame(rotateGlobe);
      }

      rotateGlobe();

      let dragging = false;
      let lastX = 0;
      let lastY = 0;
      let starX = 0;
      let starY = 0;

      map.getCanvas().addEventListener("mousedown", (e) => {
        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
      });

      window.addEventListener("mouseup", () => {
        dragging = false;
      });

      map.getCanvas().addEventListener("mousemove", (e) => {
        if (!dragging || !starsRef.current) return;

        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;

        lastX = e.clientX;
        lastY = e.clientY;

        starX += dx * 0.8;
        starY += dy * 0.8;

        starsRef.current.style.backgroundPosition = `${starX}px ${starY}px`;
      });
    });

    return () => map.remove();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      <div
        ref={starsRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: "url('/pics/star.jpg')",
          backgroundSize: "1400px",
          backgroundRepeat: "repeat",

          backgroundPosition: "0px 0px",

          zIndex: 0,
        }}
      />
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      />
    </div>
  );
}
