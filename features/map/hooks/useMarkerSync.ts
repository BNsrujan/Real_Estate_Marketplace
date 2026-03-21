"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";

import { addPropertyMarkers } from "@/components/map/PropertyMarkers";
import type { Property } from "@/types";

const MARKER_MIN_ZOOM = 5.5;
const MARKER_MAX_ZOOM = 9;
const DISTRICT_ZOOM = 11.5;

interface UseMarkerSyncOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
  /** True once map's style.load has fired — safe to add markers */
  isStyleLoaded: boolean;
}

/**
 * Manages the full marker lifecycle:
 *   - Fetches property data once
 *   - Shows all markers when zoom enters [5.5, 9]
 *   - Clears markers when zoom drops below 5.5
 *   - Filters to a single district when filterByDistrict() is called
 *
 * Returns filterByDistrict so callers (district labels, other markers) can trigger it.
 */
export function useMarkerSync({ mapRef, isStyleLoaded }: UseMarkerSyncOptions) {
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const propertiesRef = useRef<Property[]>([]);

  // Tracks current display mode to prevent redundant re-renders
  const markerModeRef = useRef<"all" | "filtered" | null>(null);
  // True after filtering by district — prevents re-showing "all" on zoom out+in
  const cameFromDistrictRef = useRef(false);
  // Gates rendering during fly animations
  const blockMarkerRenderRef = useRef(false);

  // Ref so the marker click callback always calls the latest filterByDistrict
  const filterByDistrictRef = useRef<(name: string) => void>(() => {});

  // ── Fetch properties once ─────────────────────────────────────────────────
  useEffect(() => {
    fetch("/data/properties.json")
      .then((res) => res.json())
      .then((data: Omit<Property, "id">[]) => {
        propertiesRef.current = data.map((p, i) => ({ id: String(i), ...p }));
      });
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const placeMarkers = useCallback(
    (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
      const zoom = map.getZoom();
      if (zoom < MARKER_MIN_ZOOM || zoom > MARKER_MAX_ZOOM) return;
      if (blockMarkerRenderRef.current) return;

      clearMarkers();

      markersRef.current = addPropertyMarkers(map, data, (prop) => {
        // Marker clicked → filter to that property's district
        filterByDistrictRef.current(prop.district);
      });

      markerModeRef.current = mode;
    },
    [clearMarkers]
  );

  // ── filterByDistrict ──────────────────────────────────────────────────────
  const filterByDistrict = useCallback(
    (districtName: string) => {
      const map = mapRef.current;
      if (!map) return;

      markerModeRef.current = "filtered";
      cameFromDistrictRef.current = true;
      clearMarkers();

      const filtered = propertiesRef.current.filter(
        (p) => p.district?.toLowerCase() === districtName.toLowerCase()
      );

      // Fly to district center (looked up from the GeoJSON source)
      const features = map.querySourceFeatures("district-centers");
      const match = features.find(
        (f) =>
          f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase()
      );

      if (match) {
        map.flyTo({
          center: (match.geometry as GeoJSON.Point).coordinates as [
            number,
            number
          ],
          zoom: DISTRICT_ZOOM,
          speed: 0.8,
        });
      }

      placeMarkers(map, filtered, "filtered");
    },
    [mapRef, clearMarkers, placeMarkers]
  );

  // Keep ref pointing at latest function (avoids stale closures in marker clicks)
  filterByDistrictRef.current = filterByDistrict;

  // ── Zoom listener (set up once style is loaded) ───────────────────────────
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
    return () => { map.off("zoom", onZoom); };
  }, [isStyleLoaded, clearMarkers, placeMarkers]); // re-run if style reloads

  return { filterByDistrict };
}
