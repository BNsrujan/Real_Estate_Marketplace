"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";

import {
  Plus,
  Minus,
  Compass,
  LocateFixed,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getCurrentPositionHighAccuracy,
  getCurrentPositionLowAccuracy,
  watchPositionHighAccuracy,
  flyToPosition,
  removeAccuracyCircle,
  shouldWarnAccuracy,
  handleGeolocationErrorWithRetry,
  type GeolocationResult,
  type GeolocationError,
} from "@/features/map/services/geolocation_service";

interface MapControlsProps {
  map: mapboxgl.Map | null;
}

type LocationState = "idle" | "locating" | "active" | "error";

export default function MapControls({ map }: MapControlsProps) {
  const [bearing, setBearing] = useState(0);
  const [locationState, setLocationState] = useState<LocationState>("idle");

  const locationMarkerRef = useRef<mapboxgl.Marker | null>(null);
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

  // Current Location — Enhanced with Accuracy Visualization
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
      removeAccuracyCircle(map);

      locationMarkerRef.current = null;
      watchIdRef.current = null;

      setLocationState("idle");
      return;
    }

    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device.");
      setLocationState("error");
      setTimeout(() => setLocationState("idle"), 2000);
      return;
    }

    setLocationState("locating");
    let isFirstAccurate = false;

    // Create animated marker element
    const markerElement = document.createElement("div");
    markerElement.className = "relative flex items-center justify-center";
    markerElement.innerHTML = `
      <div class="absolute h-10 w-10 rounded-full bg-cyan-400/20 animate-ping"></div>
      <div class="h-4 w-4 rounded-full border-2 border-white bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]"></div>
    `;

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Clear any existing timeout
    if (locateTimeoutRef.current !== null) {
      window.clearTimeout(locateTimeoutRef.current);
      locateTimeoutRef.current = null;
    }

    // ─── Start High-Accuracy Watch ───
    watchIdRef.current = watchPositionHighAccuracy(
      // onSuccess — position received (any accuracy)
      (result: GeolocationResult) => {
        const { latitude, longitude, accuracy } = result;

        // Warn if accuracy is poor
        if (shouldWarnAccuracy(accuracy)) {
          if (locationState === "locating") {
            toast.warning(
              `Low precision: ±${Math.round(accuracy)}m. Try moving outdoors.`,
              { duration: 3000 },
            );
          }
        }

        // Update or create marker
        if (!locationMarkerRef.current) {
          locationMarkerRef.current = new mapboxgl.Marker({
            element: markerElement,
            anchor: "center",
          })
            .setLngLat([longitude, latitude])
            .addTo(map);

          // Fly to position with accuracy-based zoom
          flyToPosition(map, latitude, longitude, accuracy, {
            drawCircle: true,
          });
        } else {
          locationMarkerRef.current.setLngLat([longitude, latitude]);

          // Smooth pan to updated position
          map.easeTo({
            center: [longitude, latitude],
            duration: 400,
          });

          // Redraw accuracy circle
          removeAccuracyCircle(map);
          flyToPosition(map, latitude, longitude, accuracy, {
            duration: 0,
            drawCircle: true,
          });
        }
      },

      // onError — geolocation failed
      async (error: GeolocationError) => {
        setLocationState("error");

        if (error.code === "PERMISSION_DENIED") {
          toast.error(error.message);
        } else if (error.code === "POSITION_UNAVAILABLE") {
          toast.error(error.message);
        } else if (error.code === "TIMEOUT") {
          // Timeout → retry with low accuracy
          toast.warning("GPS timeout, trying WiFi/IP location...");

          try {
            const result = await getCurrentPositionLowAccuracy();
            setLocationState("active");

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

            flyToPosition(map, latitude, longitude, accuracy, {
              drawCircle: true,
            });

            toast.success("Location acquired (WiFi/IP)");
          } catch (retryError) {
            const err = retryError as GeolocationError;
            toast.error("Could not determine location. Try again.");
          }
        }

        setTimeout(() => {
          setLocationState("idle");
        }, 2500);
      },

      // onAccuracyThreshold — high-confidence position reached (<=30m)
      (result: GeolocationResult) => {
        if (!isFirstAccurate) {
          isFirstAccurate = true;
          setLocationState("active");
          toast.success(`GPS locked: ±${Math.round(result.accuracy)}m`);
        }
      },
    );

    // ─── Timeout if no accurate position in 30 seconds ───
    locateTimeoutRef.current = window.setTimeout(() => {
      if (locationState === "locating") {
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        setLocationState("error");
        toast.error("Location request timeout. Please try again.");
        setTimeout(() => setLocationState("idle"), 2500);
      }
    }, 30000);
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

      // Clean up accuracy circle on unmount
      if (map) {
        removeAccuracyCircle(map);
      }
    };
  }, [map]);

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
