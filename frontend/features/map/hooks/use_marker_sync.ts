"use client";

import { useEffect, useRef, useCallback } from "react";

import { useStore } from "@/shared/store";
import type { Property } from "@/shared/types";

const DISTRICT_ZOOM = 11;

interface UseMarkerSyncOptions {
  mapRef: React.RefObject<mapboxgl.Map | null>;
  isStyleLoaded: boolean;
  onMarkerClick?: (property: Property) => void;
}

export function useMarkerSync({ mapRef }: UseMarkerSyncOptions) {
  const lastDistrictRef = useRef<string | null>(null);

  const activeDistrict = useStore((s) => s.filters.activeDistrict);
  const setFilters = useStore((s) => s.setFilters);

  // District click → set filter + flyTo.
  // Markers are re-rendered by usePropertyMarkers via store subscription.
  const filterByDistrict = useCallback(
    (districtName: string) => {
      const map = mapRef.current;
      if (!map) return;

      if (lastDistrictRef.current === districtName) return;
      lastDistrictRef.current = districtName;

      setFilters({ activeDistrict: districtName });

      const features = map.querySourceFeatures("district-centers");
      const match = features.find(
        (f) =>
          f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
      );

      if (match) {
        map.stop();
        map.flyTo({
          center: (match.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: DISTRICT_ZOOM,
          speed: 0.75,
        });
      }
      // Fallback: no flyTo needed — store filter change triggers marker re-render
    },
    [mapRef, setFilters],
  );

  // Reset district filter
  const resetDistrictFilter = useCallback(() => {
    const map = mapRef.current;
    lastDistrictRef.current = null;
    setFilters({ activeDistrict: null });

    if (map) {
      map.stop();
      map.flyTo({ center: [75.7139, 15.3173], zoom: 6, speed: 0.6, curve: 1.8 });
    }
  }, [mapRef, setFilters]);

  // Sync: when activeDistrict in store is cleared externally (e.g. search), reset local ref
  useEffect(() => {
    if (!activeDistrict) {
      lastDistrictRef.current = null;
    }
  }, [activeDistrict]);

  return { filterByDistrict, resetDistrictFilter };
}
