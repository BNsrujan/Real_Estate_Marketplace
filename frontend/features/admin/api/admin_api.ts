import { apiService } from '@/shared/services/api.service';
import type { UserProfile, Property, Enquiry, ApiResponse } from '@/shared/types';

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsers(params?: { role?: string; page?: number; limit?: number }): Promise<{ data: UserProfile[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.role) q.set('role', params.role);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const res = await apiService.get<ApiResponse<UserProfile[]>>(`/api/v1/admin/users?${q}`);
  return { data: res.data ?? [], total: 0 };
}

export async function updateUserRole(userId: string, role: string): Promise<UserProfile> {
  const res = await apiService.patch<ApiResponse<UserProfile>>(`/api/v1/admin/users/${userId}/role`, { role });
  return res.data;
}

export async function toggleUserVerified(userId: string, isVerified: boolean): Promise<UserProfile> {
  const res = await apiService.patch<ApiResponse<UserProfile>>(`/api/v1/admin/users/${userId}/verify`, { isVerified });
  return res.data;
}

// ─── Properties ───────────────────────────────────────────────────────────────

export async function listAllProperties(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Property[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const res = await apiService.get<ApiResponse<Property[]>>(`/api/v1/admin/properties?${q}`);
  return { data: res.data ?? [], total: 0 };
}

export async function setPropertyStatus(propertyId: string, status: string): Promise<void> {
  await apiService.patch(`/api/v1/admin/properties/${propertyId}/status`, { status });
}

export async function toggleFeatured(propertyId: string, isFeatured: boolean): Promise<void> {
  await apiService.patch(`/api/v1/admin/properties/${propertyId}/featured`, { isFeatured });
}

// ─── Enquiries ────────────────────────────────────────────────────────────────

export async function listAllEnquiries(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Enquiry[]; total: number }> {
  const q = new URLSearchParams();
  if (params?.status) q.set('status', params.status);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const res = await apiService.get<ApiResponse<Enquiry[]>>(`/api/v1/admin/enquiries?${q}`);
  return { data: res.data ?? [], total: 0 };
}
