"use client";
import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import StarField from "../space/StarField";
import LoadingScreen from "../loading/LoadingScreen";
import {
  MAP_CONFIG,
  ROTATION_CONFIG,
  TILE_SOURCES,
  TITLE_FADE_ZOOM,
  type Property,
} from "../../lib/globe/mapConfig";

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildMarkerElement(prop: Property): HTMLElement {
  const el = document.createElement("div");
  el.className = "property-marker";
  el.innerHTML = `
    <div class="pm-icon">${prop.type === "house" ? "🏠" : prop.type === "land" ? "🌱" : "🏗️"}</div>
    <div class="pm-pulse"></div>
  `;
  return el;
}

function buildPopupHTML(prop: Property): string {
  return `
    <div class="pp-content">
      <div class="pp-type">${prop.type.toUpperCase()}</div>
      <div class="pp-title">${prop.title}</div>
      <div class="pp-price">₹${prop.price}</div>
      <div class="pp-size">${prop.size}</div>
    </div>
  `;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GlobeView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const loadStart = Date.now();

    // ── Map initialisation ─────────────────────────────────────────────────
    const map = new maplibregl.Map({
      container: mapContainer.current,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      // Transparent canvas so Three.js stars show through globe edges
      style: {
        version: 8,
        sources: {
          satellite: TILE_SOURCES.satellite,
          roads: TILE_SOURCES.roads,
          labels: TILE_SOURCES.labels,
        },
        layers: [
          // Fully transparent background so space shows through
          {
            id: "background",
            type: "background",
            paint: { "background-color": "rgba(0,0,0,0)" },
          },
          // Satellite imagery — always visible
          {
            id: "satellite",
            type: "raster",
            source: "satellite",
          },
          // Road network overlay (transparent PNG from ArcGIS Reference)
          // Fades in from zoom 8 → 11
          {
            id: "roads",
            type: "raster",
            source: "roads",
            paint: {
              "raster-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                8, 0,
                11, 0.9,
                18, 1.0,
              ],
            },
          },
          // Place labels overlay — fades in from zoom 9 → 12
          {
            id: "labels",
            type: "raster",
            source: "labels",
            paint: {
              "raster-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                9, 0,
                12, 0.95,
              ],
            },
          },
        ],
      },
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    // ── style.load — globe projection + data layers ────────────────────────
    map.on("style.load", () => {
      // Switch to 3-D globe projection
      map.setProjection({ type: "globe" });

      // Atmospheric haze — gives the globe that "from space" look
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map as any).setFog({
          range: [-1, 2],
          color: "rgba(6, 12, 34, 0.85)",
          "horizon-blend": 0.06,
        });
      } catch {
        // setFog is optional; ignore if unsupported
      }

      // ── India political boundary ─────────────────────────────────────────
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
          "line-width": 1.5,
          // Fade in at India zoom, fade out once road labels take over
          "line-opacity": [
            "interpolate", ["linear"], ["zoom"],
            4, 0,
            5, 0.9,
            12, 0.2,
          ],
        },
        minzoom: 4,
      });

      // ── City boundaries ──────────────────────────────────────────────────
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
          "fill-opacity": [
            "interpolate", ["linear"], ["zoom"],
            6, 0,
            7, 0.08,
            12, 0,
          ],
        },
        minzoom: 6,
      });

      map.addLayer({
        id: "cities-line",
        type: "line",
        source: "cities",
        paint: {
          "line-color": "#9ef0c4",
          "line-width": 1.5,
          "line-opacity": [
            "interpolate", ["linear"], ["zoom"],
            6, 0,
            7, 0.7,
            13, 0.1,
          ],
        },
        minzoom: 6,
      });

      // ── Property markers (visible only at city-level zoom) ───────────────
      const MARKER_MIN_ZOOM = 12;

      function updateMarkerVisibility() {
        const visible = map.getZoom() >= MARKER_MIN_ZOOM;
        markersRef.current.forEach((m) => {
          (m.getElement() as HTMLElement).style.display = visible
            ? "flex"
            : "none";
        });
      }

      fetch("/data/properties.json")
        .then((r) => r.json())
        .then((properties: Property[]) => {
          properties.forEach((prop) => {
            const el = buildMarkerElement(prop);
            // Hidden by default — revealed when zoomed in
            el.style.display = "none";

            const popup = new maplibregl.Popup({
              offset: 28,
              className: "property-popup",
            }).setHTML(buildPopupHTML(prop));

            const marker = new maplibregl.Marker({ element: el })
              .setLngLat([prop.lng, prop.lat])
              .setPopup(popup)
              .addTo(map);

            markersRef.current.push(marker);
          });

          // Run once after markers are added so current zoom is respected
          updateMarkerVisibility();
        })
        .catch(() => {
          // Properties are optional; fail silently
        });

      // ── Title fade + marker visibility on zoom ────────────────────────────
      map.on("zoom", () => {
        if (titleRef.current) {
          titleRef.current.style.opacity =
            map.getZoom() >= TITLE_FADE_ZOOM ? "0" : "1";
        }
        updateMarkerVisibility();
      });

      // ── Auto-rotation — pauses at India level ────────────────────────────
      let userInteracting = false;

      const onInteractStart = () => { userInteracting = true; };
      const onInteractEnd = () => {
        setTimeout(() => { userInteracting = false; }, 250);
      };
      const onWheel = () => {
        userInteracting = true;
        setTimeout(() => { userInteracting = false; }, 600);
      };

      map.on("mousedown", onInteractStart);
      map.on("touchstart", onInteractStart);
      map.on("wheel", onWheel);
      map.on("mouseup", onInteractEnd);
      map.on("touchend", onInteractEnd);

      let rafId: number;
      function rotateGlobe() {
        if (!userInteracting && map.getZoom() < ROTATION_CONFIG.pauseAtZoom) {
          const center = map.getCenter();
          center.lng -= ROTATION_CONFIG.speed;
          map.setCenter(center);
        }
        rafId = requestAnimationFrame(rotateGlobe);
      }
      rotateGlobe();

      // Expose cancellation via closure
      (map as maplibregl.Map & { _rotationRafId?: number })._rotationRafId =
        rafId!;
    });

    // ── Mark loaded once tiles are rendered ────────────────────────────────
    map.on("load", () => {
      // Small extra delay so the globe has painted before we fade the loader
      const elapsed = Date.now() - loadStart;
      const delay = Math.max(0, 200 - elapsed);
      setTimeout(() => setIsLoaded(true), delay);
    });

    // ── Cleanup ────────────────────────────────────────────────────────────
    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* ── Layer 0: Three.js 3-D star field ─────────────────────────────── */}
      <StarField />

      {/* ── Layer 1: MapLibre globe (transparent canvas edges = stars show) */}
      <div
        ref={mapContainer}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
        }}
      />

      {/* ── Layer 2: Title ───────────────────────────────────────────────── */}
      <div
        ref={titleRef}
        style={{
          position: "absolute",
          top: "16px",
          width: "100%",
          textAlign: "center",
          fontSize: "clamp(30px, 5.5vw, 68px)",
          fontWeight: "700",
          letterSpacing: "10px",
          color: "#f2fbff",
          zIndex: 0,
          fontFamily: "Orbitron, sans-serif",
          textShadow:
            "",
          pointerEvents: "none",
          transition: "opacity 0.6s ease",
        }}
      >
        NAMMA DHARANI
      </div>

      {/* ── Layer 3: Loading overlay ──────────────────────────────────────── */}
      <LoadingScreen isLoaded={isLoaded} />

      {/* ── Inline styles for markers, popups and map controls ───────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');

        /* ── Property marker ── */
        .property-marker {
          position: relative;
          cursor: pointer;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pm-icon {
          font-size: 22px;
          filter: drop-shadow(0 0 5px rgba(108,207,255,0.9));
          transition: transform 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .property-marker:hover .pm-icon {
          transform: scale(1.25);
        }
        .pm-pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(108, 207, 255, 0.15);
          animation: pmPulse 2.2s ease-out infinite;
        }
        @keyframes pmPulse {
          0%   { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ── Property popup ── */
        .property-popup .maplibregl-popup-content {
          background: rgba(6, 12, 34, 0.96);
          border: 1px solid rgba(108, 207, 255, 0.25);
          border-radius: 10px;
          padding: 0;
          box-shadow: 0 4px 24px rgba(58, 167, 255, 0.18);
        }
        .property-popup .maplibregl-popup-tip {
          border-top-color: rgba(6, 12, 34, 0.96) !important;
        }
        .pp-content {
          padding: 14px 18px;
          font-family: 'Orbitron', sans-serif;
          min-width: 155px;
        }
        .pp-type {
          font-size: 9px;
          color: #6ccfff;
          letter-spacing: 2.5px;
          margin-bottom: 5px;
          opacity: 0.8;
        }
        .pp-title {
          font-size: 13px;
          color: #f2fbff;
          font-weight: 700;
          margin-bottom: 10px;
          line-height: 1.3;
        }
        .pp-price {
          font-size: 15px;
          color: #9ef0c4;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .pp-size {
          font-size: 10px;
          color: rgba(242, 251, 255, 0.45);
          letter-spacing: 1px;
        }

        /* ── Navigation controls ── */
        .maplibregl-ctrl-group {
          background: rgba(6, 12, 34, 0.82) !important;
          border: 1px solid rgba(108, 207, 255, 0.18) !important;
          border-radius: 8px !important;
        }
        .maplibregl-ctrl-group button {
          color: #6ccfff !important;
        }
        .maplibregl-ctrl-group button:hover {
          background: rgba(108, 207, 255, 0.1) !important;
        }
        .maplibregl-ctrl-attrib {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
