import type { Property } from "@/types";

// Raw shape from the JSON file (no id field yet)
type RawProperty = Omit<Property, "id">;

/**
 * Fetches all properties and normalises them.
 * Works both server-side (Next.js server components) and client-side.
 */
export async function fetchProperties(): Promise<Property[]> {
  const res = await fetch("/data/properties.json");

  if (!res.ok) {
    throw new Error(`Failed to fetch properties: ${res.status}`);
  }

  const data: RawProperty[] = await res.json();

  return data.map((p, i) => ({ id: String(i), ...p }));
}

export async function fetchPropertiesByDistrict(
  district: string,
): Promise<Property[]> {
  const all = await fetchProperties();
  return all.filter((p) => p.district.toLowerCase() === district.toLowerCase());
}

export async function fetchPropertyById(
  id: string,
): Promise<Property | undefined> {
  const all = await fetchProperties();
  return all.find((p) => p.id === id);
}
