"use client";

import { useRef, useState, useCallback, useEffect } from "react";

import StarField from "@/features/space/components/star_field";
import StartExploreButton from "@/shared/components/common/startbtn";
import PropertyPopup from "./property_popup";
import { useMapInstance } from "../hooks/use_map_instance";
import { useMarkerSync } from "../hooks/use_marker_sync";
import { useDistrictZoom } from "../hooks/use_district_zoom";
import { usePropertyMarkers } from "@/features/properties/hooks/use_property_markers";
import { TILE_SOURCES, TITLE_FADE_ZOOM } from "@/lib/globe/map_config";
import type { Property, LayerType } from "@/shared/types";
import NavBar from "@/shared/components/navbar";
import MapLayerSelector from "./layer_selector";
import MapControls from "./map_controller";
import Profile from "@/features/profile/components/Profile";
import { usePropertyStore } from "@/features/properties/hooks/use_property_store";

interface Props {
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapCanvas({ setIsLoaded }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [showButton, setShowButton] = useState(true);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMarkerClick = useCallback((prop: Property) => {
    setActiveProperty(null);

    setTimeout(() => {
      setActiveProperty({ ...prop });
    }, 0);
  }, []);

  const handleMarkerHover = useCallback((prop: Property) => {
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

  const { mapRef: mapInstance, isStyleLoaded } = useMapInstance({
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
    onMarkerClick: handleMarkerClick,
    onMarkerHover: handleMarkerHover,
    onMarkerLeave: handleMarkerLeave,
  });

  useEffect(() => {
    filterByDistrictRef.current = filterByDistrict;
  }, [filterByDistrict]);

  // Expose district reset to Navbar (store-driven via resetFilters) and map controls
  const resetDistrictFilterRef = useRef(resetDistrictFilter);
  useEffect(() => {
    resetDistrictFilterRef.current = resetDistrictFilter;
  }, [resetDistrictFilter]);

  const { zoomToKarnataka } = useDistrictZoom({
    mapRef: mapInstance,
  });

  const handleLayerChange = useCallback((layer: LayerType) => {
    const map = mapInstance.current;
    if (!map) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const satSource = map.getSource("satellite") as any;

      if (layer === "osm") {
        satSource?.setTiles(TILE_SOURCES.osm.tiles);
        map.setPaintProperty("satellite", "raster-opacity", 1);
        map.setPaintProperty("roads", "raster-opacity", 0);
        map.setPaintProperty("labels", "raster-opacity", 0);
      } else if (layer === "standard") {
        satSource?.setTiles(TILE_SOURCES.topo.tiles);
        map.setPaintProperty("satellite", "raster-opacity", 1);
        map.setPaintProperty("roads", "raster-opacity", 0);
        map.setPaintProperty("labels", "raster-opacity", 0);
      } else if (layer === "traffic") {
        satSource?.setTiles(TILE_SOURCES.satellite.tiles);
        map.setPaintProperty("satellite", "raster-opacity", 0.7);
        map.setPaintProperty("roads", "raster-opacity", [
          "interpolate", ["linear"], ["zoom"], 8, 0, 11, 1, 18, 1,
        ]);
        map.setPaintProperty("labels", "raster-opacity", [
          "interpolate", ["linear"], ["zoom"], 9, 0, 12, 1,
        ]);
      } else {
        // satellite (default)
        satSource?.setTiles(TILE_SOURCES.satellite.tiles);
        map.setPaintProperty("satellite", "raster-opacity", 1);
        map.setPaintProperty("roads", "raster-opacity", [
          "interpolate", ["linear"], ["zoom"], 8, 0, 11, 0.9, 18, 1,
        ]);
        map.setPaintProperty("labels", "raster-opacity", [
          "interpolate", ["linear"], ["zoom"], 9, 0, 12, 0.95,
        ]);
      }
    } catch (e) {
      console.warn("Layer switch failed:", e);
    }
  }, [mapInstance]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map */}
      <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" , zIndex: "2" }} />

      {/* Stars */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      >
        <StarField />
      </div>

      <div className="absolute inset-0 z-2 pointer-events-none">
        {showButton && (
          <div className="pointer-events-auto">
            <StartExploreButton onClick={zoomToKarnataka} />
          </div>
        )}

        <div className="pointer-events-auto">
          <MapControls map={mapInstance.current} />
        </div>
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        className="
          absolute top-5 left-0 w-full 
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
          <div className="relative">
          <div className="absolute top-0 left-0 right-0 pointer-events-auto p-3 md:px-4 lg:px-6 ">
            <NavBar />
          </div>

          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto p-3 md:p-4 lg:p-6">
            <MapLayerSelector onLayerChange={handleLayerChange} />
          </div>

          </div>
          <div className="absolute top-3 right-3 pointer-events-auto ">
            <Profile />
          </div>
        </div>
      )}

      {/* Property Popup - Show on hover with smooth animation */}
      {hoveredProperty && (
        <PropertyPopup
          property={hoveredProperty}
          onClose={() => setHoveredProperty(null)}
          isHoverMode={true}
          markerLngLat={{ lng: hoveredProperty.lng, lat: hoveredProperty.lat }}
          mapInstance={mapInstance}
        />
      )}

      {/* Property Popup - Show on click */}
      {activeProperty && (
        <PropertyPopup
          property={activeProperty}
          onClose={() => setActiveProperty(null)}
          isHoverMode={false}
          markerLngLat={{ lng: activeProperty.lng, lat: activeProperty.lat }}
          mapInstance={mapInstance}
        />
      )}
    </div>
  );
}
