/**
 * Centralized property type definitions and constants.
 * All property-related enums and type guards live here.
 */

export const PROPERTY_TYPES = {
  HOUSE: "house",
  SITE: "site",
  AGRICULTURE_LAND: "agriculture land",
  COMMERCIAL_SPACE: "commercial space",
  APARTMENT: "apartment",
  COMMERCIAL_PLOTS: "commercial plots",
} as const;

export type PropertyType =
  | typeof PROPERTY_TYPES.HOUSE
  | typeof PROPERTY_TYPES.SITE
  | typeof PROPERTY_TYPES.AGRICULTURE_LAND
  | typeof PROPERTY_TYPES.COMMERCIAL_SPACE
  | typeof PROPERTY_TYPES.APARTMENT
  | typeof PROPERTY_TYPES.COMMERCIAL_PLOTS;

/**
 * Icons and colors for property types for consistent visualization.
 */
export const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  house: "🏠",
  site: "🌱",
  "agriculture land": "🌾",
  "commercial space": "🏗️",
  apartment: "🏢",
  "commercial plots": "📍",
};

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  house: "#4ade80",
  site: "#facc15",
  "agriculture land": "#f97316",
  "commercial space": "#fb923c",
  apartment: "#38bdf8",
  "commercial plots": "#ec4899",
};

/**
 * Display labels for property types.
 */
export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: "House",
  site: "Site",
  "agriculture land": "Agriculture Land",
  "commercial space": "Commercial Space",
  apartment: "Apartment",
  "commercial plots": "Commercial Plots",
};

/**
 * Type guard to check if a string is a valid PropertyType.
 */
export function isValidPropertyType(value: unknown): value is PropertyType {
  return typeof value === "string" && value in PROPERTY_TYPE_ICONS;
}

/**
 * Get the icon for a property type.
 */
export function getPropertyTypeIcon(type: PropertyType): string {
  return PROPERTY_TYPE_ICONS[type];
}

/**
 * Get the color for a property type.
 */
export function getPropertyTypeColor(type: PropertyType): string {
  return PROPERTY_TYPE_COLORS[type];
}

/**
 * Get the label for a property type.
 */
export function getPropertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type];
}
