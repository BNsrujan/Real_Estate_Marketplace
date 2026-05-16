import { apiService } from '@/shared/services/api.service';
import { notifyAuthRestored } from '@/shared/services/api.service';
import type { UserProfile, ApiResponse, Property } from '@/shared/types';

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendUser {
  id: string;
  username: string;
  name?: string;
  email: string;
  phone?: string;
  role: UserProfile['role'];
  isVerified?: boolean;
  isPro?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
}

interface AuthResponse {
  data: { user: BackendUser; token: string };
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
    slug: item.slug ?? item.id,
    title: item.title,
    type: normalizePropertyType(item.type),
    price: Number(item.priceValue) || 0,
    priceLabel: item.priceLabel,
    area: Number(item.sizeValue) || 0,
    areaUnit: (item.areaUnit as Property['areaUnit']) ?? 'sqft',
    district: item.districtName ?? '',
    city: item.city ?? '',
    taluk: item.taluk ?? '',
    lat: Number(item.lat),
    lng: Number(item.lng),
    thumbnailUrl: item.thumbnailUrl ?? '',
    imageUrls: [],
    listingType: (item.listingType as Property['listingType']) ?? 'sale',
    isActive: true,
    description: item.description ?? '',
    features: [],
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

export function saveAuthToken(token: string): void {
  if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
}

export function hasAuthToken(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('auth_token');
}

// ─── Auth API calls ───────────────────────────────────────────────────────────

export async function register(
  username: string,
  email: string,
  password: string,
): Promise<{ user: UserProfile; token: string }> {
  const res = await apiService.post<AuthResponse>('/api/v1/auth/register', {
    username,
    name: username,
    email,
    password,
  });
  const user = mapBackendUser(res.data.user);
  saveAuthToken(res.data.token);
  return { user, token: res.data.token };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: UserProfile; token: string }> {
  const res = await apiService.post<AuthResponse>('/api/v1/auth/login', {
    email,
    password,
  });
  const user = mapBackendUser(res.data.user);
  saveAuthToken(res.data.token);

  // Notify apiService retry queue that auth is restored
  notifyAuthRestored();

  return { user, token: res.data.token };
}

export async function getProfile(): Promise<UserProfile> {
  const res = await apiService.get<ApiResponse<BackendUser>>(
    '/api/v1/auth/profile',
  );
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
