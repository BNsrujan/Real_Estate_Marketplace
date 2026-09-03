/**
 * shared/api/client — Compatibility shim over apiService (SERVICE-001).
 *
 * Existing code that imports `apiFetch` continues to work.
 * New code should import apiService from @/shared/services/api.service directly.
 */

import { apiService } from '@/shared/services/api.service';

type RequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers } = options;

  switch ((method as string).toUpperCase()) {
    case 'POST':
      return apiService.post<T>(path, body, {
        headers: headers as Record<string, string>,
      });
    case 'PUT':
      return apiService.put<T>(path, body, {
        headers: headers as Record<string, string>,
      });
    case 'PATCH':
      return apiService.patch<T>(path, body, {
        headers: headers as Record<string, string>,
      });
    case 'DELETE':
      return apiService.delete<T>(path, {
        headers: headers as Record<string, string>,
      });
    default:
      return apiService.get<T>(path, {
        headers: headers as Record<string, string>,
      });
  }
}
