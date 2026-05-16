export const MAP_CENTER: [number, number] = [78.9629, 24.5937];
export const MAP_CONFIG = {
  center: MAP_CENTER,
  zoom: 2.5,
  minZoom: 2.3,
  maxZoom: 17.4,
};

export function getResponsiveMapConfig() {
  if (typeof window === "undefined") return MAP_CONFIG;

  const w = window.innerWidth;

  if (w < 640) {
    return { center: MAP_CENTER, zoom: 1.3, minZoom: 1.2, maxZoom: 18 };
  }

  if (w < 1024) {
    return { center: MAP_CENTER, zoom: 2.3, minZoom: 1.4, maxZoom: 18 };
  }

  return MAP_CONFIG;
}

export const ROTATION_CONFIG = {
  speed: 0.02,
  pauseAtZoom: 4,
};

export const TITLE_FADE_ZOOM = 3;

export const TILE_SOURCES = {
  satellite: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
  },

  roads: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
  },

  labels: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
  },

  osm: {
    type: "raster" as const,
    tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
    tileSize: 256,
    maxzoom: 19,
    attribution: "© OpenStreetMap contributors",
  },

  topo: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    ],
    tileSize: 256,
    maxzoom: 19,
  },
};

export type LayerPreset = "satellite" | "standard" | "osm" | "traffic";

// Per-preset opacity values for the three base tile layers
export const LAYER_PRESETS: Record<
  LayerPreset,
  { satelliteOpacity: number; roadsOpacity: [number, number, number, number]; labelsOpacity: [number, number, number, number]; baseColor: string }
> = {
  satellite: {
    satelliteOpacity: 1,
    roadsOpacity: [8, 0, 11, 0.9],
    labelsOpacity: [9, 0, 12, 0.95],
    baseColor: "#000000",
  },
  standard: {
    satelliteOpacity: 0,
    roadsOpacity: [6, 0.6, 11, 1],
    labelsOpacity: [7, 0.7, 12, 1],
    baseColor: "#1a1a2e",
  },
  osm: {
    satelliteOpacity: 0,
    roadsOpacity: [6, 0.5, 11, 0.9],
    labelsOpacity: [7, 0.6, 12, 0.95],
    baseColor: "#1b1b2f",
  },
  traffic: {
    satelliteOpacity: 0.6,
    roadsOpacity: [8, 0, 11, 1],
    labelsOpacity: [9, 0, 12, 1],
    baseColor: "#000000",
  },
};

// Property type has moved to types/index.ts — import from there.
export type { Property } from "@/shared/types";
