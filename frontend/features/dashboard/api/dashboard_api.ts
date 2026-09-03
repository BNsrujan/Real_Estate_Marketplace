import { apiService } from '@/shared/services/api.service';
import type { ApiResponse, DashboardStats, Property, EnquiryWithProperty } from '@/shared/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiService.get<ApiResponse<DashboardStats>>('/api/v1/dashboard/stats');
  return res.data;
}

export async function getDashboardProperties(params: { status?: string; page?: number; limit?: number } = {}): Promise<Property[]> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  const res = await apiService.get<ApiResponse<{ data: Property[] }>>(`/api/v1/dashboard/properties${q.toString() ? `?${q}` : ''}`);
  return res.data.data;
}

export async function getDashboardEnquiries(params: { status?: string; page?: number } = {}): Promise<EnquiryWithProperty[]> {
  const q = new URLSearchParams();
  if (params.status) q.set('status', params.status);
  if (params.page) q.set('page', String(params.page));
  const res = await apiService.get<ApiResponse<{ data: EnquiryWithProperty[] }>>(`/api/v1/dashboard/enquiries${q.toString() ? `?${q}` : ''}`);
  return res.data.data;
}
