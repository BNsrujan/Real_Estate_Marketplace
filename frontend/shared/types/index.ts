// ─── Enums / Union Types ────────────────────────────────────────────────────

export type LayerType = 'satellite' | 'streets' | 'outdoors' | 'light' | 'dark' | 'satelliteStreets';

export type SidebarTab = 'explorer' | 'search' | 'saved' | 'messages';

export type MobilePanel = 'map' | 'search' | 'saved' | 'profile';

export type PropertyType =
  | 'house'
  | 'apartment'
  | 'villa'
  | 'site'
  | 'plot'
  | 'agriculture'
  | 'commercial_space'
  | 'commercial_plot';

export type ListingType = 'sale' | 'rent' | 'both';

export type PropertyStatus = 'active' | 'sold' | 'rented';

export type AreaUnit = 'sqft' | 'acres' | 'guntas';

export type UserRole = 'buyer' | 'seller' | 'agent' | 'admin';

export type AmenityCategory = 'infrastructure' | 'convenience' | 'safety' | 'nature' | 'nearby';

export type BlogStatus = 'draft' | 'published' | 'archived';

export type PendingAction = {
  type: 'SAVE_PROPERTY' | 'CONTACT_SELLER' | 'VIEW_PROPERTY' | 'SUBMIT_ENQUIRY';
  payload: Record<string, unknown>;
};

// ─── Amenity ─────────────────────────────────────────────────────────────────

export interface Amenity {
  id: string;
  name: string;
  icon: string | null;
  category: AmenityCategory | null;
  isCustom: boolean;
}

// ─── Property Images & Geometry ──────────────────────────────────────────────

export interface PropertyImage {
  id: string;
  url: string;
  alt: string;
  displayOrder: number;
  isCover: boolean;
  width: number | null;
  height: number | null;
}

export interface PropertyGeometry {
  id: string;
  type: 'point' | 'linestring' | 'polygon';
  geojson: Record<string, unknown>;
}

// ─── Property Child Details ───────────────────────────────────────────────────

export interface PropertyResidentialDetails {
  bhkLabel: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number | null;
  floors: number | null;
  floorNumber: number | null;
  furnishedStatus: string | null;
}

export interface PropertyRoadInfo {
  roadWidth: string | null;
  roadType: string | null;
  roadFacing: boolean | null;
}

export interface PropertyAgricultureDetails {
  waterSource: string | null;
  soilType: string | null;
  surveyNumber: string | null;
}

// ─── Domain Models ───────────────────────────────────────────────────────────

export interface PropertyFeature {
  key: string;
  value: string;
}

export interface Property {
  id: string;
  propertyRef: string | null;
  slug: string;
  title: string;
  type: PropertyType;
  priceLabel: string;
  priceValue: string;
  expectedPrice: string | null;
  sizeLabel: string;
  sizeValue: string | null;
  areaUnit: AreaUnit;
  lat: string;
  lng: string;
  listingType: ListingType;
  status: PropertyStatus;
  isActive: boolean;
  thumbnailUrl: string | null;
  images: PropertyImage[];
  imageUrls: string[];
  description: string;
  features: PropertyFeature[];
  facing: string | null;
  siteDimensions: string | null;
  landUse: string | null;
  documentStatus: string | null;
  condition: string | null;
  contactNumber: string | null;
  roadAccess: boolean;
  isFeatured: boolean;
  address: string | null;
  sellerId: string | null;
  city: string;
  taluk: string;
  districtName: string;
  districtState: string;
  districtId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyDetail extends Property {
  residentialDetails: PropertyResidentialDetails | null;
  roadInfo: PropertyRoadInfo | null;
  agricultureDetails: PropertyAgricultureDetails | null;
  amenities: Amenity[];
  geometries: PropertyGeometry[];
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
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

// ─── Enquiry ──────────────────────────────────────────────────────────────────

export interface Enquiry {
  id: string;
  propertyId: string;
  buyerId: string;
  message: string;
  phone: string | null;
  status: 'pending' | 'replied' | 'closed';
  createdAt: string;
}

export interface EnquiryWithProperty extends Enquiry {
  propertyTitle: string;
  propertySlug: string;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export interface BlogPostCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  status: BlogStatus;
  authorId: string | null;
  authorName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostDetail extends BlogPostCard {
  body: string | null;
  tags: BlogTag[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  activeCount: number;
  soldCount: number;
  rentedCount: number;
  enquiryCount: number;
}

// ─── City (legacy) ────────────────────────────────────────────────────────────

export interface City {
  name: string;
  lat: number;
  lng: number;
}
