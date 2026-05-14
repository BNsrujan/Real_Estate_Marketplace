import { apiFetch } from "@/shared/api/client";
import type { Property } from "@/shared/types";

export interface PropertyFilters {
  type?: string;
  district?: string;
  listing?: "sale" | "rent";
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface BackendProperty {
  id: string;
  title: string;
  type: Property["type"];
  priceLabel: string;
  sizeLabel: string;
  lat: string;
  lng: string;
  listingType: "sale" | "rent";
  districtName: string | null;
}

interface PropertiesResponse {
  data: BackendProperty[];
  page: number;
  limit: number;
}

function mapProperty(p: BackendProperty): Property {
  return {
    id: p.id,
    title: p.title,
    type: p.type,
    price: p.priceLabel,
    size: p.sizeLabel,
    lat: Number(p.lat),
    lng: Number(p.lng),
    district: p.districtName ?? "",
  };
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.district) params.set("district", filters.district);
  if (filters.listing) params.set("listing", filters.listing);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));

  const query = params.toString();
  const result = await apiFetch<{ data: PropertiesResponse }>(`/api/v1/properties${query ? `?${query}` : ""}`);
  return result.data.data.map(mapProperty);
}

export async function getPropertyById(id: string): Promise<Property> {
  const result = await apiFetch<{ data: BackendProperty }>(`/api/v1/properties/${id}`);
  return mapProperty(result.data);
}

export async function getPropertiesByDistrict(districtId: string): Promise<Property[]> {
  const result = await apiFetch<{ data: PropertiesResponse }>(`/api/v1/properties/district/${districtId}`);
  return result.data.data.map(mapProperty);
}
