"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";

import { Plus, Minus, Compass, LocateFixed, Loader2 } from "lucide-react";

interface MapControlsProps {
  map: maplibregl.Map | null;
}

type LocationState = "idle" | "locating" | "active" | "error";

export default function MapControls({ map }: MapControlsProps) {
  const [bearing, setBearing] = useState(0);
  const [locationState, setLocationState] = useState<LocationState>("idle");

  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Track map rotation
  useEffect(() => {
    if (!map) return;

    const onRotate = () => {
      setBearing(map.getBearing());
    };

    map.on("rotate", onRotate);

    return () => {
      map.off("rotate", onRotate);
    };
  }, [map]);

  // Zoom In
  const handleZoomIn = useCallback(() => {
    if (!map) return;

    map.easeTo({
      zoom: map.getZoom() + 1,
      duration: 300,
    });
  }, [map]);

  // Zoom Out
  const handleZoomOut = useCallback(() => {
    if (!map) return;

    map.easeTo({
      zoom: map.getZoom() - 1,
      duration: 300,
    });
  }, [map]);

  // Reset Compass
  const handleCompass = useCallback(() => {
    if (!map) return;

    map.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 500,
    });
  }, [map]);

  // Current Location
  const handleLocation = useCallback(() => {
    if (!map) return;

    // Stop tracking
    if (locationState === "active") {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      locationMarkerRef.current?.remove();

      locationMarkerRef.current = null;
      watchIdRef.current = null;

      setLocationState("idle");

      return;
    }

    if (!navigator.geolocation) {
      setLocationState("error");

      setTimeout(() => {
        setLocationState("idle");
      }, 2000);

      return;
    }

    setLocationState("locating");

    // Custom location marker
    const markerElement = document.createElement("div");

    markerElement.className = `
      relative
      flex
      items-center
      justify-center
    `;

    markerElement.innerHTML = `
      <div class="absolute h-10 w-10 rounded-full bg-cyan-400/20 animate-ping"></div>
      <div class="h-4 w-4 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]"></div>
    `;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;

        setLocationState("active");

        if (!locationMarkerRef.current) {
          locationMarkerRef.current = new maplibregl.Marker({
            element: markerElement,
            anchor: "center",
          })
            .setLngLat([lng, lat])
            .addTo(map);

          map.flyTo({
            center: [lng, lat],
            zoom: Math.max(map.getZoom(), 14),
            speed: 1.2,
            curve: 1.5,
            essential: true,
          });
        } else {
          locationMarkerRef.current.setLngLat([lng, lat]);
        }
      },
      () => {
        setLocationState("error");

        setTimeout(() => {
          setLocationState("idle");
        }, 2500);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }, [map, locationState]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      locationMarkerRef.current?.remove();
    };
  }, []);

  return (
    <div
      className="
        absolute
        bottom-6
        right-6
        z-50
        flex
        flex-col
        items-center
        gap-3
      "
    >
      {/* Current Location */}
      <button
        onClick={handleLocation}
        aria-label="Current location"
        className={`
          group
          relative
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-3xl
          border
          backdrop-blur-2xl
          shadow-[0_10px_50px_rgba(0,0,0,0.45)]
          transition-all duration-300
          active:scale-95

          ${
            locationState === "active"
              ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
              : "border-white/10 bg-black/35 text-white/80 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        {locationState === "locating" ? (
          <Loader2 size={20} className="animate-spin" />
        ) : (
          <LocateFixed
            size={20}
            className="
              transition-transform duration-300
              group-hover:scale-110
            "
          />
        )}

        {/* Active Pulse */}
        {locationState === "active" && (
          <div
            className="
              absolute inset-0
              rounded-3xl
              border border-cyan-400/30
              animate-pulse
            "
          />
        )}
      </button>
      {/* Zoom Controls */}
      <div
        className="
          overflow-hidden
          rounded-3xl
          border border-white/10
          bg-black/35
          backdrop-blur-2xl
          shadow-[0_10px_50px_rgba(0,0,0,0.45)]
        "
      >
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="
            group
            flex
            h-14
            w-14
            items-center
            justify-center
            text-white/80
            transition-all duration-300
            hover:bg-white/10
            hover:text-white
            active:scale-95
          "
        >
          <Plus
            size={20}
            className="transition-transform group-hover:scale-110"
          />
        </button>

        {/* Divider */}
        <div className="mx-3 h-px bg-white/10" />

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="
            group
            flex
            h-14
            w-14
            items-center
            justify-center
            text-white/80
            transition-all duration-300
            hover:bg-white/10
            hover:text-white
            active:scale-95
          "
        >
          <Minus
            size={20}
            className="transition-transform group-hover:scale-110"
          />
        </button>
      </div>
    </div>
  );
}
