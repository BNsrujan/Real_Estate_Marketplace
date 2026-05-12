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
import Profile from "@/features/profile/components/Profile";

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
          <div className="hidden md:block pointer-events-auto">
            <DetailPanel activeMenu="map" />
          </div>
        

          <div className="relative">
          <div className="absolute top-0 left-0 right-0 pointer-events-auto p-3 md:px-4 lg:px-6 ">
            <NavBar />
          </div>

          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto p-3 md:p-4 lg:p-6">
            <BottomBar />
          </div>

          </div>
          <div className="absolute top-3 right-3 pointer-events-auto ">
            <Profile />
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
