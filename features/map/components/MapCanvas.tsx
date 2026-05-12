"use client";

import { useRef, useState, useCallback } from "react";

import StarField from "@/features/space/StarField";
import StartExploreButton from "@/shared/components/ui/startbtn";
import PropertyPopup from "@/shared/components/map/PropertyPopup";

import { useMapInstance } from "../hooks/useMapInstance";
import { useMarkerSync } from "../hooks/useMarkerSync";
import { useDistrictZoom } from "../hooks/useDistrictZoom";

import { TITLE_FADE_ZOOM } from "@/lib/globe/mapConfig";

import type { Property } from "@/shared/types";

import NavBar from "@/shared/components/navbar";
import DetailPanel from "@/shared/components/sidebardetails";
import BottomBar from "@/shared/components/bottombar";
import MapControls from "@/shared/components/ui/MapControls";

interface Props {
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapCanvas({ setIsLoaded }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [showButton, setShowButton] = useState(true);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const handleMarkerClick = useCallback((prop: Property) => {
    setActiveProperty(null);

    setTimeout(() => {
      setActiveProperty({ ...prop });
    }, 0);
  }, []);

  const filterByDistrictRef = useRef<(name: string) => void>(() => {});

  const handleZoomChange = useCallback((zoom: number) => {
    if (titleRef.current) {
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

  const { filterByDistrict } = useMarkerSync({
    mapRef: mapInstance,
    isStyleLoaded,
    onMarkerClick: handleMarkerClick,
  });

  filterByDistrictRef.current = filterByDistrict;

  const { zoomToKarnataka } = useDistrictZoom({
    mapRef: mapInstance,
  });

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Map */}
      <div ref={mapContainerRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" , zIndex: "2" }} />

      {/* Stars */}
      <div
        className="absolute inset-0 z-0ddd pointer-events-none"
        style={{ mixBlendMode: "screen" }}
      >
        <StarField />
      </div>

      {/* Controls */}
      <div className="absolute inset-0 z-1">
        {showButton && <StartExploreButton onClick={zoomToKarnataka} />}
        <MapControls map={mapInstance.current} />
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        className="
          absolute top-5 left-0 w-full z-3
          text-center pointer-events-none
          text-[clamp(28px,7vw,110px)]
          tracking-[clamp(4px,2vw,14px)]
          text-[#e6f7ff]
          transition-opacity duration-400 ease-in-out
          [text-shadow:0_0_40px_rgba(108,207,255,0.6)]
          font-['Orbitron',sans-serif]
        "
      >
        NAMMA DHARANI
      </div>

      {/* UI Panels */}
      {!showButton && (
        <div className="absolute flex inset-0 z-4 pointer-events-none flex-col md:flex-row">
          <div className="hidden md:block">
            <DetailPanel activeMenu="map" />
          </div>

          <div className="w-full flex flex-col justify-between h-screen p-3 md:p-4 lg:p-6">
            <NavBar />
            <BottomBar />
          </div>
        </div>
      )}

      {/* Property Popup */}
      {activeProperty && (
        <div className="fixed bottom-0 w-full z-[2147483647] pointer-events-auto">
          <PropertyPopup
            property={activeProperty}
            onClose={() => setActiveProperty(null)}
          />
        </div>
      )}
    </div>
  );
}
