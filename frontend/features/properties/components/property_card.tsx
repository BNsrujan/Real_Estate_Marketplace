'use client';

import Image from 'next/image';
import { Home, Wheat, MapPinned, Building2, Landmark, Factory } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Property } from '@/shared/types';

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home,
  apartment: Landmark,
  villa: Home,
  site: MapPinned,
  plot: MapPinned,
  agriculture: Wheat,
  commercial_space: Building2,
  commercial_plot: Factory,
};

const FALLBACK_THUMBNAIL = '/property/image.png';

interface PropertyCardProps {
  property: Property;
  onOpen?: (property: Property) => void;
  variant?: 'hover' | 'grid' | 'list';
}

function TypeMark({ property }: { property: Property }) {
  const Icon = TYPE_ICON[property.type] ?? Home;
  return (
    <span className="absolute left-0 top-0 flex items-center gap-1.5 border-b border-r border-hairline-strong bg-parchment px-2.5 py-1.5">
      <Icon size={11} className="text-ink-muted" />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink">
        {property.type.replace(/_/g, ' ')}
      </span>
    </span>
  );
}

function ListingMark({ property }: { property: Property }) {
  return (
    <span className="absolute right-0 top-0 border-b border-l border-vermilion bg-vermilion px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary-foreground">
      For {property.listingType}
    </span>
  );
}

function Ledger({ property }: { property: Property }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-px border-t border-hairline bg-hairline">
      <div className="bg-parchment pt-3">
        <p className="label mb-1">Price</p>
        <p className="figure text-sm text-vermilion">{property.priceLabel}</p>
      </div>
      <div className="bg-parchment pl-3 pt-3">
        <p className="label mb-1">Area</p>
        <p className="figure text-sm text-ink">{property.sizeLabel}</p>
      </div>
    </div>
  );
}

export function PropertyCard({ property, onOpen, variant = 'hover' }: PropertyCardProps) {
  const thumbnail = property.thumbnailUrl || property.imageUrls?.[0] || FALLBACK_THUMBNAIL;
  const location = [property.city, property.districtName].filter(Boolean).join(', ');
  const isFloating = variant !== 'grid';

  return (
    <article
      onClick={() => onOpen?.(property)}
      className={cn(
        'group cursor-pointer border border-hairline-strong bg-parchment transition-all duration-[240ms]',
        isFloating
          ? 'w-72 shadow-[0_18px_50px_-20px_rgba(14,13,11,0.65)]'
          : 'hover:border-ink/30',
      )}
    >
      <div
        className={cn(
          'relative w-full overflow-hidden border-b border-hairline-strong',
          isFloating ? 'h-40' : 'h-44',
        )}
      >
        <Image
          src={thumbnail}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 288px"
          className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
        />
        <TypeMark property={property} />
        <ListingMark property={property} />
      </div>

      <div className="p-4">
        <h3 className="display line-clamp-1 text-base text-ink">{property.title}</h3>
        <p className="mt-1 text-xs text-ink-muted">{location || 'Karnataka'}</p>
        <Ledger property={property} />
      </div>
    </article>
  );
}

export default PropertyCard;
