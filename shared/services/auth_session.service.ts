import { env } from '@/lib/env';

const AUTH_STORAGE_KEYS = [
  'auth_token',
  'auth_user',
  'auth_session',
  'session',
  'token',
  'user',
];

export const LOGGED_OUT_STORAGE_KEY = 'auth_logged_out_at';
export const LOGGED_OUT_COOKIE = 'auth_logged_out';

export function clearClientAuthData(): void {
  if (typeof window === 'undefined') return;

  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  localStorage.setItem(LOGGED_OUT_STORAGE_KEY, String(Date.now()));
  document.cookie = `${LOGGED_OUT_COOKIE}=1; Max-Age=604800; path=/; SameSite=Lax`;
}

export function clearLogoutMarker(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LOGGED_OUT_STORAGE_KEY);
  document.cookie = `${LOGGED_OUT_COOKIE}=; Max-Age=0; path=/; SameSite=Lax`;
}

export function hasExplicitLogoutMarker(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(LOGGED_OUT_STORAGE_KEY));
}

export async function clearServerAuthCookie(): Promise<void> {
  if (!env.apiUrl) {
    throw new Error('API URL is not configured; cannot clear server auth cookie.');
  }

  const response = await fetch(`${env.apiUrl}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });

  if (!response.ok) {
    throw new Error(`Logout failed with status ${response.status}.`);
  }
}

export async function logoutAuthSession(): Promise<void> {
  try {
    await clearServerAuthCookie();
  } finally {
    clearClientAuthData();
  }
}
