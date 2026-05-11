"use client";

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

import StarField from "../../../features/space/StarField";
import LoadingScreen from "../LoadingScreen";
import StartExploreButton from "../ui/startbtn";
import MapControls from "@/shared/components/ui/MapControls";
import { useMapInstance } from "@/features/map/hooks/useMapInstance";

export default function GlobeView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showButton, setShowButton] = useState(true);

  const { mapRef } = useMapInstance({
    containerRef: mapContainer,
    onLoad: () => setIsLoaded(true),
    onZoom: (z) => {
      if (titleRef.current) titleRef.current.style.opacity = z >= 6 ? "0" : "1";
      setShowButton(z < 4);
    },
    onDistrictClick: (name) => {
      // keep previous behaviour shallow: let other managers handle filtering
      // components can subscribe to managers if they need finer control
      console.log("district clicked:", name);
    },
  });

  const mapInstance = mapRef.current;

  const handleZoomToKarnataka = () => {
    if (!mapInstance) return;
    try {
      mapInstance.flyTo({
        center: [75.7139, 15.3173],
        zoom: 6,
        speed: 0.6,
        curve: 1.8,
        easing: (t: number) => t * (2 - t),
      });
    } catch {}
  };

  // GlobeView is now intentionally lightweight — map lifecycle, controllers and managers
  // are handled by useMapInstance -> useMapLifecycle/useMapControllers/useMapManagers.

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <StarField />
      {showButton && <StartExploreButton onClick={handleZoomToKarnataka} />}

      {/* Custom navigation controls — replaces maplibre's default */}
      <MapControls map={mapInstance} />

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
        }}
      >
        NAMMA DHARANI
      </div>

      <LoadingScreen isLoaded={isLoaded} />

      {selectedProperty && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "40%",
            background: "rgba(10,20,40,0.95)",
            backdropFilter: "blur(10px)",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            padding: "20px",
            zIndex: 999,
            color: "#fff",
            fontFamily: "Orbitron",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{selectedProperty.title}</h3>
            <button onClick={() => setSelectedProperty(null)}>✕</button>
          </div>
          <p>📍 {selectedProperty.district}</p>
          <p>🏠 Type: {selectedProperty.type}</p>
          <p>💰 Price: ₹{selectedProperty.price}</p>
          <p>📐 Size: {selectedProperty.size}</p>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&display=swap');
      `}</style>
    </div>
  );
}
