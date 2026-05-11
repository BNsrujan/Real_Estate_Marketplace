import type { Property } from "@/shared/types";

type RawProperty = Omit<Property, "id">;

export async function fetchProperties(): Promise<Property[]> {
  const isServer = typeof window === "undefined";

  let data: RawProperty[];

  if (isServer) {
    const fs = await import("fs/promises");
    const path = await import("path");

    const filePath = path.join(process.cwd(), "public/data/properties.json");
    const file = await fs.readFile(filePath, "utf-8");

    data = JSON.parse(file);
  } else {
    const res = await fetch("/data/properties.json");

    if (!res.ok) {
      throw new Error(`Failed to fetch properties: ${res.status}`);
    }

    data = await res.json();
  }

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
