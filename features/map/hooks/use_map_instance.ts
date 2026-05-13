"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CONFIG, TILE_SOURCES, getResponsiveMapConfig } from "@/lib/globe/map_config";
import { addMapLayers } from "../services/map_layer_service";
import { useMapStore } from "@/store/map_store";

interface UseMapInstanceOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onLoad: () => void;
  onZoom: (zoom: number) => void;
  onDistrictClick: (districtName: string) => void;
}


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

  const { activeLayer } = useMapStore();

  useEffect(() => {
    if (!mapRef.current || !isStyleLoaded) return;

    // Toggle layer visibility based on activeLayer
    const map = mapRef.current;

    // Keep satellite as background
    // Toggle roads, traffic, transit, biking based on activeLayer

    const layerVisibilityMap: Record<string, string[]> = {
      "terrain": [],
      "traffic": ["roads"],
      "transit": ["roads"],
      "biking": ["roads"],
    };

    const targetLayers = layerVisibilityMap[activeLayer] || [];

    // In a real application, you'd toggle visibility or add/remove layers
    // Here we will just use the 'roads' layer as an example of toggling
    if (map.getLayer("roads")) {
      if (activeLayer !== "terrain") {
        map.setLayoutProperty("roads", "visibility", "visible");
      } else {
        map.setLayoutProperty("roads", "visibility", "none");
      }
    }
  }, [activeLayer, isStyleLoaded]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const loadStart = Date.now();
console.log("Container size:", containerRef.current?.offsetWidth, containerRef.current?.offsetHeight);
    const cfg = getResponsiveMapConfig();
    const map = new maplibregl.Map({
      container: containerRef.current,
      center: cfg.center,
      zoom: cfg.zoom,
      pitch: 0,
      bearing: 0,
      minZoom: cfg.minZoom,
      maxZoom: cfg.maxZoom,
      style: {
        version: 8,
        projection: { type: "globe" },
        sources: {
          satellite: TILE_SOURCES.satellite,
          roads: TILE_SOURCES.roads,
          labels: TILE_SOURCES.labels,
        },
        layers: [
          {
            id: "background",
            type: "background",
 
            paint: { "background-color": "#000000" },
          },
          { id: "satellite", type: "raster", source: "satellite",paint: { 
          "raster-opacity": 1,
          "raster-brightness-min": 0.1,  
          "raster-saturation": 0.2,       
          }},
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
                18, 1,
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
                9, 0,
                12, 0.95,
              ],
            },
          },
        ],
      } as maplibregl.StyleSpecification,
    });

    mapRef.current = map;


    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    map.on("style.load", () => {
      map.resize();
      addMapLayers(map);

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
    requestAnimationFrame(() => {
        map.resize();
        const elapsed = Date.now() - loadStart;
        const delay = Math.max(0, 200 - elapsed);
        setTimeout(() => onLoadRef.current(), delay);
      });
    });

    map.on("zoom", () => {
      onZoomRef.current(map.getZoom());
    });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return { mapRef, isStyleLoaded };
}
