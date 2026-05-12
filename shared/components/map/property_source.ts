import type { Property } from "@/shared/types";

export function buildPropertiesGeoJSON(properties: Property[]) {
  return {
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: {
        id: p.id,
        title: p.title,
        type: p.type,
        price: p.price,
        size: p.size,
        district: p.district,
      },
    })),
  } as GeoJSON.FeatureCollection<GeoJSON.Point>;
}

export const PROPERTY_SOURCE_ID = "properties-source";
export const PROPERTY_LAYER_ID = "properties-layer";
export const PROPERTY_CLUSTER_LAYER_ID = "properties-clusters";
export const PROPERTY_CLUSTER_COUNT_ID = "properties-cluster-count";
