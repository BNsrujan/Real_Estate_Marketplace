'use client';

import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import { Separator } from '@/shared/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { PriceRangeSlider } from '@/shared/components/common/price_range_slider';
import { PropertyTypeSelect } from '@/shared/components/common/property_type_select';
import type { FilterState, District } from '@/shared/types';

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
        <div className="flex items-center gap-2 text-sm font-medium text-ink">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasFilters && (
            <span className="rounded-none bg-parchment-deep px-1.5 py-0.5 text-[10px]">
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
            <button type="button" onClick={reset} className="flex items-center gap-1 rounded px-2 py-1 text-xs text-ink-muted hover:text-ink transition-colors">
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          {onClose && (
            <button type="button" onClick={onClose} className="rounded p-1 text-ink-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 p-4">
        {/* Listing type */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Listing Type</p>
          <div className="flex gap-2">
            {(['all', 'sale', 'rent'] as const).map((lt) => (
              <button
                key={lt}
                type="button"
                onClick={() => onChange({ listingType: lt })}
                className={`rounded-none border px-3 py-1.5 text-xs capitalize transition-colors ${
                  filters.listingType === lt
                    ? 'border-hairline-strong bg-parchment-deep text-ink'
                    : 'border-hairline bg-parchment-deep/60 text-ink-muted hover:border-hairline-strong hover:text-ink'
                }`}
              >
                {lt === 'all' ? 'All' : `For ${lt}`}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-parchment-deep" />

        {/* Property type */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Property Type</p>
          <PropertyTypeSelect
            multiple
            value={filters.types}
            onChange={(v) => onChange({ types: v })}
          />
        </div>

        <Separator className="bg-parchment-deep" />

        {/* Price range */}
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">Price Range</p>
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

        <Separator className="bg-parchment-deep" />

        {/* District */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-muted">District</p>
          <Select
            value={filters.activeDistrict ?? 'all'}
            onValueChange={(v) => onChange({ activeDistrict: v === 'all' ? null : v })}
          >
            <SelectTrigger className="border-hairline bg-parchment-deep/60 text-ink">
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
