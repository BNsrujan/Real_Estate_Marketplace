"use client";

import { useRef, useState, useCallback } from "react";
import StarField from "@/features/space/StarField";
import LoadingScreen from "@/shared/components/LoadingScreen";
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

export function MapCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  const handleMarkerClick = useCallback((prop: Property) => {
    setActiveProperty(null);
    setTimeout(() => setActiveProperty({ ...prop }), 0);
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
    onLoad: () => setIsLoaded(true),
    onZoom: handleZoomChange,
    onDistrictClick: (name) => filterByDistrictRef.current(name),
  });

  const { filterByDistrict } = useMarkerSync({
    mapRef: mapInstance,
    isStyleLoaded,
    onMarkerClick: handleMarkerClick,
  });

  filterByDistrictRef.current = filterByDistrict;

  const { zoomToKarnataka } = useDistrictZoom({ mapRef: mapInstance });

  return (
    <div className="relative w-full h-full overflow-hidden">

      <div className="absolute inset-0 z-0">
        <StarField />
      </div>


      <div className="absolute inset-0 z-1">
        <div ref={mapContainerRef} className="absolute inset-0" />

        <LoadingScreen isLoaded={isLoaded} />

        {showButton && <StartExploreButton onClick={zoomToKarnataka} />}

        <MapControls map={mapInstance.current} />

        {!showButton && (
          <div className="absolute flex inset-0 z-10 pointer-events-none">
            <DetailPanel activeMenu="map" />
            <div className="w-full flex flex-col justify-between h-screen p-6">
              <NavBar />
              <BottomBar />
            </div>
          </div>
        )}

        <div
          ref={titleRef}
          className="
            absolute top-5 left-0 w-full z-5
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
      </div>

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
