// ── Core domain types ────────────────────────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  type: "house" | "land" | "apartment" | "commercial";
  price: string;
  size: string;
  lat: number;
  lng: number;
  district: string;
}

export interface District {
  name: string;
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  lat: number;
  lng: number;
}

// ── Map state ────────────────────────────────────────────────────────────────

export interface MapViewState {
  zoom: number;
  center: [number, number];
  activeDistrict: string | null;
}

export type PropertyType = Property["type"];
