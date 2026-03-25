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

  // ✅ popup state
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);

  // ✅ NEW: delay-safe handler
  const handleMarkerClick = useCallback((prop: Property) => {
    console.log("🔥 POPUP STATE SET:", prop);

    setActiveProperty(null); // reset first (IMPORTANT)

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

    // ✅ IMPORTANT FIX HERE
    onMarkerClick: handleMarkerClick,
  });

  filterByDistrictRef.current = filterByDistrict;

  // ── NAVIGATION ──────────────────────────────────────────────
  const { zoomToKarnataka } = useDistrictZoom({ mapRef });

  // ── UI ─────────────────────────────────────────────────────
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <StarField />

      {showButton && <StartExploreButton onClick={zoomToKarnataka} />}

      <div
        ref={mapContainerRef}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0, // 🔥 LOWER THIS
        }}
      />

      <div
        ref={titleRef}
        style={{
          position: "absolute",
          top: "20px",
          width: "100%",
          textAlign: "center",
          fontSize: "clamp(48px, 8vw, 110px)",
          fontWeight: "700",
          letterSpacing: "14px",
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
      {/* <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 20,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          style={{
            fontFamily: "Plus Jakarta Sans",
            fontWeight: 600,
            letterSpacing: "2px",
          }}
        >
          NAMMA DHARANI
        </div>

        <div style={{ fontSize: "12px", opacity: 0.6 }}>
          Karnataka Real Estate
        </div>
      </div> */}
      {showButton && (
        <div
          style={{
            position: "absolute",
            bottom: "150px",
            width: "100%",
            textAlign: "center",
            color: "#aaa",
            fontSize: "14px",
            letterSpacing: "2px",
            zIndex: 4,
          }}
        >
          Click to explore → Select a district → View properties
        </div>
      )}

      <LoadingScreen isLoaded={isLoaded} />

      {/* ✅ POPUP */}
      {/* {activeProperty && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 9999999,
            pointerEvents: "auto",
          }}
        > */}
      {activeProperty && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            zIndex: 2147483647, // 🔥 MAX possible z-index
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
