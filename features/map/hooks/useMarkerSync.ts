// "use client";

// import { useEffect, useRef, useCallback } from "react";
// import maplibregl from "maplibre-gl";

// import { addPropertyMarkers } from "@/components/map/PropertyMarkers";
// import type { Property } from "@/types";
// import rawData from "@/public/data/properties.json";
// const MARKER_MIN_ZOOM = 5.5;
// const MARKER_MAX_ZOOM = 16;
// const DISTRICT_ZOOM = 11;

// interface UseMarkerSyncOptions {
//   mapRef: React.RefObject<maplibregl.Map | null>;
//   isStyleLoaded: boolean;
//   onMarkerClick?: (property: Property) => void;
// }

// export function useMarkerSync({
//   mapRef,
//   isStyleLoaded,
//   onMarkerClick,
// }: UseMarkerSyncOptions) {
//   const markersRef = useRef<maplibregl.Marker[]>([]);
//   const propertiesRef = useRef<Property[]>([]);

//   const markerModeRef = useRef<"all" | "filtered" | null>(null);
//   const cameFromDistrictRef = useRef(false);
//   const blockMarkerRenderRef = useRef(false);

//   // Always-fresh refs — avoids stale closures inside marker DOM handlers
//   const onMarkerClickRef = useRef(onMarkerClick);
//   onMarkerClickRef.current = onMarkerClick;

//   const filterByDistrictRef = useRef<(name: string) => void>(() => {});
//   useEffect(() => {
//     const source = Array.isArray(rawData) ? rawData : [];
//     propertiesRef.current = source
//       .map((p, i) => ({
//         id: String(i),
//         ...p,
//         type:
//           p.type === "site"
//             ? "land"
//             : (p.type as "house" | "land" | "apartment" | "commercial"),
//       }))
//       .filter(
//         (p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)),
//       );
//   }, []);

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const clearMarkers = useCallback(() => {
//     markersRef.current.forEach((m) => m.remove());
//     markersRef.current = [];
//   }, []);

//   const placeMarkers = useCallback(
//     (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
//       // if (blockMarkerRenderRef.current) return;
//       const zoom = map.getZoom();
//       // if (zoom < MARKER_MIN_ZOOM || zoom > MARKER_MAX_ZOOM) return;
//       if (zoom < MARKER_MIN_ZOOM) return;
//       clearMarkers();

//       // markersRef.current = addPropertyMarkers(map, data, (prop) => {
//       //   // ① Fire popup FIRST — before anything clears markers
//       //   onMarkerClickRef.current?.(prop);

//       //   // ② Then filter district with a small delay so popup state is committed
//       //   setTimeout(() => {
//       //     filterByDistrictRef.current(prop.district);
//       //   }, 80);
//       // });

//       markersRef.current = addPropertyMarkers(map, data, (prop) => {
//         const openPopup = () => onMarkerClickRef.current?.(prop);
//         if (map.isMoving()) {
//           map.once("moveend", openPopup);
//         } else {
//           openPopup();
//         }
//       });
//       markerModeRef.current = mode;
//     },
//     [clearMarkers],
//   );

//   // ── filterByDistrict ──────────────────────────────────────────────────────
//   const filterByDistrict = useCallback(
//     (districtName: string) => {
//       const map = mapRef.current;
//       if (!map) return;

//       markerModeRef.current = "filtered";
//       cameFromDistrictRef.current = true;

//       const filtered = propertiesRef.current.filter(
//         (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
//       );

//       // Fly to district center
//       const features = map.querySourceFeatures("district-centers");
//       const match = features.find(
//         (f) =>
//           f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
//       );
//       clearMarkers();

//       if (match) {
//         map.flyTo({
//           center: (match.geometry as GeoJSON.Point).coordinates as [
//             number,
//             number,
//           ],
//           zoom: DISTRICT_ZOOM,
//           speed: 0.75,
//         });

//         // Place filtered markers once flight lands
//         map.once("moveend", () => {
//           placeMarkers(map, filtered, "filtered");
//         });
//       } else {
//         blockMarkerRenderRef.current = false;
//         placeMarkers(map, filtered, "filtered");
//       }
//     },
//     [mapRef, clearMarkers, placeMarkers],
//   );

//   filterByDistrictRef.current = filterByDistrict;

//   // ── Zoom listener ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || !isStyleLoaded) return;

//     // Ensure markers appear even when no new zoom event fires.
//     if (
//       map.getZoom() >= MARKER_MIN_ZOOM &&
//       markerModeRef.current !== "all" &&
//       propertiesRef.current.length > 0
//     ) {
//       placeMarkers(map, propertiesRef.current, "all");
//     }

//     const onZoom = () => {
//       const zoom = map.getZoom();

//       if (zoom < MARKER_MIN_ZOOM) {
//         blockMarkerRenderRef.current = true;
//         clearMarkers();
//         markerModeRef.current = null;
//         cameFromDistrictRef.current = false;
//         return;
//       }

//       if (zoom >= MARKER_MIN_ZOOM && zoom <= MARKER_MAX_ZOOM) {
//         blockMarkerRenderRef.current = false;

//         if (
//           !cameFromDistrictRef.current &&
//           markerModeRef.current !== "all" &&
//           propertiesRef.current.length > 0
//         ) {
//           placeMarkers(map, propertiesRef.current, "all");
//         }
//       }
//     };

//     map.on("zoom", onZoom);
//     return () => {
//       map.off("zoom", onZoom);
//     };
//   }, [isStyleLoaded, clearMarkers, placeMarkers]);

//   return { filterByDistrict };
// }

// "use client";

// import { useEffect, useRef, useCallback } from "react";
// import maplibregl from "maplibre-gl";

// import { addPropertyMarkers } from "@/components/map/PropertyMarkers";
// import type { Property } from "@/types";
// import rawData from "@/public/data/properties.json";
// import districtCenters from "@/public/data/district-centers.json";

// const MARKER_MIN_ZOOM = 5.5;
// const MARKER_MAX_ZOOM = 16;
// const DISTRICT_ZOOM = 11;

// interface UseMarkerSyncOptions {
//   mapRef: React.RefObject<maplibregl.Map | null>;
//   isStyleLoaded: boolean;
//   onMarkerClick?: (property: Property) => void;
// }

// export function useMarkerSync({
//   mapRef,
//   isStyleLoaded,
//   onMarkerClick,
// }: UseMarkerSyncOptions) {
//   const markersRef = useRef<maplibregl.Marker[]>([]);
//   const propertiesRef = useRef<Property[]>([]);

//   const markerModeRef = useRef<"all" | "filtered" | null>(null);
//   const cameFromDistrictRef = useRef(false);
//   const blockMarkerRenderRef = useRef(false);

//   // Always-fresh refs — avoids stale closures inside marker DOM handlers
//   const onMarkerClickRef = useRef(onMarkerClick);
//   onMarkerClickRef.current = onMarkerClick;

//   const filterByDistrictRef = useRef<(name: string) => void>(() => {});
//   useEffect(() => {
//     propertiesRef.current = rawData.map((p, i) => ({
//       id: String(i),
//       ...p,

//       type:
//         p.type === "site"
//           ? "land"
//           : (p.type as "house" | "land" | "apartment" | "commercial"),
//     }));
//   }, []);

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const clearMarkers = useCallback(() => {
//     markersRef.current.forEach((m) => m.remove());
//     markersRef.current = [];
//   }, []);

//   const placeMarkers = useCallback(
//     (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
//       // if (blockMarkerRenderRef.current) return;
//       const zoom = map.getZoom();
//       // if (zoom < MARKER_MIN_ZOOM || zoom > MARKER_MAX_ZOOM) return;
//       if (zoom < MARKER_MIN_ZOOM) return;
//       clearMarkers();

//       // markersRef.current = addPropertyMarkers(map, data, (prop) => {
//       //   // ① Fire popup FIRST — before anything clears markers
//       //   onMarkerClickRef.current?.(prop);

//       //   // ② Then filter district with a small delay so popup state is committed
//       //   setTimeout(() => {
//       //     filterByDistrictRef.current(prop.district);
//       //   }, 80);
//       // });

//       markersRef.current = addPropertyMarkers(map, data, (prop) => {
//         onMarkerClickRef.current?.(prop);
//       });
//       markerModeRef.current = mode;
//     },
//     [clearMarkers],
//   );

//   // ── filterByDistrict ──────────────────────────────────────────────────────
//   // const filterByDistrict = useCallback(
//   //   (districtName: string) => {
//   //     const map = mapRef.current;
//   //     if (!map) return;

//   //     markerModeRef.current = "filtered";
//   //     cameFromDistrictRef.current = true;

//   //     const filtered = propertiesRef.current.filter(
//   //       (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
//   //     );

//   //     // Fly to district center
//   //     const features = map.querySourceFeatures("district-centers");
//   //     const match = features.find(
//   //       (f) =>
//   //         f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
//   //     );
//   //     clearMarkers();

//   //     if (match) {
//   //       map.flyTo({
//   //         center: (match.geometry as GeoJSON.Point).coordinates as [
//   //           number,
//   //           number,
//   //         ],
//   //         zoom: DISTRICT_ZOOM,
//   //         speed: 0.75,
//   //       });

//   //       // Place filtered markers once flight lands
//   //       map.once("moveend", () => {
//   //         placeMarkers(map, filtered, "filtered");
//   //       });
//   //     } else {
//   //       blockMarkerRenderRef.current = false;
//   //       placeMarkers(map, filtered, "filtered");
//   //     }
//   //   },
//   //   [mapRef, clearMarkers, placeMarkers],
//   // );
//   const filterByDistrict = useCallback(
//   (districtName: string) => {
//     const map = mapRef.current;
//     if (!map) return;

//     markerModeRef.current = "filtered";
//     cameFromDistrictRef.current = true;

//     const filtered = propertiesRef.current.filter(
//       (p) => p.district?.toLowerCase() === districtName.toLowerCase()
//     );

//     clearMarkers();

//     // ✅ Use your JSON directly (FIX)
//     const match = districtCenters.features.find(
//       (f) =>
//         f.properties.NAME_2.toLowerCase() === districtName.toLowerCase()
//     );

//     if (match) {
//       const [lng, lat] = match.geometry.coordinates;

//       map.flyTo({
//         center: [lng, lat],
//         zoom: DISTRICT_ZOOM, // 11
//         speed: 0.8,
//       });

//       // ✅ Place markers after zoom
//       map.once("moveend", () => {
//         placeMarkers(map, filtered, "filtered");
//       });
//     } else {
//       // fallback
//       placeMarkers(map, filtered, "filtered");
//     }
//   },
//   [mapRef, clearMarkers, placeMarkers]
// );

//   filterByDistrictRef.current = filterByDistrict;

//   // ── Zoom listener ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || !isStyleLoaded) return;

//     const onZoom = () => {
//       const zoom = map.getZoom();

//       if (zoom < MARKER_MIN_ZOOM) {
//         blockMarkerRenderRef.current = true;
//         clearMarkers();
//         markerModeRef.current = null;
//         cameFromDistrictRef.current = false;
//         return;
//       }

//       if (zoom >= MARKER_MIN_ZOOM && zoom <= MARKER_MAX_ZOOM) {
//         blockMarkerRenderRef.current = false;

//         if (
//           !cameFromDistrictRef.current &&
//           markerModeRef.current !== "all" &&
//           propertiesRef.current.length > 0
//         ) {
//           placeMarkers(map, propertiesRef.current, "all");
//         }
//       }
//     };

//     map.on("zoom", onZoom);
//     return () => {
//       map.off("zoom", onZoom);
//     };
//   }, [isStyleLoaded, clearMarkers, placeMarkers]);

//   return { filterByDistrict };
// }
// "use client";

// import { useEffect, useRef, useCallback } from "react";
// import maplibregl from "maplibre-gl";

// import { addPropertyMarkers } from "@/components/map/PropertyMarkers";
// import type { Property } from "@/types";
// import rawData from "@/public/data/properties.json";
// const MARKER_MIN_ZOOM = 5.5;
// const MARKER_MAX_ZOOM = 16;
// const DISTRICT_ZOOM = 11;

// interface UseMarkerSyncOptions {
//   mapRef: React.RefObject<maplibregl.Map | null>;
//   isStyleLoaded: boolean;
//   onMarkerClick?: (property: Property) => void;
// }

// export function useMarkerSync({
//   mapRef,
//   isStyleLoaded,
//   onMarkerClick,
// }: UseMarkerSyncOptions) {
//   const markersRef = useRef<maplibregl.Marker[]>([]);
//   const propertiesRef = useRef<Property[]>([]);

//   const markerModeRef = useRef<"all" | "filtered" | null>(null);
//   const cameFromDistrictRef = useRef(false);
//   const blockMarkerRenderRef = useRef(false);

//   // Always-fresh refs — avoids stale closures inside marker DOM handlers
//   const onMarkerClickRef = useRef(onMarkerClick);
//   onMarkerClickRef.current = onMarkerClick;

//   const filterByDistrictRef = useRef<(name: string) => void>(() => {});
//   useEffect(() => {
//     propertiesRef.current = rawData.map((p, i) => ({
//       id: String(i),
//       ...p,

//       type:
//         p.type === "site"
//           ? "land"
//           : (p.type as "house" | "land" | "apartment" | "commercial"),
//     }));
//   }, []);

//   // ── Helpers ───────────────────────────────────────────────────────────────
//   const clearMarkers = useCallback(() => {
//     markersRef.current.forEach((m) => m.remove());
//     markersRef.current = [];
//   }, []);

//   const placeMarkers = useCallback(
//     (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
//       // if (blockMarkerRenderRef.current) return;
//       const zoom = map.getZoom();
//       // if (zoom < MARKER_MIN_ZOOM || zoom > MARKER_MAX_ZOOM) return;
//       if (zoom < MARKER_MIN_ZOOM) return;
//       clearMarkers();

//       // markersRef.current = addPropertyMarkers(map, data, (prop) => {
//       //   // ① Fire popup FIRST — before anything clears markers
//       //   onMarkerClickRef.current?.(prop);

//       //   // ② Then filter district with a small delay so popup state is committed
//       //   setTimeout(() => {
//       //     filterByDistrictRef.current(prop.district);
//       //   }, 80);
//       // });

//       markersRef.current = addPropertyMarkers(map, data, (prop) => {
//         onMarkerClickRef.current?.(prop);
//       });
//       markerModeRef.current = mode;
//     },
//     [clearMarkers],
//   );

//   // ── filterByDistrict ──────────────────────────────────────────────────────
//   const filterByDistrict = useCallback(
//     (districtName: string) => {
//       const map = mapRef.current;
//       if (!map) return;

//       markerModeRef.current = "filtered";
//       cameFromDistrictRef.current = true;

//       const filtered = propertiesRef.current.filter(
//         (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
//       );

//       // Fly to district center
//       const features = map.querySourceFeatures("district-centers");
//       const match = features.find(
//         (f) =>
//           f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
//       );
//       clearMarkers();

//       if (match) {
//         map.flyTo({
//           center: (match.geometry as GeoJSON.Point).coordinates as [
//             number,
//             number,
//           ],
//           zoom: DISTRICT_ZOOM,
//           speed: 0.75,
//         });

//         // Place filtered markers once flight lands
//         map.once("moveend", () => {
//           placeMarkers(map, filtered, "filtered");
//         });
//       } else {
//         blockMarkerRenderRef.current = false;
//         placeMarkers(map, filtered, "filtered");
//       }
//     },
//     [mapRef, clearMarkers, placeMarkers],
//   );

//   filterByDistrictRef.current = filterByDistrict;

//   // ── Zoom listener ─────────────────────────────────────────────────────────
//   useEffect(() => {
//     const map = mapRef.current;
//     if (!map || !isStyleLoaded) return;

//     const onZoom = () => {
//       const zoom = map.getZoom();

//       if (zoom < MARKER_MIN_ZOOM) {
//         blockMarkerRenderRef.current = true;
//         clearMarkers();
//         markerModeRef.current = null;
//         cameFromDistrictRef.current = false;
//         return;
//       }

//       if (zoom >= MARKER_MIN_ZOOM && zoom <= MARKER_MAX_ZOOM) {
//         blockMarkerRenderRef.current = false;

//         if (
//           !cameFromDistrictRef.current &&
//           markerModeRef.current !== "all" &&
//           propertiesRef.current.length > 0
//         ) {
//           placeMarkers(map, propertiesRef.current, "all");
//         }
//       }
//     };

//     map.on("zoom", onZoom);
//     return () => {
//       map.off("zoom", onZoom);
//     };
//   }, [isStyleLoaded, clearMarkers, placeMarkers]);

//   return { filterByDistrict };
// }

"use client";

import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";

import { addPropertyMarkers } from "@/components/map/PropertyMarkers";
import type { Property } from "@/types";
import rawData from "@/public/data/properties.json";
const MARKER_MIN_ZOOM = 5.5;
const MARKER_MAX_ZOOM = 16;
const DISTRICT_ZOOM = 11;

interface UseMarkerSyncOptions {
  mapRef: React.RefObject<maplibregl.Map | null>;
  isStyleLoaded: boolean;
  onMarkerClick?: (property: Property) => void;
}

export function useMarkerSync({
  mapRef,
  isStyleLoaded,
  onMarkerClick,
}: UseMarkerSyncOptions) {
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const propertiesRef = useRef<Property[]>([]);

  const markerModeRef = useRef<"all" | "filtered" | null>(null);
  const cameFromDistrictRef = useRef(false);
  const blockMarkerRenderRef = useRef(false);

  // Always-fresh refs — avoids stale closures inside marker DOM handlers
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const filterByDistrictRef = useRef<(name: string) => void>(() => {});
  useEffect(() => {
    propertiesRef.current = rawData.map((p, i) => ({
      id: String(i),
      ...p,

      type:
        p.type === "site"
          ? "land"
          : (p.type as "house" | "land" | "apartment" | "commercial"),
    }));
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const placeMarkers = useCallback(
    (map: maplibregl.Map, data: Property[], mode: "all" | "filtered") => {
      // if (blockMarkerRenderRef.current) return;
      const zoom = map.getZoom();
      // if (zoom < MARKER_MIN_ZOOM || zoom > MARKER_MAX_ZOOM) return;
      if (zoom < MARKER_MIN_ZOOM) return;
      clearMarkers();

      // markersRef.current = addPropertyMarkers(map, data, (prop) => {
      //   // ① Fire popup FIRST — before anything clears markers
      //   onMarkerClickRef.current?.(prop);

      //   // ② Then filter district with a small delay so popup state is committed
      //   setTimeout(() => {
      //     filterByDistrictRef.current(prop.district);
      //   }, 80);
      // });

      markersRef.current = addPropertyMarkers(map, data, (prop) => {
        onMarkerClickRef.current?.(prop);
      });
      markerModeRef.current = mode;
    },
    [clearMarkers],
  );

  // ── filterByDistrict ──────────────────────────────────────────────────────
  const filterByDistrict = useCallback(
    (districtName: string) => {
      const map = mapRef.current;
      if (!map) return;

      markerModeRef.current = "filtered";
      cameFromDistrictRef.current = true;

      const filtered = propertiesRef.current.filter(
        (p) => p.district?.toLowerCase() === districtName.toLowerCase(),
      );

      // Fly to district center
      const features = map.querySourceFeatures("district-centers");
      const match = features.find(
        (f) =>
          f.properties?.NAME_2?.toLowerCase() === districtName.toLowerCase(),
      );
      clearMarkers();

      if (match) {
        map.flyTo({
          center: (match.geometry as GeoJSON.Point).coordinates as [
            number,
            number,
          ],
          zoom: DISTRICT_ZOOM,
          speed: 0.75,
        });

        // Place filtered markers once flight lands
        map.once("moveend", () => {
          placeMarkers(map, filtered, "filtered");
        });
      } else {
        blockMarkerRenderRef.current = false;
        placeMarkers(map, filtered, "filtered");
      }
    },
    [mapRef, clearMarkers, placeMarkers],
  );

  filterByDistrictRef.current = filterByDistrict;

  // ── Zoom listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isStyleLoaded) return;

    const onZoom = () => {
      const zoom = map.getZoom();

      if (zoom < MARKER_MIN_ZOOM) {
        blockMarkerRenderRef.current = true;
        clearMarkers();
        markerModeRef.current = null;
        cameFromDistrictRef.current = false;
        return;
      }

      if (zoom >= MARKER_MIN_ZOOM && zoom <= MARKER_MAX_ZOOM) {
        blockMarkerRenderRef.current = false;

        if (
          !cameFromDistrictRef.current &&
          markerModeRef.current !== "all" &&
          propertiesRef.current.length > 0
        ) {
          placeMarkers(map, propertiesRef.current, "all");
        }
      }
    };

    map.on("zoom", onZoom);
    return () => {
      map.off("zoom", onZoom);
    };
  }, [isStyleLoaded, clearMarkers, placeMarkers]);

  return { filterByDistrict };
}
