"use client";

import { useCallback } from "react";
import maplibregl from "maplibre-gl";

interface UseDistrictZoomOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
}

/**
 * Provides navigation helpers:
 *   zoomToKarnataka — flies the camera to the Karnataka overview
 */
export function useDistrictZoom({ mapRef }: UseDistrictZoomOptions) {
  const zoomToKarnataka = useCallback(() => {
    mapRef.current?.flyTo({
      center: [75.7139, 15.3173],
      zoom: 6,
      speed: 0.6,
      curve: 1.8,
      easing: (t: number) => t * (2 - t),
    });
  }, [mapRef]);

  return { zoomToKarnataka };
}
