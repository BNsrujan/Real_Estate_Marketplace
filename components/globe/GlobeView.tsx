"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import StarField from "../space/StarField";
import LoadingScreen from "../loading/LoadingScreen";
import StartExploreButton from "../ui/startbtn";
import { addPropertyMarkers } from "../map/PropertyMarkers";
import { enableDistrictClick } from "../map/DistrictInteraction";

import {
  MAP_CONFIG,
  ROTATION_CONFIG,
  TILE_SOURCES,
  TITLE_FADE_ZOOM,
  type Property,
} from "../../lib/globe/mapConfig";

// ── Helpers ─────────────────────────────────────────────

function buildMarkerElement(prop: Property): HTMLElement {
  const el = document.createElement("div");
  el.className = "property-marker";
  el.innerHTML = `
    <div class="pm-icon">${
      prop.type === "house" ? "🏠" : prop.type === "land" ? "🌱" : "🏗️"
    }</div>
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

export default function GlobeView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const markerModeRef = useRef<"all" | "filtered" | null>(null);
  const cameFromDistrictRef = useRef(false);
  const blockMarkerRenderRef = useRef(false);

  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const isDistrictViewRef = useRef(false);

  const propertiesRef = useRef<any[]>([]);

  function renderMarkersSafe(map: maplibregl.Map, data: any[], mode: any) {
    const zoom = map.getZoom();

    if (zoom < 5.5 || zoom > 9) return;
    if (blockMarkerRenderRef.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markersRef.current = addPropertyMarkers(map, data, (prop) => {
      const districtName = prop.district;

      markerModeRef.current = "filtered";
      cameFromDistrictRef.current = true;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const filtered = propertiesRef.current.filter(
        (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
      );

      const features = map.querySourceFeatures("district-centers");

      const match = features.find(
        (f: any) =>
          f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
      );

      if (match) {
        const coords = (match.geometry as any).coordinates;

        map.flyTo({
          center: coords,
          zoom: 11.5,
          speed: 0.8,
        });

        setTimeout(() => {
          setSelectedProperty(prop);
        }, 300);
      }

      renderMarkersSafe(map, filtered, "filtered");
    });

    markerModeRef.current = mode;
  }

  const handleZoomToKarnataka = () => {
    if (!mapContainer.current) return;
    const map = (mapContainer.current as any)._mapInstance;
    if (!map) return;

    cameFromDistrictRef.current = false;

    map.flyTo({
      center: [75.7139, 15.3173],
      zoom: 6,
      speed: 0.6,
      curve: 1.8,
      easing: (t: number) => t * (2 - t),
    });
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const loadStart = Date.now();

    const map = new maplibregl.Map({
      container: mapContainer.current,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
      pitch: 0,
      bearing: 0,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      style: {
        version: 8,
        sources: {
          satellite: TILE_SOURCES.satellite,
          roads: TILE_SOURCES.roads,
          labels: TILE_SOURCES.labels,
        },
        layers: [
          {
            id: "background",
            type: "background",
            paint: { "background-color": "rgba(0,0,0,0)" },
          },
          { id: "satellite", type: "raster", source: "satellite" },
          {
            id: "roads",
            type: "raster",
            source: "roads",
            paint: {
              "raster-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                8,
                0,
                11,
                0.9,
                18,
                1,
              ],
            },
          },
          {
            id: "labels",
            type: "raster",
            source: "labels",
            paint: {
              "raster-opacity": [
                "interpolate",
                ["linear"],
                ["zoom"],
                9,
                0,
                12,
                0.95,
              ],
            },
          },
        ],
      },
    });

    (mapContainer.current as any)._mapInstance = map;

    map.setZoom(1.8);
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("style.load", () => {
      map.setProjection({ type: "globe" });

      try {
        (map as any).setFog({
          range: [-1, 2],
          color: "rgba(6, 12, 34, 0.85)",
          "horizon-blend": 0.06,
        });
      } catch {}

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
        paint: {
          "line-color": "#00ffff",
          "line-width": 3,
        },
        minzoom: 5,
      });

      map.addSource("cities", {
        type: "geojson",
        data: "/data/cities.json",
      });

      map.addSource("district-centers", {
        type: "geojson",
        data: "/data/district-centers.json",
      });

      fetch("/data/properties.json")
        .then((res) => res.json())
        .then((data) => {
          propertiesRef.current = data;
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

      map.addLayer({
        id: "cities-line",
        type: "line",
        source: "cities",
        paint: {
          "line-color": "#c8faff",
          "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            6,
            1.5,
            10,
            3,
            14,
            6,
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
            "interpolate",
            ["linear"],
            ["zoom"],
            5,
            12,
            8,
            18,
            12,
            24,
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
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            2,
            12,
            10,
            14,
            18,
          ],
          "line-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            8,
            0,
            10,
            0.3,
            14,
            0.6,
          ],
          "line-blur": 1.5,
        },
        minzoom: 8,
      });

      enableDistrictClick(map, (districtName: string) => {
        markerModeRef.current = "filtered";
        cameFromDistrictRef.current = true;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const filtered = propertiesRef.current.filter(
          (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
        );

        const features = map.querySourceFeatures("district-centers");

        const match = features.find(
          (f: any) =>
            f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
        );

        if (match) {
          map.flyTo({
            center: (match.geometry as any).coordinates,
            zoom: 11.5,
            speed: 0.8,
          });
        }

        renderMarkersSafe(map, filtered, "filtered");
      });

      map.on("zoom", () => {
        const zoom = map.getZoom();
        const MIN_ZOOM = 5.5;
        const MAX_ZOOM = 9;

        if (zoom < MIN_ZOOM) {
          blockMarkerRenderRef.current = true;

          markersRef.current.forEach((m) => m.remove());
          markersRef.current = [];

          markerModeRef.current = null;
          cameFromDistrictRef.current = false;
        } else if (zoom >= MIN_ZOOM && zoom <= MAX_ZOOM) {
          blockMarkerRenderRef.current = false;

          if (!cameFromDistrictRef.current) {
            if (
              markerModeRef.current !== "all" &&
              propertiesRef.current.length > 0
            ) {
              renderMarkersSafe(map, propertiesRef.current, "all");
            }
          }
        }

        if (titleRef.current) {
          titleRef.current.style.opacity = zoom >= TITLE_FADE_ZOOM ? "0" : "1";
        }

        setShowButton(zoom < 4);
      });
    });

    map.on("load", () => {
      const elapsed = Date.now() - loadStart;
      const delay = Math.max(0, 200 - elapsed);
      setTimeout(() => setIsLoaded(true), delay);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <StarField />
      {showButton && <StartExploreButton onClick={handleZoomToKarnataka} />}
      <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />

      <div
        ref={titleRef}
        style={{
          position: "absolute",
          top: "20px",
          width: "100%",
          textAlign: "center",
          fontSize: "clamp(48px, 8vw, 110px)",
          fontWeight: "700",
          letterSpacing: "14px",
          color: "#e6f7ff",
          zIndex: 0,
          fontFamily: "Orbitron",
          textShadow: "0 0 40px rgba(108,207,255,0.6)",
        }}
      >
        NAMMA DHARANI
      </div>

      <LoadingScreen isLoaded={isLoaded} />

      {/* ✅ POPUP */}
      {selectedProperty && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "40%",
            background: "rgba(10,20,40,0.95)",
            backdropFilter: "blur(10px)",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            padding: "20px",
            zIndex: 999,
            color: "#fff",
            fontFamily: "Orbitron",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{selectedProperty.title}</h3>
            <button onClick={() => setSelectedProperty(null)}>✕</button>
          </div>

          <p>📍 {selectedProperty.district}</p>
          <p>🏠 Type: {selectedProperty.type}</p>
          <p>💰 Price: ₹{selectedProperty.price}</p>
          <p>📐 Size: {selectedProperty.size}</p>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}
