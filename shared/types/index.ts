// ─── Enums / Union Types ────────────────────────────────────────────────────

export type LayerType = 'standard' | 'satellite' | 'traffic' | 'osm';

export type SidebarTab = 'explorer' | 'search' | 'saved' | 'messages';

export type MobilePanel = 'map' | 'search' | 'saved' | 'profile';

export type PropertyType =
  | 'house'
  | 'site'
  | 'apartment'
  | 'agriculture'
  | 'commercial_space'
  | 'commercial_plot';

export type PendingAction = {
  type: 'SAVE_PROPERTY' | 'CONTACT_SELLER' | 'VIEW_PROPERTY' | 'SUBMIT_ENQUIRY';
  payload: Record<string, unknown>;
};

// ─── Domain Models ───────────────────────────────────────────────────────────

export interface PropertyFeature {
  key: string;
  value: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  price: number;
  priceLabel: string;
  area: number;
  areaUnit: 'sqft' | 'acres' | 'guntas';
  district: string;
  districtId?: string;
  city: string;
  taluk: string;
  lat: number;
  lng: number;
  thumbnailUrl: string;
  imageUrls: string[];
  listingType: 'sale' | 'rent' | 'both';
  isActive: boolean;
  description: string;
  features: PropertyFeature[];
  sellerId?: string;
  updatedAt: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller' | 'agent' | 'admin';
  isVerified: boolean;
  isPro: boolean;
  avatarUrl: string | null;
  createdAt?: string;
}

export interface ApiError {
  code: number;
  message: string;
  retryable: boolean;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
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

export interface FilterState {
  types: PropertyType[];
  priceMin: number | null;
  priceMax: number | null;
  areaMin: number | null;
  areaMax: number | null;
  listingType: 'sale' | 'rent' | 'all';
  activeDistrict: string | null;
  searchQuery: string;
}

export interface GeocoderResult {
  name: string;
  lat: number;
  lng: number;
  type: string;
  fullName: string;
}

export interface ReverseGeocodeResult {
  address: string;
  city: string;
  district: string;
  state: string;
}

export type BBox = [number, number, number, number];
