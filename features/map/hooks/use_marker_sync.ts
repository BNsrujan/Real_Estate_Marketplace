"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";

import { addPropertyMarkers } from "@/features/properties/components/property_markers";
import type { Property } from "@/shared/types";
import rawData from "@/public/data/properties.json";
const MARKER_MIN_ZOOM = 5.5;
const MARKER_MAX_ZOOM = 16;
const DISTRICT_ZOOM = 11;

interface UseMarkerSyncOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isStyleLoaded: boolean;
  onMarkerClick?: (property: Property) => void;
}

export function useMarkerSync({
  mapRef,
  isStyleLoaded,
  onMarkerClick,
}: UseMarkerSyncOptions) {
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const propertiesRef = useRef<Property[]>([]);

  const markerModeRef = useRef<"all" | "filtered" | null>(null);
  const cameFromDistrictRef = useRef(false);
  const blockMarkerRenderRef = useRef(false);

  // Always-fresh refs — avoids stale closures inside marker DOM handlers
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const filterByDistrictRef = useRef<(name: string) => void>(() => {});
  useEffect(() => {
    propertiesRef.current = rawData.map((p, i) => ({
      id: String(i),
      ...p,

      type:
        p.type === "site"
          ? "house"
          : (p.type as "house" | "site"  | "agriculture land" | "commercial space" | "apartment" | "commercial plots"),
    }));
  }, []);


  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const placeMarkers = useCallback(
    (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
      const zoom = map.getZoom();
      if (zoom < MARKER_MIN_ZOOM) return;
      clearMarkers();
      markersRef.current = addPropertyMarkers(map, data, (prop) => {
        onMarkerClickRef.current?.(prop);
      });
      markerModeRef.current = mode;
    },
    [clearMarkers],
  );

  const filterByDistrict = useCallback(
    (districtName: string) => {
      const map = mapRef.current;
      if (!map) return;

      markerModeRef.current = "filtered";
      cameFromDistrictRef.current = true;

      const filtered = propertiesRef.current.filter(
        (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
      );

      
      const features = map.querySourceFeatures("district-centers");
      const match = features.find(
        (f) =>
          f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
      );
      clearMarkers();

      if (match) {
        map.flyTo({
          center: (match.geometry as GeoJSON.Point).coordinates as [
            number,
            number,
          ],
          zoom: DISTRICT_ZOOM,
          speed: 0.75,
        });


        map.once("moveend", () => {
          placeMarkers(map, filtered, "filtered");
        });
      } else {
        blockMarkerRenderRef.current = false;
        placeMarkers(map, filtered, "filtered");
      }
    },
    [mapRef, clearMarkers, placeMarkers],
  );

  filterByDistrictRef.current = filterByDistrict;

  // ── Zoom listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    const onZoom = () => {
      const zoom = map.getZoom();

      if (zoom < MARKER_MIN_ZOOM) {
        blockMarkerRenderRef.current = true;
        clearMarkers();
        markerModeRef.current = null;
        cameFromDistrictRef.current = false;
        return;
      }

      if (zoom >= MARKER_MIN_ZOOM && zoom <= MARKER_MAX_ZOOM) {
        blockMarkerRenderRef.current = false;

        if (
          !cameFromDistrictRef.current &&
          markerModeRef.current !== "all" &&
          propertiesRef.current.length > 0
        ) {
          placeMarkers(map, propertiesRef.current, "all");
        }
      }
    };

    map.on("zoom", onZoom);
    return () => {
      map.off("zoom", onZoom);
    };
  }, [isStyleLoaded, clearMarkers, placeMarkers]);

  return { filterByDistrict };
}
