"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { PropertyMarkerService } from "@/features/properties/services/property_marker_service";
import { DUMMY_PROPERTIES } from "@/features/properties/data/dummy_properties";
import { useSidebarStore } from "@/store/sidebar_store";
import type { Property } from "@/shared/types";

const PROPERTY_MARKER_MIN_ZOOM = 5.5;
const MARKER_ZOOM_LEVEL = 12; // Zoom level when clicking a marker
const MARKER_ZOOM_DURATION = 1000; // Animation duration in ms

interface UsePropertyMarkersOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isStyleLoaded: boolean;
  onMarkerClick?: (property: Property) => void;
  onMarkerHover?: (property: Property) => void;
  onMarkerLeave?: () => void;
}

/**
 * Hook to manage property markers on the map with zoom and selection
 * Renders premium property markers and handles click interactions
 */
export function usePropertyMarkers({
  mapRef,
  isStyleLoaded,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave,
}: UsePropertyMarkersOptions) {
  const markerServiceRef = useRef<PropertyMarkerService | null>(null);
  const activeMarkerRef = useRef<string | null>(null);
  const selectedPropertyIdRef = useRef<string | null>(null);

  // Get store actions
  const setSelectedPropertyId = useSidebarStore((s) => s.setSelectedPropertyId);
  const setActiveMenu = useSidebarStore((s) => s.setActiveMenu);

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
        markerServiceRef.current?.addMarkers(
          DUMMY_PROPERTIES,
          (prop) => {
            // Handle marker click: zoom, select, and update UI
            handleMarkerClick(prop, map);
          },
          (prop) => {
            // Handle marker hover
            onMarkerHover?.(prop);
          },
          () => {
            // Handle marker leave
            onMarkerLeave?.();
          },
        );
      }
    };

    const handleMarkerClick = (property: Property, map: maplibregl.Map) => {
      // Zoom to property location
      map.flyTo({
        center: [property.lng, property.lat],
        zoom: MARKER_ZOOM_LEVEL,
        duration: MARKER_ZOOM_DURATION,
        curve: 1.42,
      });

      // Update active marker visual state
      if (activeMarkerRef.current) {
        markerServiceRef.current?.updateMarkerActive(activeMarkerRef.current, false);
      }
      activeMarkerRef.current = property.id;
      markerServiceRef.current?.updateMarkerActive(property.id, true);

      // Update store: set selected property and switch to details view
      selectedPropertyIdRef.current = property.id;
      setSelectedPropertyId(property.id);

      // Switch to details panel (optional, can show details in map popup or sidebar)
      // setActiveMenu("saved"); // Or keep current menu if you want a dedicated property details view

      // Call the optional callback
      onMarkerClick?.(property);
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
  }, [mapRef, isStyleLoaded, onMarkerClick, onMarkerHover, onMarkerLeave, setSelectedPropertyId, setActiveMenu]);

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
