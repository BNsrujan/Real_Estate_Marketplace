import mapboxgl, { GeoJSONSource } from "mapbox-gl";

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number; // metres
  timestamp: number;
}

export interface GeolocationError {
  code: "PERMISSION_DENIED" | "POSITION_UNAVAILABLE" | "TIMEOUT" | "UNKNOWN";
  message: string;
}

export function getZoomForAccuracy(accuracyMetres: number): number {
  if (accuracyMetres <= 20) return 17; // GPS-quality — street level
  if (accuracyMetres <= 100) return 15; // Good WiFi — district
  if (accuracyMetres <= 500) return 13; // Poor WiFi — neighbourhood
  if (accuracyMetres <= 2000) return 11; // IP-based — city area
  return 9; // Very poor — district only
}

// ─── Accuracy Warning Threshold ──────────────────────────────────────────────
/**
 * Returns true if accuracy is poor enough to warn the user.
 * The accuracy represents a 68% confidence circle radius.
 * >100m generally indicates low-confidence positioning.
 */
export function shouldWarnAccuracy(accuracyMetres: number): boolean {
  return accuracyMetres > 100;
}

// ─── Create Accuracy Circle GeoJSON ───────────────────────────────────────────
/**
 * Generates a circular GeoJSON polygon representing the accuracy radius.
 * Uses 64 points around the circumference for smooth appearance.
 *
 * @param lat - Centre latitude
 * @param lng - Centre longitude
 * @param radiusKm - Radius in kilometres
 */
export function createCircleGeoJSON(
  lat: number,
  lng: number,
  radiusKm: number
): GeoJSON.FeatureCollection<GeoJSON.Polygon> {
  const sides = 64;
  const points: [number, number][] = [];

  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * (2 * Math.PI);
    const dLat = (radiusKm / 111.32) * Math.cos(angle);
    const dLng =
      (radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180))) *
      Math.sin(angle);

    points.push([lng + dLng, lat + dLat]);
  }

  // Close the polygon
  points.push(points[0]);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [points],
        },
        properties: {},
      },
    ],
  };
}

// ─── Add/Update Accuracy Circle on Map ───────────────────────────────────────
/**
 * Draws or updates the accuracy radius visualization on the map.
 * Shows a semi-transparent blue circle with border.
 */
export function drawAccuracyCircle(
  map: mapboxgl.Map,
  lat: number,
  lng: number,
  accuracyMetres: number
) {
  const radiusKm = accuracyMetres / 1000;
  const geoJSON = createCircleGeoJSON(lat, lng, radiusKm);

  const existingSource = map.getSource("accuracy-circle");

  if (existingSource && (existingSource as GeoJSONSource).setData) {
    // Update existing source
    (existingSource as GeoJSONSource).setData(geoJSON);
  } else {
    // Add new source and layers
    map.addSource("accuracy-circle", {
      type: "geojson",
      data: geoJSON,
    });

    // Fill layer (semi-transparent).
    // No beforeId — the custom raster style has no "water" layer to insert before.
    map.addLayer({
      id: "accuracy-fill",
      type: "fill",
      source: "accuracy-circle",
      paint: {
        "fill-color": "#4A90E2",
        "fill-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          0.25,
          16,
          0.1,
        ],
      },
    });

    // Border layer (outline)
    map.addLayer({
      id: "accuracy-border",
      type: "line",
      source: "accuracy-circle",
      paint: {
        "line-color": "#4A90E2",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          1,
          16,
          2,
        ],
        "line-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10,
          0.8,
          16,
          0.4,
        ],
      },
    });
  }
}

// ─── Remove Accuracy Circle ───────────────────────────────────────────────────
/**
 * Cleans up accuracy circle visualization from the map.
 */
export function removeAccuracyCircle(map: mapboxgl.Map) {
  if (!(map as { style?: unknown }).style) return;
  if (map.getLayer("accuracy-fill")) map.removeLayer("accuracy-fill");
  if (map.getLayer("accuracy-border")) map.removeLayer("accuracy-border");
  if (map.getSource("accuracy-circle")) map.removeSource("accuracy-circle");
}

// ─── Get Current Position (High Accuracy) ────────────────────────────────────
/**
 * Requests user's current position with high accuracy settings.
 * Enables GPS over WiFi/IP, never uses cached data.
 *
 * @returns Promise that resolves with position or rejects with error
 */
export function getCurrentPositionHighAccuracy(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: "UNKNOWN",
        message: "Geolocation is not supported by this browser.",
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 1000,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let code: GeolocationError["code"] = "UNKNOWN";
        let message = "Unknown geolocation error.";

        if (error.code === error.PERMISSION_DENIED) {
          code = "PERMISSION_DENIED";
          message = "Location access denied. Enable it in browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          code = "POSITION_UNAVAILABLE";
          message =
            "Location unavailable. Try moving outdoors or enabling GPS.";
        } else if (error.code === error.TIMEOUT) {
          code = "TIMEOUT";
          message = "Location request timed out. Retrying...";
        }

        reject({ code, message } as GeolocationError);
      },
      {
        enableHighAccuracy: true, // Use GPS over WiFi/IP — most important flag!
        timeout: 10000, // 10 seconds — reasonable for GPS lock
        maximumAge: 0, // Never use cached position
      }
    );
  });
}

// ─── Get Current Position (Low Accuracy Fallback) ─────────────────────────────
/**
 * Fallback geolocation using WiFi/IP only.
 * Used when GPS times out — better a coarse position than nothing.
 *
 * @returns Promise that resolves with position or rejects with error
 */
export function getCurrentPositionLowAccuracy(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: "UNKNOWN",
        message: "Geolocation is not supported by this browser.",
      } as GeolocationError);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy || 2000,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let code: GeolocationError["code"] = "UNKNOWN";
        const message = "Could not determine location.";

        if (error.code === error.PERMISSION_DENIED) {
          code = "PERMISSION_DENIED";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          code = "POSITION_UNAVAILABLE";
        } else if (error.code === error.TIMEOUT) {
          code = "TIMEOUT";
        }

        reject({ code, message } as GeolocationError);
      },
      {
        enableHighAccuracy: false, // Use WiFi/IP only — faster
        timeout: 8000,
        maximumAge: 30000, // Allow 30s old cached data
      }
    );
  });
}

// ─── Fly to Position with Accuracy Handling ──────────────────────────────────
/**
 * Animates map to position, using accuracy to determine zoom level.
 * Draws accuracy circle to show confidence radius.
 */
export function flyToPosition(
  map: mapboxgl.Map,
  lat: number,
  lng: number,
  accuracyMetres: number,
  options?: {
    duration?: number;
    drawCircle?: boolean;
  }
) {
  const zoomLevel = getZoomForAccuracy(accuracyMetres);
  const duration = options?.duration ?? 2000;
  const drawCircle = options?.drawCircle !== false;

  // Fly the camera
  map.flyTo({
    center: [lng, lat],
    zoom: zoomLevel,
    duration,
    essential: true,
  });

  // Draw accuracy radius circle
  if (drawCircle) {
    drawAccuracyCircle(map, lat, lng, accuracyMetres);
  }
}

// ─── Watch Position with Accuracy ─────────────────────────────────────────────
/**
 * Continuously watches user position with high accuracy.
 * Calls callbacks on success, error, or accuracy threshold reached.
 *
 * @returns Watch ID for cleanup with clearWatch()
 */
export function watchPositionHighAccuracy(
  onSuccess: (result: GeolocationResult) => void,
  onError: (error: GeolocationError) => void,
  onAccuracyThreshold?: (result: GeolocationResult) => void
): number {
  const ACCURACY_THRESHOLD = 30; // metres

  return navigator.geolocation.watchPosition(
    (position) => {
      const result: GeolocationResult = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy || 1000,
        timestamp: position.timestamp,
      };

      onSuccess(result);

      if (
        onAccuracyThreshold &&
        result.accuracy <= ACCURACY_THRESHOLD
      ) {
        onAccuracyThreshold(result);
      }
    },
    (error) => {
      let code: GeolocationError["code"] = "UNKNOWN";
      let message = "Geolocation error.";

      if (error.code === error.PERMISSION_DENIED) {
        code = "PERMISSION_DENIED";
        message = "Location access denied.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        code = "POSITION_UNAVAILABLE";
        message = "Location unavailable.";
      } else if (error.code === error.TIMEOUT) {
        code = "TIMEOUT";
        message = "Location request timed out.";
      }

      onError({ code, message });
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
}

// ─── Handle Geolocation Error with Fallback ──────────────────────────────────
/**
 * Intelligent error handler that retries with lower accuracy on timeout.
 * Shows user-friendly toast messages.
 *
 * @param error - The geolocation error
 * @param onRetrySuccess - Callback when retry succeeds
 * @param onRetryFailure - Callback when retry fails
 */
export async function handleGeolocationErrorWithRetry(
  error: GeolocationError,
  onRetrySuccess?: (result: GeolocationResult) => void,
  onRetryFailure?: (error: GeolocationError) => void
) {
  // Handle each error type
  if (error.code === "PERMISSION_DENIED") {
    // User blocked — no retry possible
    return error;
  }

  if (error.code === "POSITION_UNAVAILABLE") {
    // GPS/WiFi both failed — suggest moving outdoors
    return error;
  }

  if (error.code === "TIMEOUT") {
    // GPS took too long — retry with lower accuracy
    try {
      const result = await getCurrentPositionLowAccuracy();
      onRetrySuccess?.(result);
      return result;
    } catch (retryError) {
      onRetryFailure?.(
        retryError instanceof Object && "code" in retryError
          ? (retryError as GeolocationError)
          : { code: "UNKNOWN", message: "Retry failed." }
      );
      return retryError;
    }
  }

  return error;
}
