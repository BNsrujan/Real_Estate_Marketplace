import { apiFetch } from "./client";
import type { Property, User } from "@/shared/types";

interface AuthResponse {
  data: { user: User; token: string };
}

interface WatchlistResponse {
  data: { data: BackendWatchlistItem[] };
}

interface BackendWatchlistItem {
  id: string;
  title: string;
  type: Property["type"];
  priceLabel: string;
  sizeLabel: string;
  lat: string;
  lng: string;
  districtName: string | null;
}

function mapWatchlistItem(item: BackendWatchlistItem): Property {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    price: item.priceLabel,
    size: item.sizeLabel,
    lat: Number(item.lat),
    lng: Number(item.lng),
    district: item.districtName ?? "",
  };
}

export function saveAuthToken(token: string): void {
  if (typeof window !== "undefined") localStorage.setItem("auth_token", token);
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") localStorage.removeItem("auth_token");
}

export function hasAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
}

export async function register(username: string, email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await apiFetch<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: { username, email, password },
  });
  saveAuthToken(res.data.token);
  return res.data;
}

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const res = await apiFetch<AuthResponse>("/api/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
  saveAuthToken(res.data.token);
  return res.data;
}

export async function getProfile(): Promise<User> {
  const res = await apiFetch<{ data: User }>("/api/v1/auth/profile");
  return res.data;
}

export async function getWatchlist(): Promise<Property[]> {
  const res = await apiFetch<WatchlistResponse>("/api/v1/watchlist");
  return res.data.data.map(mapWatchlistItem);
}

export async function saveToWatchlist(propertyId: string): Promise<void> {
  await apiFetch("/api/v1/watchlist", { method: "POST", body: { propertyId } });
}

export async function removeFromWatchlist(propertyId: string): Promise<void> {
  await apiFetch(`/api/v1/watchlist/${propertyId}`, { method: "DELETE" });
}
