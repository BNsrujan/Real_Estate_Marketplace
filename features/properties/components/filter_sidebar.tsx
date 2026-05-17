'use client';

import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { PriceRangeSlider } from '@/shared/components/common/price_range_slider';
import { PropertyTypeSelect } from '@/shared/components/common/property_type_select';
import type { FilterState, District, PropertyType } from '@/shared/types';

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (patch: Partial<FilterState>) => void;
  districts: District[];
  onClose?: () => void;
}

const PRICE_MIN = 0;
const PRICE_MAX = 100_000_000;

export function FilterSidebar({ filters, onChange, districts, onClose }: FilterSidebarProps) {
  const priceRange: [number, number] = [
    filters.priceMin ?? PRICE_MIN,
    filters.priceMax ?? PRICE_MAX,
  ];

  function reset() {
    onChange({
      types: [],
      priceMin: null,
      priceMax: null,
      listingType: 'all',
      activeDistrict: null,
      searchQuery: '',
    });
  }

  const hasFilters =
    filters.types.length > 0 ||
    filters.priceMin !== null ||
    filters.priceMax !== null ||
    filters.listingType !== 'all' ||
    filters.activeDistrict !== null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px]">
              {[
                filters.types.length,
                filters.priceMin !== null || filters.priceMax !== null ? 1 : 0,
                filters.listingType !== 'all' ? 1 : 0,
                filters.activeDistrict !== null ? 1 : 0,
              ].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {hasFilters && (
            <button type="button" onClick={reset} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors">
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="rounded p-1 text-zinc-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 p-4">
        {/* Listing type */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Listing Type</p>
          <div className="flex gap-2">
            {(['all', 'sale', 'rent'] as const).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => onChange({ listingType: lt })}
                className={`rounded-lg border px-3 py-1.5 text-xs capitalize transition-colors ${
                  filters.listingType === lt
                    ? 'border-white/30 bg-white/15 text-white'
                    : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {lt === 'all' ? 'All' : `For ${lt}`}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Property type */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Property Type</p>
          <PropertyTypeSelect
            multiple
            value={filters.types}
            onChange={(v) => onChange({ types: v })}
          />
        </div>

        <Separator className="bg-white/10" />

        {/* Price range */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Price Range</p>
          <PriceRangeSlider
            min={PRICE_MIN}
            max={PRICE_MAX}
            value={priceRange}
            onChange={([min, max]) => onChange({
              priceMin: min === PRICE_MIN ? null : min,
              priceMax: max === PRICE_MAX ? null : max,
            })}
          />
        </div>

        <Separator className="bg-white/10" />

        {/* District */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">District</p>
          <Select
            value={filters.activeDistrict ?? 'all'}
            onValueChange={(v) => onChange({ activeDistrict: v === 'all' ? null : v })}
          >
            <SelectTrigger className="border-white/10 bg-white/5 text-white">
              <SelectValue placeholder="All districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
