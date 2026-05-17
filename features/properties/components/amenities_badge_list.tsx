'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Amenity } from '@/shared/types';

interface AmenitiesBadgeListProps {
  amenities: Amenity[];
  limit?: number;
  className?: string;
}

export function AmenitiesBadgeList({ amenities, limit = 6, className }: AmenitiesBadgeListProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? amenities : amenities.slice(0, limit);

  if (!amenities.length) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {visible.map((a) => (
          <span
            key={a.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300"
          >
            {a.name}
          </span>
        ))}
      </div>
      {amenities.length > limit && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {showAll ? 'Show less' : `+${amenities.length - limit} more`}
        </button>
      )}
    </div>
  );
}
