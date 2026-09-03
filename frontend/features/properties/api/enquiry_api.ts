import { apiService } from '@/shared/services/api.service';
import type { ApiResponse, Enquiry, EnquiryWithProperty } from '@/shared/types';

export interface EnquiryPayload {
  propertyId: string;
  message: string;
  phone?: string;
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<{ id: string; createdAt: string }> {
  const res = await apiService.post<ApiResponse<{ id: string; createdAt: string }>>(
    '/api/v1/enquiries',
    payload,
  );
  return res.data;
}

export async function getMyEnquiries(): Promise<EnquiryWithProperty[]> {
  const res = await apiService.get<ApiResponse<{ data: EnquiryWithProperty[] }>>(
    '/api/v1/enquiries/mine',
  );
  return res.data.data;
}

export async function updateEnquiryStatus(
  id: string,
  status: string,
): Promise<Enquiry> {
  const res = await apiService.patch<ApiResponse<{ data: Enquiry }>>(
    `/api/v1/enquiries/${id}/status`,
    { status },
  );
  return res.data.data;
}
