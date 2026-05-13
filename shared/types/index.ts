export interface Property {
  id: string;
  title: string;
  type: "house" | "site"  | "agriculture land" | "commercial space" | "apartment" | "commercial plots" ;
  price: string;
  size: string;
  lat: number;
  lng: number;
  district: string;
  images?: string[];
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


export interface MapViewState {
  zoom: number;
  center: [number, number];
  activeDistrict: string | null;
}

export type PropertyType = Property["type"];
