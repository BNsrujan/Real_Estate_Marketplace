import { apiService } from '@/shared/services/api.service';
import { notifyAuthRestored } from '@/shared/services/api.service';
import type { UserProfile, ApiResponse, Property } from '@/shared/types';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendUser {
  id: string;
  username: string;
  name?: string | null;
  email: string;
  phone?: string;
  role: UserProfile['role'];
  isVerified?: boolean;
  isPro?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
}

// Tokens are now in the httpOnly auth_session cookie — response body carries user only
interface AuthResponse {
  data: { user: BackendUser };
}

interface BackendWatchlistItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  priceValue: string;
  priceLabel: string;
  sizeValue: string;
  areaUnit?: string;
  thumbnailUrl?: string;
  lat: string;
  lng: string;
  listingType: string;
  districtName: string | null;
  city?: string;
  taluk?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapBackendUser(u: BackendUser): UserProfile {
  return {
    id: u.id,
    username: u.username,
    name: u.name ?? u.username,
    email: u.email,
    phone: u.phone ?? '',
    role: u.role,
    isVerified: u.isVerified ?? false,
    isPro: u.isPro ?? false,
    avatarUrl: u.avatarUrl ?? null,
    createdAt: u.createdAt,
  };
}

function mapWatchlistItem(item: BackendWatchlistItem): Property {
  return {
    id: item.id,
    propertyRef: null,
    slug: item.slug ?? item.id,
    title: item.title,
    type: normalizePropertyType(item.type),
    priceLabel: item.priceLabel,
    priceValue: item.priceValue ?? '0',
    expectedPrice: null,
    sizeLabel: item.sizeValue ?? '',
    sizeValue: item.sizeValue ?? null,
    areaUnit: (item.areaUnit as Property['areaUnit']) ?? 'sqft',
    lat: item.lat ?? '0',
    lng: item.lng ?? '0',
    listingType: (item.listingType as Property['listingType']) ?? 'sale',
    status: 'active',
    isActive: true,
    thumbnailUrl: item.thumbnailUrl ?? null,
    images: [],
    imageUrls: [],
    description: item.description ?? '',
    features: [],
    facing: null,
    siteDimensions: null,
    landUse: null,
    documentStatus: null,
    condition: null,
    contactNumber: null,
    roadAccess: false,
    isFeatured: false,
    address: null,
    sellerId: null,
    city: item.city ?? '',
    taluk: item.taluk ?? '',
    districtName: item.districtName ?? '',
    districtState: '',
    districtId: '',
    createdAt: item.createdAt ?? '',
    updatedAt: item.updatedAt ?? '',
  };
}

function normalizePropertyType(type: string): Property['type'] {
  const map: Record<string, Property['type']> = {
    'agriculture land': 'agriculture',
    'commercial space': 'commercial_space',
    'commercial plots': 'commercial_plot',
    'commercial_space': 'commercial_space',
    'commercial_plot': 'commercial_plot',
    agriculture: 'agriculture',
    house: 'house',
    site: 'site',
    apartment: 'apartment',
  };
  return map[type] ?? 'house';
}

// ─── Token helpers ────────────────────────────────────────────────────────────
// Tokens now live in the httpOnly auth_session cookie managed by the backend.
// These helpers are kept as no-ops so existing callers don't need immediate changes.

export function saveAuthToken(_token: string): void { /* no-op: tokens are in cookie */ }
export function clearAuthToken(): void { /* no-op: backend clears cookie on logout */ }
export function hasAuthToken(): boolean { return false; /* cookie is httpOnly — not readable from JS */ }

export async function logout(): Promise<void> {
  await apiService.post('/api/v1/auth/logout', {});
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export async function register(opts: {
  firstName: string;
  lastName: string;
  mobile: string;
  email: string;
  password: string;
}): Promise<{ user: UserProfile; token: string }> {
  const res = await apiService.post<AuthResponse>('/api/v1/auth/register', {
    firstName: opts.firstName.trim(),
    lastName: opts.lastName.trim(),
    email: opts.email,
    password: opts.password,
    phone: opts.mobile,
  });
  return { user: mapBackendUser(res.data.user), token: '' };
}

export async function googleAuth(
  credential: string,
): Promise<{ user: UserProfile; token: string }> {
  const res = await apiService.post<AuthResponse>('/api/v1/auth/google', { credential });
  return { user: mapBackendUser(res.data.user), token: '' };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: UserProfile; token: string }> {
  const res = await apiService.post<AuthResponse>('/api/v1/auth/login', { email, password });
  notifyAuthRestored();
  return { user: mapBackendUser(res.data.user), token: '' };
}

export async function getProfile(): Promise<UserProfile> {
  const res = await apiService.get<ApiResponse<BackendUser>>(
    '/api/v1/auth/profile',
  );
  return mapBackendUser(res.data);
}

export async function updateProfile(patch: {
  name?: string;
  phone?: string;
  username?: string;
  avatarUrl?: string;
}): Promise<UserProfile> {
  const res = await apiService.patch<ApiResponse<BackendUser>>('/api/v1/auth/profile', patch);
  return mapBackendUser(res.data);
}

// ─── Watchlist API calls ──────────────────────────────────────────────────────

export async function getWatchlist(): Promise<Property[]> {
  const res = await apiService.get<ApiResponse<{ data: BackendWatchlistItem[] }>>(
    '/api/v1/watchlist',
  );
  return res.data.data.map(mapWatchlistItem);
}

export async function saveToWatchlist(propertyId: string): Promise<void> {
  await apiService.post('/api/v1/watchlist', { propertyId });
}

export async function removeFromWatchlist(propertyId: string): Promise<void> {
  await apiService.delete(`/api/v1/watchlist/${propertyId}`);
}

// ─── OTP API calls ────────────────────────────────────────────────────────────

export async function requestOtp(contact: string, type: 'email' | 'phone'): Promise<void> {
  await apiService.post('/api/v1/auth/otp/send', { contact, type });
}

export async function verifyOtp(
  contact: string,
  type: 'email' | 'phone',
  otp: string,
): Promise<{ user: UserProfile; token: string }> {
  const res = await apiService.post<AuthResponse>('/api/v1/auth/otp/verify', { contact, type, otp });
  return { user: mapBackendUser(res.data.user), token: '' };
}
