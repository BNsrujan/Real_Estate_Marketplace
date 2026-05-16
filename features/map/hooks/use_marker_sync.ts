"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";

import { addPropertyMarkers } from "@/features/properties/components/property_markers";
import { useStore } from "@/shared/store";
import type { Property } from "@/shared/types";

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
  const markerModeRef = useRef<"all" | "filtered" | null>(null);
  const blockMarkerRenderRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  const lastDistrictRef = useRef<string | null>(null);

  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // Read filtered properties + active district from global store
  const filtered = useStore((s) => s.properties.filtered);
  const all = useStore((s) => s.properties.all);
  const activeDistrict = useStore((s) => s.filters.activeDistrict);
  const setFilters = useStore((s) => s.setFilters);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const placeMarkers = useCallback(
    (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
      if (map.getZoom() < MARKER_MIN_ZOOM) return;
      clearMarkers();
      markersRef.current = addPropertyMarkers(map, data, (prop) => {
        onMarkerClickRef.current?.(prop);
      });
      markerModeRef.current = mode;
    },
    [clearMarkers],
  );

  // District click → set filter + flyTo + re-place markers
  const filterByDistrict = useCallback(
    (districtName: string) => {
      const map = mapRef.current;
      if (!map) return;

      // BUG-006-B: guard against re-clicking the same district
      if (lastDistrictRef.current === districtName) return;
      lastDistrictRef.current = districtName;

      // Write to global filter store — propertyFilterService handles client-side filtering
      setFilters({ activeDistrict: districtName });

      const features = map.querySourceFeatures("district-centers");
      const match = features.find(
        (f) =>
          f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
      );

      clearMarkers();

      if (match) {
        map.stop(); // cancel any in-progress animation (BUG-002-C)
        map.flyTo({
          center: (match.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: DISTRICT_ZOOM,
          speed: 0.75,
        });
        // Markers re-render via the filtered store subscription in use_property_markers
      } else {
        // Fallback: render filtered markers immediately
        const districtFiltered = all.filter(
          (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
        );
        placeMarkers(map, districtFiltered, "filtered");
      }
    },
    [mapRef, clearMarkers, placeMarkers, setFilters, all],
  );

  // Reset district filter
  const resetDistrictFilter = useCallback(() => {
    const map = mapRef.current;
    lastDistrictRef.current = null;
    setFilters({ activeDistrict: null });
    markerModeRef.current = null;

    if (map) {
      map.stop();
      map.flyTo({ center: [75.7139, 15.3173], zoom: 6, speed: 0.6, curve: 1.8 });
    }
  }, [mapRef, setFilters]);

  // Sync: when activeDistrict in store is cleared externally (e.g. search), reset local ref
  useEffect(() => {
    if (!activeDistrict) {
      lastDistrictRef.current = null;
      markerModeRef.current = null;
    }
  }, [activeDistrict]);

  // Zoom-based marker visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    const onZoom = () => {
      const zoom = map.getZoom();

      if (zoom < MARKER_MIN_ZOOM) {
        blockMarkerRenderRef.current = true;
        clearMarkers();
        markerModeRef.current = null;
        return;
      }

      if (zoom >= MARKER_MIN_ZOOM && zoom <= MARKER_MAX_ZOOM) {
        blockMarkerRenderRef.current = false;
        // use_property_markers handles this now via store subscription
      }
    };

    map.on("zoom", onZoom);
    return () => { map.off("zoom", onZoom); };
  }, [isStyleLoaded, clearMarkers, mapRef]);

  return { filterByDistrict, resetDistrictFilter };
}
