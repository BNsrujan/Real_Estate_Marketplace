"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";

import { Plus, Minus, LocateFixed, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentPositionLowAccuracy,
  watchPositionHighAccuracy,
  flyToPosition,
  drawAccuracyCircle,
  removeAccuracyCircle,
  shouldWarnAccuracy,
  type GeolocationResult,
  type GeolocationError,
} from "@/features/map/services/geolocation_service";

interface MapControlsProps {
  map: mapboxgl.Map | null;
}

type LocationState = "idle" | "locating" | "active" | "error";

export default function MapControls({ map }: MapControlsProps) {
  const [locationState, setLocationState] = useState<LocationState>("idle");

  const locationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locateTimeoutRef = useRef<number | null>(null);
  // Ref mirrors locationState so async callbacks/timeouts always read current value
  const locationStateRef = useRef<LocationState>("idle");

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

  const setLocationStateWithRef = (s: LocationState) => {
    locationStateRef.current = s;
    setLocationState(s);
  };

  // Current Location — Enhanced with Accuracy Visualization
  const handleLocation = useCallback(() => {
    if (!map) return;

    // If already active, stop watching and remove marker
    if (locationStateRef.current === "active" || locationStateRef.current === "locating") {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (locateTimeoutRef.current !== null) {
        window.clearTimeout(locateTimeoutRef.current);
        locateTimeoutRef.current = null;
      }
      locationMarkerRef.current?.remove();
      locationMarkerRef.current = null;
      removeAccuracyCircle(map);
      setLocationStateWithRef("idle");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device.");
      setLocationStateWithRef("error");
      setTimeout(() => setLocationStateWithRef("idle"), 2000);
      return;
    }

    setLocationStateWithRef("locating");
    let isFirstAccurate = false;

    // Create animated marker element
    const markerElement = document.createElement("div");
    markerElement.className = "relative flex items-center justify-center";
    markerElement.innerHTML = `
      <div class="absolute h-10 w-10 rounded-none bg-vermilion/20 animate-ping"></div>
      <div class="h-4 w-4 rounded-none border-2 border-white bg-vermilion shadow-[0_0_20px_rgba(34,211,238,0.9)]"></div>
    `;

    // Clear any existing watch/timeout
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locateTimeoutRef.current !== null) {
      window.clearTimeout(locateTimeoutRef.current);
      locateTimeoutRef.current = null;
    }

    // ─── Start High-Accuracy Watch ───
    watchIdRef.current = watchPositionHighAccuracy(
      // onSuccess — position received (any accuracy)
      (result: GeolocationResult) => {
        const { latitude, longitude, accuracy } = result;

        // Warn once if accuracy is poor — use ref to avoid stale closure
        if (shouldWarnAccuracy(accuracy) && locationStateRef.current === "locating") {
          toast.warning(
            `Low precision: ±${Math.round(accuracy)}m. Try moving outdoors.`,
            { duration: 3000 },
          );
        }

        if (!locationMarkerRef.current) {
          // First fix — create marker and fly to location
          locationMarkerRef.current = new mapboxgl.Marker({
            element: markerElement,
            anchor: "center",
          })
            .setLngLat([longitude, latitude])
            .addTo(map);

          flyToPosition(map, latitude, longitude, accuracy, { drawCircle: true });
        } else {
          // Subsequent fixes — update marker + accuracy circle without flying
          locationMarkerRef.current.setLngLat([longitude, latitude]);
          removeAccuracyCircle(map);
          drawAccuracyCircle(map, latitude, longitude, accuracy);
          // Gentle pan only — no competing flyTo
          map.easeTo({ center: [longitude, latitude], duration: 400 });
        }
      },

      // onError — geolocation failed
      async (error: GeolocationError) => {
        if (error.code === "PERMISSION_DENIED") {
          toast.error(error.message);
          setLocationStateWithRef("error");
          setTimeout(() => setLocationStateWithRef("idle"), 2500);
        } else if (error.code === "POSITION_UNAVAILABLE") {
          toast.error(error.message);
          setLocationStateWithRef("error");
          setTimeout(() => setLocationStateWithRef("idle"), 2500);
        } else if (error.code === "TIMEOUT") {
          // GPS timeout → retry with WiFi/IP location
          toast.warning("GPS timeout, trying WiFi/IP location...");
          try {
            const result = await getCurrentPositionLowAccuracy();
            setLocationStateWithRef("active");
            const { latitude, longitude, accuracy } = result;
            if (!locationMarkerRef.current) {
              locationMarkerRef.current = new mapboxgl.Marker({
                element: markerElement,
                anchor: "center",
              })
                .setLngLat([longitude, latitude])
                .addTo(map);
            } else {
              locationMarkerRef.current.setLngLat([longitude, latitude]);
            }
            flyToPosition(map, latitude, longitude, accuracy, { drawCircle: true });
            toast.success("Location acquired (WiFi/IP)");
          } catch {
            toast.error("Could not determine location. Try again.");
            setLocationStateWithRef("error");
            setTimeout(() => setLocationStateWithRef("idle"), 2500);
          }
        }
      },

      // onAccuracyThreshold — high-confidence position reached (<=30m)
      (result: GeolocationResult) => {
        if (!isFirstAccurate) {
          isFirstAccurate = true;
          setLocationStateWithRef("active");
          toast.success(`GPS locked: ±${Math.round(result.accuracy)}m`);
        }
      },
    );

    // ─── Timeout if no accurate position in 30 seconds ───
    // Uses locationStateRef (not locationState) to avoid stale closure.
    locateTimeoutRef.current = window.setTimeout(() => {
      if (locationStateRef.current === "locating") {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setLocationStateWithRef("error");
        toast.error("Location request timeout. Please try again.");
        setTimeout(() => setLocationStateWithRef("idle"), 2500);
      }
    }, 30000);
  }, [map]);

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

      // Clean up accuracy circle on unmount
      if (map) {
        removeAccuracyCircle(map);
      }
    };
  }, [map]);

  return (
    <div className="absolute bottom-20 right-6 z-50 flex flex-col items-center gap-3 md:bottom-6">
      {/* Current Location */}
      <button
        onClick={handleLocation}
        aria-label="Current location"
        className={`group relative flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-none md:rounded-none border backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.45)] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 ${
          locationState === "active"
            ? "border-primary/50 bg-primary/20 text-primary"
            : "border-hairline bg-parchment/90 text-ink hover:bg-parchment-deep hover:text-ink"
        }`}
      >
        {locationState === "locating" ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LocateFixed className="transition-transform duration-300 group-hover:scale-110" />
        )}

        {locationState === "active" && (
          <div className="absolute inset-0 rounded-none border border-primary/40 animate-pulse" />
        )}
      </button>

      {/* Zoom Controls */}
      <div className="overflow-hidden rounded-none md:rounded-none border border-hairline bg-parchment/90 backdrop-blur-2xl shadow-[0_10px_50px_rgba(0,0,0,0.45)]">
        <button
          onClick={handleZoomIn}
          aria-label="Zoom in"
          className="group flex h-10 w-10 md:h-14 md:w-14 items-center justify-center text-ink transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-parchment-deep hover:text-ink active:scale-95"
        >
          <Plus className="transition-transform duration-300 group-hover:scale-110" />
        </button>

        <div className="mx-3 h-px bg-parchment-deep" />

        <button
          onClick={handleZoomOut}
          aria-label="Zoom out"
          className="group flex h-10 w-10 md:h-14 md:w-14 items-center justify-center text-ink transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-parchment-deep hover:text-ink active:scale-95"
        >
          <Minus className="transition-transform duration-300 group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
}
