"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { PropertyMarkerService } from "@/features/properties/services/property_marker_service";
import { DUMMY_PROPERTIES } from "@/features/properties/data/dummy_properties";
import type { Property } from "@/shared/types";

const PROPERTY_MARKER_MIN_ZOOM = 5.5;

interface UsePropertyMarkersOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isStyleLoaded: boolean;
  onMarkerClick?: (property: Property) => void;
}

/**
 * Hook to manage property markers on the map
 * Renders dummy property markers using the PropertyMarkerService
 */
export function usePropertyMarkers({
  mapRef,
  isStyleLoaded,
  onMarkerClick,
}: UsePropertyMarkersOptions) {
  const markerServiceRef = useRef<PropertyMarkerService | null>(null);
  const activeMarkerRef = useRef<string | null>(null);

  // Initialize markers when map is ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    // Create marker service
    markerServiceRef.current = new PropertyMarkerService(map);

    // Add initial markers
    const handleAddMarkers = () => {
      const zoom = map.getZoom();
      if (zoom >= PROPERTY_MARKER_MIN_ZOOM) {
        markerServiceRef.current?.addMarkers(DUMMY_PROPERTIES, (prop) => {
          onMarkerClick?.(prop);
          // Update active marker visual state
          if (activeMarkerRef.current) {
            markerServiceRef.current?.updateMarkerActive(
              activeMarkerRef.current,
              false
            );
          }
          activeMarkerRef.current = prop.id;
          markerServiceRef.current?.updateMarkerActive(prop.id, true);
        });
      }
    };

    // Add markers on zoom change
    const handleZoom = () => {
      const zoom = map.getZoom();
      if (zoom < PROPERTY_MARKER_MIN_ZOOM) {
        markerServiceRef.current?.clearMarkers();
      } else if (markerServiceRef.current?.getMarkers().length === 0) {
        handleAddMarkers();
      }
    };

    // Initial add if zoom allows
    handleAddMarkers();

    // Listen for zoom events
    map.on("zoom", handleZoom);

    return () => {
      map.off("zoom", handleZoom);
      markerServiceRef.current?.dispose();
      markerServiceRef.current = null;
    };
  }, [mapRef, isStyleLoaded, onMarkerClick]);

  return {
    setActiveMarker: (propertyId: string) => {
      if (activeMarkerRef.current) {
        markerServiceRef.current?.updateMarkerActive(activeMarkerRef.current, false);
      }
      activeMarkerRef.current = propertyId;
      markerServiceRef.current?.updateMarkerActive(propertyId, true);
    },
    clearActiveMarker: () => {
      if (activeMarkerRef.current) {
        markerServiceRef.current?.updateMarkerActive(activeMarkerRef.current, false);
        activeMarkerRef.current = null;
      }
    },
  };
}
