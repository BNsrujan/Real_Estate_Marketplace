"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";

import { Plus, Minus, Compass, LocateFixed, Loader2 } from "lucide-react";
import { useStore } from "@/shared/store";

interface MapControlsProps {
  map: maplibregl.Map | null;
}

type LocationState = "idle" | "locating" | "active" | "error";

export default function MapControls({ map }: MapControlsProps) {
  const [bearing, setBearing] = useState(0);
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const addToast = useStore((s) => s.addToast);

  const locationMarkerRef = useRef<maplibregl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locateTimeoutRef = useRef<number | null>(null);

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

  // Current Location
  const handleLocation = useCallback(() => {
    if (!map) return;
    // If already active, stop watching and remove marker
    if (locationState === "active") {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (locateTimeoutRef.current !== null) {
        window.clearTimeout(locateTimeoutRef.current);
        locateTimeoutRef.current = null;
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

    const ACCURACY_THRESHOLD = 30;
    const LOCATE_TIMEOUT = 25000;

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

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (locateTimeoutRef.current !== null) {
      window.clearTimeout(locateTimeoutRef.current);
      locateTimeoutRef.current = null;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lng = position.coords.longitude;
        const lat = position.coords.latitude;
        const accuracy = position.coords.accuracy ?? Infinity;

        if (accuracy <= ACCURACY_THRESHOLD) {
          setLocationState("active");
        } else {
          setLocationState("locating");
        }

        if (!locationMarkerRef.current) {
          locationMarkerRef.current = new maplibregl.Marker({
            element: markerElement,
            anchor: "center",
          })
            .setLngLat([lng, lat])
            .addTo(map);

          if (accuracy <= ACCURACY_THRESHOLD) {
            map.stop();
            map.flyTo({
              center: [lng, lat],
              zoom: Math.max(map.getZoom(), 14),
              speed: 1.2,
              curve: 1.5,
              essential: true,
            });
          }
        } else {
          locationMarkerRef.current.setLngLat([lng, lat]);
          if (accuracy <= ACCURACY_THRESHOLD) {
            map.easeTo({ center: [lng, lat], duration: 400 });
          }
        }
      },
      (err: GeolocationPositionError) => {
        setLocationState("error");

        if (err.code === err.PERMISSION_DENIED) {
          addToast({
            type: "error",
            message: "Location access denied. Enable it in browser settings.",
          });
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          addToast({
            type: "error",
            message: "Location unavailable. Check your device GPS.",
          });
        } else {
          addToast({
            type: "warning",
            message: "Location timed out. Tap to try again.",
          });
        }

        setTimeout(() => {
          setLocationState("idle");
        }, 2500);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      },
    );

    locateTimeoutRef.current = window.setTimeout(() => {
      setLocationState("error");
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      watchIdRef.current = null;
      if (locationMarkerRef.current) {
        locationMarkerRef.current.remove();
        locationMarkerRef.current = null;
      }
      locateTimeoutRef.current = null;
    }, LOCATE_TIMEOUT);
  }, [map, locationState]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (locateTimeoutRef.current !== null) {
        window.clearTimeout(locateTimeoutRef.current);
        locateTimeoutRef.current = null;
      }

      locationMarkerRef.current?.remove();
    };
  }, []);

  return (
    <div className="absolute bottom-6 right-6 z-50 flex flex-col items-center gap-3">
      {/* Current Location */}
      <button
        onClick={handleLocation}
        aria-label="Current location"
        className={`group relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-2xl md:rounded-3xl border backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 ${
          locationState === "active"
            ? "border-primary/50 bg-primary/20 text-primary"
            : "border-white/10 bg-black/40 text-white/80 hover:bg-white/12 hover:text-white"
        }`}
      >
        {locationState === "locating" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LocateFixed className="transition-transform duration-300 group-hover:scale-110" />
        )}

        {locationState === "active" && (
          <div className="absolute inset-0 rounded-3xl border border-primary/40 animate-pulse" />
        )}
      </button>

      {/* Zoom Controls */}
      <div className="overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 bg-black/40 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.45)]">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="group flex h-10 w-10 md:h-14 md:w-14 items-center justify-center text-white/80 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/10 hover:text-white active:scale-95"
        >
          <Plus className="transition-transform duration-300 group-hover:scale-110" />
        </button>

        <div className="mx-3 h-px bg-white/10" />

        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="group flex h-10 w-10 md:h-14 md:w-14 items-center justify-center text-white/80 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-white/10 hover:text-white active:scale-95"
        >
          <Minus className="transition-transform duration-300 group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}
