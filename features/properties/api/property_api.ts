import { apiService } from '@/shared/services/api.service';
import type { Property, ApiResponse } from '@/shared/types';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendProperty {
  id: string;
  slug?: string;
  title: string;
  type: string;
  priceValue: string;
  priceLabel: string;
  sizeValue: string;
  sizeLabel?: string;
  areaUnit?: string;
  thumbnailUrl?: string;
  imageUrls?: string[];
  lat: string;
  lng: string;
  listingType: string;
  districtId?: string;
  districtName: string | null;
  city?: string;
  taluk?: string;
  description?: string;
  features?: { key: string; value: string }[];
  sellerId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface PropertiesResponse {
  data: BackendProperty[];
  page: number;
  limit: number;
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function normalizePropertyType(type: string): Property['type'] {
  const map: Record<string, Property['type']> = {
    'agriculture land': 'agriculture',
    'commercial space': 'commercial_space',
    'commercial plots': 'commercial_plot',
    commercial_space: 'commercial_space',
    commercial_plot: 'commercial_plot',
    agriculture: 'agriculture',
    house: 'house',
    site: 'site',
    apartment: 'apartment',
  };
  return map[type] ?? 'house';
}

function mapProperty(p: BackendProperty): Property {
  return {
    id: p.id,
    slug: p.slug ?? p.id,
    title: p.title,
    type: normalizePropertyType(p.type),
    price: Number(p.priceValue) || 0,
    priceLabel: p.priceLabel,
    area: Number(p.sizeValue) || 0,
    areaUnit: (p.areaUnit as Property['areaUnit']) ?? 'sqft',
    district: p.districtName ?? '',
    districtId: p.districtId,
    city: p.city ?? '',
    taluk: p.taluk ?? '',
    lat: Number(p.lat),
    lng: Number(p.lng),
    thumbnailUrl: p.thumbnailUrl ?? '',
    imageUrls: p.imageUrls ?? [],
    listingType: (p.listingType as Property['listingType']) ?? 'sale',
    isActive: p.isActive ?? true,
    description: p.description ?? '',
    features: p.features ?? [],
    sellerId: p.sellerId,
    createdAt: p.createdAt ?? '',
    updatedAt: p.updatedAt ?? '',
  };
}

// ─── Filters ──────────────────────────────────────────────────────────────────

export interface PropertyFilters {
  type?: string;
  district?: string;
  listing?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getProperties(
  filters: PropertyFilters = {},
): Promise<Property[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.district) params.set('district', filters.district);
  if (filters.listing) params.set('listing', filters.listing);
  if (filters.minPrice !== undefined)
    params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set('maxPrice', String(filters.maxPrice));
  if (filters.search) params.set('search', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  const result = await apiService.get<ApiResponse<PropertiesResponse>>(
    `/api/v1/properties${query ? `?${query}` : ''}`,
  );
  return result.data.data.map(mapProperty);
}

export async function getPropertyById(id: string): Promise<Property> {
  const result = await apiService.get<ApiResponse<BackendProperty>>(
    `/api/v1/properties/${id}`,
  );
  return mapProperty(result.data);
}

export async function getPropertiesByDistrict(
  districtId: string,
): Promise<Property[]> {
  const result = await apiService.get<ApiResponse<PropertiesResponse>>(
    `/api/v1/properties/district/${districtId}`,
  );
  return result.data.data.map(mapProperty);
}
