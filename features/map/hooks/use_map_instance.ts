"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { TILE_SOURCES, getResponsiveMapConfig } from "@/lib/globe/map_config";
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
  // Increments on every style.load — consumers can depend on this to re-init
  // after map.setStyle() wipes all custom layers/sources/images.
  const [styleLoadCount, setStyleLoadCount] = useState(0);
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

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || "";

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
        glyphs: "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
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

    let disposed = false;

    const handleStyleDataLoading = () => {
      if (!disposed) setIsStyleLoaded(false);
    };

    const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
      // If a property marker was clicked its handler called stopPropagation —
      // the originalEvent is cancelled so we bail out here to avoid also
      // triggering the district filter on every single marker click.
      if (e.originalEvent.cancelBubble) return;
      if (!map.getLayer("cities-fill")) return;
      const features = map.queryRenderedFeatures(e.point, {
        layers: ["cities-fill"],
      });
      if (!features.length) return;
      const name = features[0].properties?.NAME_2;
      if (name) onDistrictClickRef.current(name);
    };

    const handleStyleLoad = () => {
      if (disposed) return;
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

      setIsStyleLoaded(true);
      setStyleLoadCount((c) => c + 1);
    };

    const handleLoad = () => {
      if (disposed) return;
      requestAnimationFrame(() => {
        if (disposed) return;
        map.resize();
        setMap({ isLoaded: true });
        const elapsed = Date.now() - loadStart;
        const delay = Math.max(0, 200 - elapsed);
        setTimeout(() => {
          if (!disposed) onLoadRef.current();
        }, delay);
      });
    };

    const handleZoom = () => {
      if (disposed) return;
      onZoomRef.current(map.getZoom());
      setMap({ currentZoom: map.getZoom() });
    };

    const handleRotate = () => {
      if (disposed) return;
      setMap({ currentBearing: map.getBearing() });
    };

    // Sync viewport bounds after every pan/zoom ends
    const handleMoveEnd = () => {
      if (disposed) return;
      const b = map.getBounds();
      if (b) {
        setMap({
          viewportBounds: [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
        });
      }
    };

    map.on("styledataloading", handleStyleDataLoading);
    map.on("style.load", handleStyleLoad);
    map.on("load", handleLoad);
    map.on("click", handleMapClick);
    map.on("zoom", handleZoom);
    map.on("rotate", handleRotate);
    map.on("moveend", handleMoveEnd);

    // Store map instance so any feature can access it via the store
    setMap({ instance: map, isLoaded: false });

    return () => {
      disposed = true;
      ro.disconnect();
      map.off("styledataloading", handleStyleDataLoading);
      map.off("style.load", handleStyleLoad);
      map.off("load", handleLoad);
      map.off("click", handleMapClick);
      map.off("zoom", handleZoom);
      map.off("rotate", handleRotate);
      map.off("moveend", handleMoveEnd);
      map.remove();
      mapRef.current = null;
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = null;
      setIsStyleLoaded(false);
      setMap({ instance: null, isLoaded: false });
    };
  }, [containerRef, setMap]);

  return { mapRef, isStyleLoaded, styleLoadCount };
}
