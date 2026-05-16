import { apiService } from '@/shared/services/api.service';
import type { ApiResponse } from '@/shared/types';

export interface EnquiryPayload {
  propertyId: string;
  message: string;
  phone?: string;
}

export interface EnquiryResult {
  id: string;
  createdAt: string;
}

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResult> {
  const res = await apiService.post<ApiResponse<EnquiryResult>>(
    '/api/v1/enquiries',
    payload,
  );
  return res.data;
}
