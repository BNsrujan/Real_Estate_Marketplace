// Map center: geographic center of India
export const MAP_CENTER: [number, number] = [78.9629, 22.5937];

export const MAP_CONFIG = {
  center: MAP_CENTER,
  zoom: 2,
  minZoom: 1,
  maxZoom: 18, // Increased to 18 for house-level zoom
} as const;

// Rotation pauses when zoomed in to India level (~zoom 4)
export const ROTATION_CONFIG = {
  speed: 0.02,
  pauseAtZoom: 4,
} as const;

// Title fades out once the user zooms past globe view
export const TITLE_FADE_ZOOM = 3;

export const TILE_SOURCES = {
  // ArcGIS satellite imagery — works without API key
  satellite: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    ] as string[],
    tileSize: 256,
    maxzoom: 19,
    attribution: "© Esri",
  },

  // ArcGIS road/transportation overlay — transparent PNG on top of satellite
  roads: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}",
    ] as string[],
    tileSize: 256,
    maxzoom: 19,
    attribution: "© Esri",
  },

  // ArcGIS place labels overlay — city names, POI labels on transparent PNG
  labels: {
    type: "raster" as const,
    tiles: [
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    ] as string[],
    tileSize: 256,
    maxzoom: 19,
    attribution: "© Esri",
  },
};

export interface Property {
  title: string;
  type: string;
  price: string;
  size: string;
  lat: number;
  lng: number;
}
