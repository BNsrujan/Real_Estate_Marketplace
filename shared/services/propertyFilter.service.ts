/**
 * propertyFilterService — Centralized filter engine (SERVICE-005)
 *
 * ALL filtering MUST go through this service to prevent conflicts
 * between F-006 (district), F-013 (search), and F-014 (type filter).
 * No feature should write `properties.filtered` directly.
 */

import type { Property, FilterState, PropertyType } from '@/shared/types';

function matchesTypes(property: Property, types: PropertyType[]): boolean {
  if (types.length === 0) return true;
  return types.includes(property.type);
}

function matchesListingType(
  property: Property,
  listingType: FilterState['listingType'],
): boolean {
  if (listingType === 'all') return true;
  return property.listingType === listingType || property.listingType === 'both';
}

function matchesPriceRange(
  property: Property,
  priceMin: number | null,
  priceMax: number | null,
): boolean {
  if (priceMin !== null && property.price < priceMin) return false;
  if (priceMax !== null && property.price > priceMax) return false;
  return true;
}

function matchesAreaRange(
  property: Property,
  areaMin: number | null,
  areaMax: number | null,
): boolean {
  if (areaMin !== null && property.area < areaMin) return false;
  if (areaMax !== null && property.area > areaMax) return false;
  return true;
}

function matchesDistrict(
  property: Property,
  activeDistrict: string | null,
): boolean {
  if (!activeDistrict) return true;
  return (
    property.district?.toLowerCase() === activeDistrict.toLowerCase() ||
    property.city?.toLowerCase() === activeDistrict.toLowerCase()
  );
}

function matchesSearch(property: Property, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  return (
    property.title.toLowerCase().includes(q) ||
    property.district.toLowerCase().includes(q) ||
    property.city?.toLowerCase().includes(q) ||
    property.description?.toLowerCase().includes(q) ||
    false
  );
}

function applyAll(properties: Property[], filters: FilterState): Property[] {
  return properties.filter(
    (p) =>
      matchesTypes(p, filters.types) &&
      matchesListingType(p, filters.listingType) &&
      matchesPriceRange(p, filters.priceMin, filters.priceMax) &&
      matchesAreaRange(p, filters.areaMin, filters.areaMax) &&
      matchesDistrict(p, filters.activeDistrict) &&
      matchesSearch(p, filters.searchQuery),
  );
}

export const propertyFilterService = {
  apply(properties: Property[], filters: FilterState): Property[] {
    return applyAll(properties, filters);
  },

  applyPartial(
    properties: Property[],
    partialFilters: Partial<FilterState>,
  ): Property[] {
    const merged: FilterState = {
      types: [],
      priceMin: null,
      priceMax: null,
      areaMin: null,
      areaMax: null,
      listingType: 'all',
      activeDistrict: null,
      searchQuery: '',
      ...partialFilters,
    };
    return applyAll(properties, merged);
  },

  count(properties: Property[], filters: FilterState): number {
    return applyAll(properties, filters).length;
  },
};
