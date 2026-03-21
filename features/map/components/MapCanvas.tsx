"use client";

import { useRef, useState, useCallback } from "react";

import StarField from "@/components/space/StarField";
import LoadingScreen from "@/components/loading/LoadingScreen";
import StartExploreButton from "@/components/ui/startbtn";

import { useMapInstance } from "../hooks/useMapInstance";
import { useMarkerSync } from "../hooks/useMarkerSync";
import { useDistrictZoom } from "../hooks/useDistrictZoom";

import { TITLE_FADE_ZOOM } from "@/lib/globe/mapConfig";

/**
 * MapCanvas — the single orchestrator for the interactive globe.
 *
 * Responsibilities (intentionally limited):
 *   - Wire hooks together
 *   - Own UI state (loading flag, show/hide explore button, title opacity)
 *   - Render the container div for MapLibre and the overlay UI
 *
 * All map logic lives in hooks; all data logic lives in services.
 */
export function MapCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [showButton, setShowButton] = useState(true);

  // Stable ref so the district-click handler in useMapInstance always calls
  // the latest filterByDistrict without becoming a stale closure
  const filterByDistrictRef = useRef<(name: string) => void>(() => {});

  const handleZoomChange = useCallback((zoom: number) => {
    if (titleRef.current) {
      titleRef.current.style.opacity = zoom >= TITLE_FADE_ZOOM ? "0" : "1";
    }
    setShowButton(zoom < 4);
  }, []);

  // ── Map lifecycle ─────────────────────────────────────────────────────────
  const { mapRef, isStyleLoaded } = useMapInstance({
    containerRef: mapContainerRef,
    onLoad: () => setIsLoaded(true),
    onZoom: handleZoomChange,
    // Delegate to the ref so it always reaches the latest filterByDistrict
    onDistrictClick: (name) => filterByDistrictRef.current(name),
  });

  // ── Marker management ─────────────────────────────────────────────────────
  const { filterByDistrict } = useMarkerSync({ mapRef, isStyleLoaded });

  // Keep ref in sync with the latest function
  filterByDistrictRef.current = filterByDistrict;

  // ── Navigation ────────────────────────────────────────────────────────────
  const { zoomToKarnataka } = useDistrictZoom({ mapRef });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 3D starfield background — rendered behind everything */}
      <StarField />

      {/* "Explore Karnataka" button — visible only at low zoom */}
      {showButton && <StartExploreButton onClick={zoomToKarnataka} />}

      {/* MapLibre target — fills the full viewport above the starfield */}
      <div
        ref={mapContainerRef}
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
      />

      {/* Title overlay — fades out as the user zooms in */}
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

      {/* Loading overlay — auto-dismisses once map tiles are ready */}
      <LoadingScreen isLoaded={isLoaded} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}
