import { apiService } from '@/shared/services/api.service';
import type { Property, PropertyDetail, PropertyImage, ApiResponse } from '@/shared/types';

// ─── Mapper ───────────────────────────────────────────────────────────────────

function normalizePropertyType(type: string): Property['type'] {
  const map: Record<string, Property['type']> = {
    house: 'house',
    apartment: 'apartment',
    villa: 'villa',
    site: 'site',
    plot: 'plot',
    agriculture: 'agriculture',
    commercial_space: 'commercial_space',
    commercial_plot: 'commercial_plot',
    // legacy labels
    'agriculture land': 'agriculture',
    'commercial space': 'commercial_space',
    'commercial plots': 'commercial_plot',
  };
  return map[type] ?? 'house';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProperty(p: any): Property {
  return {
    id: p.id,
    propertyRef: p.propertyRef ?? null,
    slug: p.slug ?? p.id,
    title: p.title,
    type: normalizePropertyType(p.type),
    priceLabel: p.priceLabel,
    priceValue: p.priceValue ?? '0',
    expectedPrice: p.expectedPrice ?? null,
    sizeLabel: p.sizeLabel,
    sizeValue: p.sizeValue ?? null,
    areaUnit: p.areaUnit ?? 'sqft',
    lat: p.lat,
    lng: p.lng,
    listingType: p.listingType ?? 'sale',
    status: p.status ?? 'active',
    isActive: p.isActive ?? p.status === 'active',
    thumbnailUrl: p.thumbnailUrl ?? null,
    images: p.images ?? [],
    imageUrls: p.imageUrls ?? [],
    description: p.description ?? '',
    features: p.features ?? [],
    facing: p.facing ?? null,
    siteDimensions: p.siteDimensions ?? null,
    landUse: p.landUse ?? null,
    documentStatus: p.documentStatus ?? null,
    condition: p.condition ?? null,
    contactNumber: p.contactNumber ?? null,
    roadAccess: p.roadAccess ?? false,
    isFeatured: p.isFeatured ?? false,
    address: p.address ?? null,
    sellerId: p.sellerId ?? null,
    city: p.city ?? '',
    taluk: p.taluk ?? '',
    districtName: p.districtName ?? '',
    districtState: p.districtState ?? '',
    districtId: p.districtId ?? '',
    createdAt: p.createdAt ?? '',
    updatedAt: p.updatedAt ?? '',
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPropertyDetail(p: any): PropertyDetail {
  return {
    ...mapProperty(p),
    residentialDetails: p.residentialDetails ?? null,
    roadInfo: p.roadInfo ?? null,
    agricultureDetails: p.agricultureDetails ?? null,
    amenities: p.amenities ?? [],
    geometries: p.geometries ?? [],
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
  featured?: boolean;
  page?: number;
  limit?: number;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.district) params.set('district', filters.district);
  if (filters.listing) params.set('listing', filters.listing);
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.search) params.set('search', filters.search);
  if (filters.featured) params.set('featured', 'true');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const query = params.toString();
  const result = await apiService.get<ApiResponse<{ data: unknown[] }>>(
    `/api/v1/properties${query ? `?${query}` : ''}`,
  );
  return result.data.data.map(mapProperty);
}

export async function getPropertyBySlug(slug: string): Promise<PropertyDetail> {
  const result = await apiService.get<ApiResponse<unknown>>(`/api/v1/properties/slug/${slug}`);
  return mapPropertyDetail(result.data);
}

export async function getPropertyById(id: string): Promise<PropertyDetail> {
  const result = await apiService.get<ApiResponse<unknown>>(`/api/v1/properties/${id}`);
  return mapPropertyDetail(result.data);
}

export async function getPropertiesByDistrict(districtId: string): Promise<Property[]> {
  const result = await apiService.get<ApiResponse<{ data: unknown[] }>>(
    `/api/v1/properties/district/${districtId}`,
  );
  return result.data.data.map(mapProperty);
}

export async function createProperty(payload: Record<string, unknown>): Promise<PropertyDetail> {
  const result = await apiService.post<ApiResponse<unknown>>('/api/v1/properties', payload);
  return mapPropertyDetail(result.data);
}

export async function updateProperty(
  id: string,
  patch: Record<string, unknown>,
): Promise<PropertyDetail> {
  const result = await apiService.patch<ApiResponse<unknown>>(`/api/v1/properties/${id}`, patch);
  return mapPropertyDetail(result.data);
}

export async function deleteProperty(id: string): Promise<void> {
  await apiService.delete(`/api/v1/properties/${id}`);
}

// ─── Images ───────────────────────────────────────────────────────────────────

export async function uploadPropertyImages(
  propertyId: string,
  urls: { url: string; alt?: string; displayOrder?: number; isCover?: boolean; width?: number; height?: number }[],
): Promise<PropertyImage[]> {
  const result = await apiService.post<ApiResponse<{ data: PropertyImage[] }>>(
    `/api/v1/properties/${propertyId}/images`,
    { urls },
  );
  return result.data.data;
}

export async function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  await apiService.delete(`/api/v1/properties/${propertyId}/images/${imageId}`);
}
