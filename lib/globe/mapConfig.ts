export const MAP_CENTER: [number, number] = [78.9629, 22.5937];
export const MAP_CONFIG = {
  center: MAP_CENTER,
  zoom: 2.5,
  minZoom: 2.3,
  maxZoom: 18,
};

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
};

export interface Property {
  title: string;
  type: string;
  price: string;
  size: string;
  lat: number;
  lng: number;
}
