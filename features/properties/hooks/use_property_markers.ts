"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { PropertyMarkerService } from "@/features/properties/services/property_marker_service";
import { useStore } from "@/shared/store";
import type { Property } from "@/shared/types";

const PROPERTY_MARKER_MIN_ZOOM = 5.5;
const MARKER_ZOOM_LEVEL = 12;
const MARKER_ZOOM_DURATION = 1000;

interface UsePropertyMarkersOptions {
  mapRef: React.RefObject<mapboxgl.Map | null>;
  isStyleLoaded: boolean;
  onMarkerClick?: (property: Property) => void;
  onMarkerHover?: (property: Property) => void;
  onMarkerLeave?: () => void;
}

export function usePropertyMarkers({
  mapRef,
  isStyleLoaded,
  onMarkerClick,
  onMarkerHover,
  onMarkerLeave,
}: UsePropertyMarkersOptions) {
  const markerServiceRef = useRef<PropertyMarkerService | null>(null);
  const activeMarkerRef = useRef<string | null>(null);

  // Read from global store — updated by usePropertyStore + filter changes
  const filtered = useStore((s) => s.properties.filtered);
  const isLoading = useStore((s) => s.properties.isLoading);
  const setSelectedProperty = useStore((s) => s.setSelectedProperty);
  const isAnimating = useStore((s) => s.map.isAnimating);

  // Initialize marker service
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    markerServiceRef.current = new PropertyMarkerService(map);

    const handleZoom = () => {
      const zoom = map.getZoom();
      if (zoom < PROPERTY_MARKER_MIN_ZOOM) {
        markerServiceRef.current?.clearMarkers();
      } else if (
        markerServiceRef.current?.getMarkers().length === 0 &&
        filtered.length > 0
      ) {
        renderMarkers();
      }
    };

    map.on("zoom", handleZoom);

    return () => {
      map.off("zoom", handleZoom);
      markerServiceRef.current?.dispose();
      markerServiceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef, isStyleLoaded]);

  // Re-render markers whenever filtered properties change
  useEffect(() => {
    if (!isStyleLoaded || isLoading) return;
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, isStyleLoaded, isLoading]);

  function renderMarkers() {
    const map = mapRef.current;
    if (!map || !markerServiceRef.current) return;
    const zoom = map.getZoom();
    if (zoom < PROPERTY_MARKER_MIN_ZOOM) return;

    markerServiceRef.current.addMarkers(
      filtered,
      (prop) => handleMarkerClick(prop, map),
      (prop) => onMarkerHover?.(prop),
      () => onMarkerLeave?.(),
    );
  }

  function handleMarkerClick(property: Property, map: mapboxgl.Map) {
    if (isAnimating) return;

    // On desktop the detail panel slides in from the left (~400px wide).
    // Adding left padding shifts the viewport centre into the visible area
    // so the clicked marker lands to the right of the panel, not behind it.
    // On mobile the panel is a bottom drawer, so no left offset is needed.
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    const panelLeftPx = isDesktop ? 400 : 0;

    map.flyTo({
      center: [Number(property.lng), Number(property.lat)],
      zoom: MARKER_ZOOM_LEVEL,
      duration: MARKER_ZOOM_DURATION,
      curve: 1.42,
      padding: { left: panelLeftPx, top: 0, right: 0, bottom: 0 },
    });

    if (activeMarkerRef.current) {
      markerServiceRef.current?.updateMarkerActive(activeMarkerRef.current, false);
    }
    activeMarkerRef.current = property.id;
    markerServiceRef.current?.updateMarkerActive(property.id, true);

    setSelectedProperty(property);
    onMarkerClick?.(property);
  }

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
