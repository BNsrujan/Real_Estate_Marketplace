import type { PropertyType } from '@/shared/types';

export { type PropertyType };

export const PROPERTY_TYPE_ICONS: Record<PropertyType, string> = {
  house: '🏠',
  apartment: '🏢',
  villa: '🏡',
  site: '🌱',
  plot: '📍',
  agriculture: '🌾',
  commercial_space: '🏗️',
  commercial_plot: '🏭',
};

export const PROPERTY_TYPE_COLORS: Record<PropertyType, string> = {
  house: '#4ade80',
  apartment: '#38bdf8',
  villa: '#a78bfa',
  site: '#facc15',
  plot: '#fb923c',
  agriculture: '#f97316',
  commercial_space: '#ec4899',
  commercial_plot: '#f43f5e',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  house: 'House',
  apartment: 'Apartment',
  villa: 'Villa',
  site: 'Site',
  plot: 'Plot',
  agriculture: 'Agriculture Land',
  commercial_space: 'Commercial Space',
  commercial_plot: 'Commercial Plot',
};

export const ALL_PROPERTY_TYPES: PropertyType[] = [
  'house', 'apartment', 'villa', 'site', 'plot', 'agriculture', 'commercial_space', 'commercial_plot',
];

export function isValidPropertyType(value: unknown): value is PropertyType {
  return typeof value === 'string' && value in PROPERTY_TYPE_ICONS;
}

export function getPropertyTypeIcon(type: PropertyType): string {
  return PROPERTY_TYPE_ICONS[type] ?? '🏠';
}

export function getPropertyTypeColor(type: PropertyType): string {
  return PROPERTY_TYPE_COLORS[type] ?? '#4ade80';
}

export function getPropertyTypeLabel(type: PropertyType): string {
  return PROPERTY_TYPE_LABELS[type] ?? type;
}
