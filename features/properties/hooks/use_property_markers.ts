"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import { PropertyMarkerService } from "@/features/properties/services/property_marker_service";
import { getProperties } from "@/features/properties/api/property_api";
import { useSidebarStore } from "@/features/sidebar/store/sidebar_store";
import type { Property } from "@/shared/types";

const PROPERTY_MARKER_MIN_ZOOM = 5.5;
const MARKER_ZOOM_LEVEL = 12;
const MARKER_ZOOM_DURATION = 1000;

interface UsePropertyMarkersOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
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
  const propertiesRef = useRef<Property[]>([]);

  const setSelectedProperty = useSidebarStore((s) => s.setSelectedProperty);
  const setActiveMenu = useSidebarStore((s) => s.setActiveMenu);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    markerServiceRef.current = new PropertyMarkerService(map);

    const handleMarkerClick = (property: Property, map: maplibregl.Map) => {
      map.flyTo({
        center: [property.lng, property.lat],
        zoom: MARKER_ZOOM_LEVEL,
        duration: MARKER_ZOOM_DURATION,
        curve: 1.42,
      });

      if (activeMarkerRef.current) {
        markerServiceRef.current?.updateMarkerActive(activeMarkerRef.current, false);
      }
      activeMarkerRef.current = property.id;
      markerServiceRef.current?.updateMarkerActive(property.id, true);

      setSelectedProperty(property);
      onMarkerClick?.(property);
    };

    const handleAddMarkers = () => {
      const zoom = map.getZoom();
      if (zoom >= PROPERTY_MARKER_MIN_ZOOM && propertiesRef.current.length > 0) {
        markerServiceRef.current?.addMarkers(
          propertiesRef.current,
          (prop) => { handleMarkerClick(prop, map); },
          (prop) => { onMarkerHover?.(prop); },
          () => { onMarkerLeave?.(); },
        );
      }
    };

    getProperties().then((data) => {
      propertiesRef.current = data;
      handleAddMarkers();
    });

    const handleZoom = () => {
      const zoom = map.getZoom();
      if (zoom < PROPERTY_MARKER_MIN_ZOOM) {
        markerServiceRef.current?.clearMarkers();
      } else if (markerServiceRef.current?.getMarkers().length === 0) {
        handleAddMarkers();
      }
    };

    map.on("zoom", handleZoom);

    return () => {
      map.off("zoom", handleZoom);
      markerServiceRef.current?.dispose();
      markerServiceRef.current = null;
    };
  }, [mapRef, isStyleLoaded, onMarkerClick, onMarkerHover, onMarkerLeave, setSelectedProperty, setActiveMenu]);

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
