/**
 * geocoderService — Location search via Nominatim (SERVICE-004)
 *
 * Uses OpenStreetMap Nominatim (free, no API key).
 * Karnataka bounding box: [74.0, 11.5, 78.6, 18.5] (west,south,east,north)
 */

import type { BBox, GeocoderResult, ReverseGeocodeResult } from '@/shared/types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const KARNATAKA_BBOX: BBox = [74.0, 11.5, 78.6, 18.5];
const DEFAULT_LIMIT = 5;

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

interface SearchOptions {
  boundingBox?: BBox;
  types?: string[];
  limit?: number;
}

function nominatimResultToGeocoderResult(r: NominatimResult): GeocoderResult {
  const nameParts = r.display_name.split(', ');
  return {
    name: nameParts[0] ?? r.display_name,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    type: r.type,
    fullName: r.display_name,
  };
}

async function nominatimSearch(
  query: string,
  options: SearchOptions = {},
): Promise<GeocoderResult[]> {
  const bbox = options.boundingBox ?? KARNATAKA_BBOX;
  const limit = options.limit ?? DEFAULT_LIMIT;

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: String(limit),
    addressdetails: '1',
    // Nominatim viewbox format: left,top,right,bottom
    viewbox: `${bbox[0]},${bbox[3]},${bbox[2]},${bbox[1]}`,
    bounded: '1',
  });

  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) return [];

  const data: NominatimResult[] = await res.json();
  return data.map(nominatimResultToGeocoderResult);
}

export const geocoderService = {
  async search(query: string, options?: SearchOptions): Promise<GeocoderResult[]> {
    if (!query.trim()) return [];
    return nominatimSearch(query, options);
  },

  async searchKarnataka(query: string): Promise<GeocoderResult[]> {
    return nominatimSearch(query, { boundingBox: KARNATAKA_BBOX });
  },

  async reverse(lat: number, lng: number): Promise<ReverseGeocodeResult> {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: 'json',
      addressdetails: '1',
    });

    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { 'Accept-Language': 'en' },
    });

    if (!res.ok) {
      return { address: '', city: '', district: '', state: '' };
    }

    const data = await res.json();
    const addr = data.address ?? {};

    return {
      address: data.display_name ?? '',
      city: addr.city ?? addr.town ?? addr.village ?? '',
      district: addr.county ?? addr.state_district ?? '',
      state: addr.state ?? '',
    };
  },
};
