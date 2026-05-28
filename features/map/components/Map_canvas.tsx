"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";

import StarField from "@/features/space/components/star_field";
import StartExploreButton from "@/shared/components/common/startbtn";
import { useMapInstance } from "../hooks/use_map_instance";
import { useMarkerSync } from "../hooks/use_marker_sync";
import { useDistrictZoom } from "../hooks/use_district_zoom";
import { usePropertyMarkers } from "@/features/properties/hooks/use_property_markers";
import { TITLE_FADE_ZOOM, MAPBOX_STYLES } from "@/lib/globe/map_config";
import type { Property, LayerType } from "@/shared/types";
import NavBar from "@/shared/components/navbar";
import MapLayerSelector from "./layer_selector";
import MapControls from "./map_controller";
import Profile from "@/features/profile/components/Profile";
import { usePropertyStore } from "@/features/properties/hooks/use_property_store";
import PropertyHoverCard from "@/features/properties/components/property_card";
import { useStore } from "@/shared/store";

interface Props {
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapCanvas({ setIsLoaded }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [showButton, setShowButton] = useState(true);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [hoverScreenPos, setHoverScreenPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  const setSelectedProperty = useStore((s) => s.setSelectedProperty);
  const setUI = useStore((s) => s.setUI);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMarkerClick = useCallback(
    (prop: Property) => {
      setSelectedProperty(prop);
      setUI({ isPanelOpen: true, activeSidebarTab: "map" });
    },
    [setSelectedProperty, setUI],
  );

  const handleMarkerHover = useCallback((prop: Property) => {
    if (window.innerWidth < 768) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredProperty(prop);
  }, []);

  const handleMarkerLeave = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredProperty(null);
    }, 150); // Small delay to prevent flickering
  }, []);

  const filterByDistrictRef = useRef<(name: string) => void>(() => {});

  const handleZoomChange = useCallback((zoom: number) => {
    if (titleRef.current) {
      titleRef.current.style.zIndex = zoom >= TITLE_FADE_ZOOM ? "-3" : "3";
      titleRef.current.style.opacity = zoom >= TITLE_FADE_ZOOM ? "0" : "1";
    }

    setShowButton(zoom < 4);
  }, []);

  const { mapRef: mapInstance, isStyleLoaded, styleLoadCount } = useMapInstance({
    containerRef: mapContainerRef,
    onLoad: () => {
      setIsLoaded(true);
    },
    onZoom: handleZoomChange,
    onDistrictClick: (name) => {
      filterByDistrictRef.current(name);
    },
  });

  // Load all properties into global store + maintain filtered list
  usePropertyStore();

  const { filterByDistrict, resetDistrictFilter } = useMarkerSync({
    mapRef: mapInstance,
    isStyleLoaded,
    onMarkerClick: handleMarkerClick,
  });

  usePropertyMarkers({
    mapRef: mapInstance,
    isStyleLoaded,
    styleLoadCount,
    onMarkerClick: handleMarkerClick,
    onMarkerHover: handleMarkerHover,
    onMarkerLeave: handleMarkerLeave,
  });

  useEffect(() => {
    filterByDistrictRef.current = filterByDistrict;
  }, [filterByDistrict]);

  // Compute hover card screen position whenever hoveredProperty changes
  useEffect(() => {
    if (!hoveredProperty || !mapInstance.current) {
      setHoverScreenPos(null);
      return;
    }
    try {
      const map = mapInstance.current;
      const pt = map.project([
        Number(hoveredProperty.lng),
        Number(hoveredProperty.lat),
      ]);
      const rect = map.getContainer().getBoundingClientRect();
      setHoverScreenPos({ x: pt.x + rect.left, y: pt.y + rect.top });
    } catch {
      setHoverScreenPos(null);
    }
    // mapInstance is a stable ref — omitting it is intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredProperty]);

  // Expose district reset to Navbar (store-driven via resetFilters) and map controls
  const resetDistrictFilterRef = useRef(resetDistrictFilter);
  useEffect(() => {
    resetDistrictFilterRef.current = resetDistrictFilter;
  }, [resetDistrictFilter]);

  const { zoomToKarnataka } = useDistrictZoom({
    mapRef: mapInstance,
  });

  const handleLayerChange = useCallback(
    (layer: LayerType) => {
      const map = mapInstance.current;
      if (!map) return;

      try {
        // Mapbox built-in styles - switch entire style
        const mapboxStyles: Record<string, string | undefined> = {
          streets: MAPBOX_STYLES.streets,
          outdoors: MAPBOX_STYLES.outdoors,
          light: MAPBOX_STYLES.light,
          dark: MAPBOX_STYLES.dark,
          satellite: MAPBOX_STYLES.satellite,
          satelliteStreets: MAPBOX_STYLES.satelliteStreets,
        };

        if (mapboxStyles[layer]) {
          map.setStyle(mapboxStyles[layer]!);
          return;
        }
      } catch (e) {
        console.warn("Layer switch failed:", e);
      }
    },
    [mapInstance],
  );

  const activeLayer = useStore((s) => s.map.activeLayer);
  useEffect(() => {
    if (isStyleLoaded && mapInstance.current) {
      handleLayerChange(activeLayer);
    }
  }, [isStyleLoaded, activeLayer, handleLayerChange]);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map */}
      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: "2",
          pointerEvents: "auto",
        }}
      />

      {/* Stars */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      >
        <StarField />
      </div>

      <div className="absolute md:bottom-0 bottom-26 inset-0 z-2 pointer-events-none">
        {showButton && (
          <div className="pointer-events-auto">
            <StartExploreButton onClick={zoomToKarnataka} />
          </div>
        )}

        {!showButton && (
          <div className="pointer-events-auto">
            <MapControls map={mapInstance.current} />
          </div>
        )}
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        className="
          absolute top-5 left-0 w-full z-[3]
          text-center pointer-events-none
          text-[clamp(28px,7vw,110px)]
          tracking-[clamp(4px,2vw,14px)]
          text-[#e6f7ff]
          transition-all duration-400 ease-in-out
          [text-shadow:0_0_40px_rgba(108,207,255,0.6)]
          font-['Orbitron',sans-serif]
        "
      >
        NAMMA DHARANI
      </div>

      {/* UI Panels */}
      {!showButton && (
        <div className="absolute inset-0 z-4 pointer-events-none flex ">
          <div className="relative ">
            <div className="absolute md:-top-3 left-0 right-0 pointer-events-auto p-3 md:px-4 md:py-0 ">
              <NavBar />
            </div>

            <div className="absolute bottom-30 md:bottom-0 left-0 right-0 pointer-events-auto p-3 md:p-4 lg:p-4">
              <MapLayerSelector onLayerChange={handleLayerChange} />
            </div>
          </div>
          <div className="absolute top-3 right-3 pointer-events-auto ">
            <Profile />
          </div>
        </div>
      )}

      {/* Hover card — floating near marker, desktop only */}
      {mounted &&
        hoveredProperty &&
        hoverScreenPos &&
        window.innerWidth >= 768 &&
        createPortal(
          <div
            className="fixed pointer-events-none transition-all duration-200"
            style={{
              left: hoverScreenPos.x + 24,
              top: hoverScreenPos.y - 120,
              zIndex: 99999,
            }}
          >
            <PropertyHoverCard property={hoveredProperty} onOpen={() => {}} />
          </div>,
          document.body,
        )}
    </div>
  );
}
