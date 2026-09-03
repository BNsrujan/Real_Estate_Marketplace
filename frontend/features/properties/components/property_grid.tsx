'use client';

import { Skeleton } from '@/shared/components/ui/skeleton';
import { PropertyCard } from './property_card';
import type { Property } from '@/shared/types';

interface PropertyGridProps {
  properties: Property[];
  isLoading?: boolean;
  columns?: 2 | 3;
  onOpen?: (p: Property) => void;
}

export function PropertyGrid({ properties, isLoading, columns = 3, onOpen }: PropertyGridProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-4 ${columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-none border border-hairline p-4">
            <Skeleton className="h-44 w-full rounded-none" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!properties.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-ink-muted">
        <p className="text-lg font-medium">No properties found</p>
        <p className="text-sm">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} variant="grid" onOpen={onOpen} />
      ))}
    </div>
  );
}
