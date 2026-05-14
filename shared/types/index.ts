export interface Property {
  id: string;
  title: string;
  type: "house" | "site" | "agriculture land" | "commercial space" | "apartment" | "commercial plots";
  price: string;
  size: string;
  lat: number;
  lng: number;
  district: string;
  images?: string[];
}

export interface District {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
}

export interface City {
  name: string;
  lat: number;
  lng: number;
}

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  displayOrder: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: "buyer" | "agent" | "admin";
  createdAt?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface MapViewState {
  zoom: number;
  center: [number, number];
  activeDistrict: string | null;
}

export type PropertyType = Property["type"];
