import { env } from '@/lib/env';

function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/shared/store').useStore;
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  _isRetry?: boolean; // internal: prevents infinite retry loop
}

interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  execute: () => Promise<unknown>;
}

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

export function notifyAuthRestored() {
  flushQueue(true);
}

export function notifyAuthAborted() {
  flushQueue(false);
}

async function request<T>(
  method: Method,
  endpoint: string,
  body?: unknown,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const init: RequestInit = {
    method,
    headers,
    // Browser sends the httpOnly auth_session cookie automatically.
    // The backend middleware silently refreshes the access token inside the same request
    // if it's expired but the refresh token is still valid.
    credentials: 'include',
    signal: options.signal,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  const url = `${env.apiUrl}${endpoint}`;
  const response = await fetch(url, init);

  // 401 means the backend has already attempted the silent refresh and both tokens are expired.
  // Queue the request and open the login modal — no separate /refresh call needed.
  if (response.status === 401 && !options._isRetry) {
    const store = getStore();
    const { openLoginModal } = store.getState();

    return new Promise<T>((resolve, reject) => {
      retryQueue.push({
        resolve: resolve as (v: unknown) => void,
        reject,
        execute: () => request<T>(method, endpoint, body, { ...options, _isRetry: true }),
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
      (errorBody as { message?: string }).message ?? `API error ${response.status}`;
    const err = Object.assign(new Error(message), {
      code: response.status,
      retryable: response.status >= 500,
    });
    throw err;
  }

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
