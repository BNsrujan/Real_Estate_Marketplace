"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

import { MAP_CONFIG, TILE_SOURCES, getResponsiveMapConfig } from "@/lib/globe/map_config";
import { addMapLayers, addMapboxAdminBoundaries } from "../services/map_layer_service";
import { useStore } from "@/shared/store";

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
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const setMap = useStore.getState().setMap;

  // Store callbacks in refs so the useEffect closure never goes stale
  const onLoadRef = useRef(onLoad);
  const onZoomRef = useRef(onZoom);
  const onDistrictClickRef = useRef(onDistrictClick);

  useEffect(() => {
    onLoadRef.current = onLoad;
    onZoomRef.current = onZoom;
    onDistrictClickRef.current = onDistrictClick;
  }, [onLoad, onZoom, onDistrictClick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const loadStart = Date.now();
    const cfg = getResponsiveMapConfig();
    const map = new mapboxgl.Map({
      container: containerRef.current,
      projection: { name: "globe" },
      center: cfg.center,
      zoom: cfg.zoom,
      pitch: 0,
      bearing: 0,
      minZoom: cfg.minZoom,
      maxZoom: cfg.maxZoom,
      style: {
        version: 8,
        projection: { name: "globe" },
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
      } as mapboxgl.StyleSpecification,
    });

    mapRef.current = map;


    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    map.on("style.load", () => {
      map.resize();
      // Add both custom GeoJSON layers and Mapbox native admin boundaries
      addMapLayers(map);
      addMapboxAdminBoundaries(map);
      map.setFog({
    color: 'rgb(186, 210, 235)', 
    'high-color': 'rgb(36, 92, 223)', 
    'horizon-blend': 0.02, 
    'space-color': 'rgb(11, 11, 25)', // Background color
    'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
  });

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
        setMap({ isLoaded: true });
        const elapsed = Date.now() - loadStart;
        const delay = Math.max(0, 200 - elapsed);
        setTimeout(() => onLoadRef.current(), delay);
      });
    });

    map.on("zoom", () => {
      onZoomRef.current(map.getZoom());
      setMap({ currentZoom: map.getZoom() });
    });

    map.on("rotate", () => {
      setMap({ currentBearing: map.getBearing() });
    });

    // Sync viewport bounds after every pan/zoom ends
    map.on("moveend", () => {
      const b = map.getBounds();
      if (b) {
        setMap({
          viewportBounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
        });
      }
    });

    // Store map instance so any feature can access it via the store
    setMap({ instance: map, isLoaded: false });

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      setMap({ instance: null, isLoaded: false });
    };
  }, [setMap]);

  return { mapRef, isStyleLoaded };
}
