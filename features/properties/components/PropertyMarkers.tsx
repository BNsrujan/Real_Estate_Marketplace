import maplibregl from "maplibre-gl";
import type { Property } from "@/shared/types";

/**
 * Marker rendering migrated to vector/source-based implementation.
 * The old DOM marker implementation was removed in favor of GeoJSON sources + symbol layers with clustering.
 *
 * This stub function maintains API compatibility while markers are rendered via symbol layers.
 * If DOM markers are required later, reintroduce them behind a feature flag.
 *
 * @param map - The MapLibre map instance
 * @param properties - Properties to render (currently unused, handled via GeoJSON layers)
 * @param onClick - Click handler for markers (currently unused)
 * @returns Empty array; markers are now rendered via map layers
 */
export function addPropertyMarkers(
  map: maplibregl.Map,
  properties: Property[],
  onClick?: (property: Property) => void,
): maplibregl.Marker[] {
  // Markers are now rendered via GeoJSON sources and symbol layers.
  // See mapLayerService.ts for property marker layer configuration.
  // Return empty array to maintain hook compatibility.
  return [];
}
