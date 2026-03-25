"use client";

import { useRef, useState, useCallback } from "react";
import StarField from "@/components/space/StarField";
import LoadingScreen from "@/components/loading/LoadingScreen";
import StartExploreButton from "@/components/ui/startbtn";
import PropertyPopup from "@/components/map/PropertyPopup";

import { useMapInstance } from "../hooks/useMapInstance";
import { useMarkerSync } from "../hooks/useMarkerSync";
import { useDistrictZoom } from "../hooks/useDistrictZoom";

import { TITLE_FADE_ZOOM } from "@/lib/globe/mapConfig";
import type { Property } from "@/types";

export function MapCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
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

  // ── MAP ─────────────────────────────────────────────────────
  const { mapRef, isStyleLoaded } = useMapInstance({
    containerRef: mapContainerRef,
    onLoad: () => setIsLoaded(true),
    onZoom: handleZoomChange,
    onDistrictClick: (name) => filterByDistrictRef.current(name),
  });

  // ── MARKERS ─────────────────────────────────────────────────
  const { filterByDistrict } = useMarkerSync({
    mapRef,
    isStyleLoaded,

    onMarkerClick: handleMarkerClick,
  });

  filterByDistrictRef.current = filterByDistrict;

  // ── NAVIGATION ──────────────────────────────────────────────
  const { zoomToKarnataka } = useDistrictZoom({ mapRef });
  return (
    <div style={{ width: "100vw", height: "100dvh", position: "relative" }}>
      <StarField />
      <LoadingScreen isLoaded={isLoaded} />

      {showButton && <StartExploreButton onClick={zoomToKarnataka} />}

      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      <div
        ref={titleRef}
        style={{
          position: "absolute",
          top: "20px",
          width: "100%",
          textAlign: "center",
          fontSize: "clamp(28px, 7vw, 110px)",
          // letterSpacing: window.innerWidth < 768 ? "6px" : "14px",
          letterSpacing: "clamp(4px, 2vw, 14px)",
          color: "#e6f7ff",
          zIndex: 0,
          fontFamily: "Orbitron",
          textShadow: "0 0 40px rgba(108,207,255,0.6)",
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
        }}
      >
        NAMMA DHARANI
      </div>

      {activeProperty && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 2147483647,
            pointerEvents: "auto",
          }}
        >
          <PropertyPopup
            property={activeProperty}
            onClose={() => setActiveProperty(null)}
          />
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}
