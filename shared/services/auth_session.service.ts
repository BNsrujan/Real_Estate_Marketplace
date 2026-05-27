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
  document.cookie = 'auth_session=; Max-Age=0; path=/; SameSite=Lax';
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
  if (!env.apiUrl) return;

  await fetch(`${env.apiUrl}/api/v1/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  }).catch(() => {
    // Client state is still cleared; a later successful logout can clear the httpOnly cookie.
  });
}
