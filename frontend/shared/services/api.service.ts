import { env } from '@/lib/env';
import { clearClientAuthData } from '@/shared/services/auth_session.service';

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
  signal?: AbortSignal;
  cleanup?: () => void;
}

const MAX_RETRY_QUEUE_SIZE = 50;
const RETRY_QUEUE_LIMIT_ERROR_MESSAGE = 'Retry queue limit exceeded';
const retryQueue: QueuedRequest[] = [];
let isRefreshing = false;

function createAbortError(): Error {
  const error = new Error('Request aborted');
  error.name = 'AbortError';
  return error;
}

function shouldQueueAuthFailure(endpoint: string): boolean {
  return !endpoint.startsWith('/api/v1/auth/');
}

function clearStaleAuthState(): void {
  clearClientAuthData();

  const store = getStore();
  const { setAuth, setWatchlist } = store.getState();
  setAuth({
    isAuthenticated: false,
    user: null,
    token: null,
  });
  setWatchlist({ saved: [], isSaving: false });
}

function flushQueue(success: boolean) {
  isRefreshing = false;
  const items = retryQueue.splice(0);
  items.forEach((item) => {
    item.cleanup?.();
    if (item.signal?.aborted) {
      item.reject(createAbortError());
      return;
    }

    if (success) {
      item.execute().then(item.resolve).catch(item.reject);
    } else {
      item.reject(new Error('Session expired'));
    }
  });
}

function removeQueuedRequest(queuedRequest: QueuedRequest): boolean {
  const index = retryQueue.indexOf(queuedRequest);
  if (index === -1) return false;

  retryQueue.splice(index, 1);
  queuedRequest.cleanup?.();
  if (retryQueue.length === 0) isRefreshing = false;
  return true;
}

function enqueueQueuedRequest(queuedRequest: QueuedRequest): void {
  while (retryQueue.length >= MAX_RETRY_QUEUE_SIZE) {
    const dropped = retryQueue.shift();
    dropped?.cleanup?.();
    dropped?.reject(new Error(RETRY_QUEUE_LIMIT_ERROR_MESSAGE));
  }

  retryQueue.push(queuedRequest);
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
  if (response.status === 401 && !options._isRetry && shouldQueueAuthFailure(endpoint)) {
    const store = getStore();
    const { openLoginModal } = store.getState();
    clearStaleAuthState();

    return new Promise<T>((resolve, reject) => {
      if (options.signal?.aborted) {
        reject(createAbortError());
        return;
      }

      const queuedRequest: QueuedRequest = {
        resolve: resolve as (v: unknown) => void,
        reject,
        execute: () => request<T>(method, endpoint, body, { ...options, _isRetry: true }),
        signal: options.signal,
      };

      if (options.signal) {
        const handleAbort = () => {
          removeQueuedRequest(queuedRequest);
          reject(createAbortError());
        };
        options.signal.addEventListener('abort', handleAbort, { once: true });
        queuedRequest.cleanup = () => {
          options.signal?.removeEventListener('abort', handleAbort);
        };
      }

      enqueueQueuedRequest(queuedRequest);

      if (!isRefreshing) {
        isRefreshing = true;
        openLoginModal();
      }
    });
  }

  if (response.status === 403 && shouldQueueAuthFailure(endpoint)) {
    clearStaleAuthState();
    notifyAuthAborted();
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
