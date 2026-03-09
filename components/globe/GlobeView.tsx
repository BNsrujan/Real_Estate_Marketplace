"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
export default function GlobeView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      center: [78.9629, 22.5937],
      zoom: 2,
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
      map.on("zoom", () => {
        const zoom = map.getZoom();

        if (!titleRef.current) return;

        if (zoom >= 3) {
          titleRef.current.style.opacity = "0";
        } else {
          titleRef.current.style.opacity = "1";
        }
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
        const zoom = map.getZoom();
        if (!userInteracting && zoom < 6) {
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
        ref={titleRef}
        style={{
          position: "absolute",
          top: "15px",
          width: "100%",
          textAlign: "center",
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: "700",
          letterSpacing: "10px",
          color: "#f2fbff",
          zIndex: 2,
          fontFamily: "Orbitron, sans-serif",
          textShadow:
            "0 0 6px #a6e1ff, 0 0 18px #6ccfff, 0 0 35px #3aa7ff, 0 0 60px #3aa7ff",
          pointerEvents: "none",
          transition: "opacity 0.6s ease",
        }}
      >
        NAMMA DHARANI
      </div>

      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
          paddingTop: "250px",
        }}
      />
    </div>
  );
}
