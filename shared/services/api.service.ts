/**
 * apiService — Authenticated fetch wrapper (SERVICE-001)
 *
 * Features:
 *  - Auto-injects Bearer token from localStorage
 *  - On 401: queues the request, opens login modal, replays after re-login
 *  - All features should import from here, not from shared/api/client
 */

import { env } from '@/lib/env';

// Lazy-import the store to avoid circular-dependency / SSR issues
function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/shared/store').useStore;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  execute: () => Promise<unknown>;
}

// Requests that failed with 401 and are waiting for re-login
const retryQueue: QueuedRequest[] = [];
let isRefreshing = false;

function flushQueue(success: boolean) {
  isRefreshing = false;
  const items = retryQueue.splice(0);
  items.forEach((item) => {
    if (success) {
      item.execute().then(item.resolve).catch(item.reject);
    } else {
      item.reject(new Error('Session expired'));
    }
  });
}

// Called by the auth store after a successful re-login
export function notifyAuthRestored() {
  flushQueue(true);
}

// Called when the user dismisses the login modal without logging in
export function notifyAuthAborted() {
  flushQueue(false);
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

async function request<T>(
  method: Method,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const init: RequestInit = {
    method,
    headers,
    signal: options.signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const url = `${env.apiUrl}${endpoint}`;
  const response = await fetch(url, init);

  if (response.status === 401) {
    const store = getStore();
    const { openLoginModal } = store.getState();

    // Gate: if we're already showing the login modal, queue this request
    return new Promise<T>((resolve, reject) => {
      retryQueue.push({
        resolve: resolve as (v: unknown) => void,
        reject,
        execute: () => request<T>(method, endpoint, body, options),
      });

      if (!isRefreshing) {
        isRefreshing = true;
        openLoginModal();
      }
    });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ??
      `API error ${response.status}`;
    const err = Object.assign(new Error(message), {
      code: response.status,
      retryable: response.status >= 500,
    });
    throw err;
  }

  // 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export const apiService = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', endpoint, undefined, options);
  },
  post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('POST', endpoint, body, options);
  },
  put<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PUT', endpoint, body, options);
  },
  patch<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return request<T>('PATCH', endpoint, body, options);
  },
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>('DELETE', endpoint, undefined, options);
  },
};
