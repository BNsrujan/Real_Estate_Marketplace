"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CONFIG, TILE_SOURCES } from "@/lib/globe/mapConfig";
import { addMapLayers } from "../services/mapLayerService";

interface UseMapInstanceOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Called when map tiles are fully loaded (triggers loading screen removal) */
  onLoad: () => void;
  /** Called on every zoom change with the current zoom level */
  onZoom: (zoom: number) => void;
  /** Called when a district label is clicked */
  onDistrictClick: (districtName: string) => void;
}

/**
 * Owns the full MapLibre lifecycle: create → configure → add layers → clean up.
 *
 * Returns:
 *   mapRef        — stable ref to the maplibre Map instance
 *   isStyleLoaded — true once style.load has fired (safe to query features)
 */
export function useMapInstance({
  containerRef,
  onLoad,
  onZoom,
  onDistrictClick,
}: UseMapInstanceOptions) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  // Store callbacks in refs so the useEffect closure never goes stale
  const onLoadRef = useRef(onLoad);
  const onZoomRef = useRef(onZoom);
  const onDistrictClickRef = useRef(onDistrictClick);
  onLoadRef.current = onLoad;
  onZoomRef.current = onZoom;
  onDistrictClickRef.current = onDistrictClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const loadStart = Date.now();

    const map = new maplibregl.Map({
      container: containerRef.current,
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

    mapRef.current = map;
    map.setZoom(2.1);

    map.on("style.load", () => {
      // Globe projection + atmosphere
      map.setProjection({ type: "globe" });
      try {
        (map as any).setFog({
          range: [-1, 2],
          color: "rgba(6, 12, 34, 0.85)",
          "horizon-blend": 0.06,
        });
      } catch {
        // setFog not available in all maplibre versions — safe to ignore
      }

      addMapLayers(map);

      // District label click
      map.on("click", (e) => {
        if (!map.getLayer("cities-fill")) return;
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["cities-fill"],
        });
        if (!features.length) return;
        const name = features[0].properties?.NAME_2;
        if (name) onDistrictClickRef.current(name);
      });

      setIsStyleLoaded(true);
    });

    map.on("load", () => {
      const elapsed = Date.now() - loadStart;
      const delay = Math.max(0, 200 - elapsed);
      setTimeout(() => onLoadRef.current(), delay);
    });

    map.on("zoom", () => {
      onZoomRef.current(map.getZoom());
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return { mapRef, isStyleLoaded };
}
