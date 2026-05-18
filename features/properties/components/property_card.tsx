'use client';

import Image from 'next/image';
import { Home, Wheat, MapPinned, Building2, Landmark, Factory } from 'lucide-react';
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

interface PropertyCardProps {
  property: Property;
  onOpen?: (property: Property) => void;
  variant?: 'hover' | 'grid' | 'list';
}

export function PropertyCard({ property, onOpen, variant = 'hover' }: PropertyCardProps) {
  const Icon = TYPE_ICON[property.type] ?? Home;
  const thumbnail = property.thumbnailUrl || property.imageUrls?.[0] || '/property/image.png';
  const location = [property.city, property.districtName].filter(Boolean).join(', ');

  if (variant === 'grid') {
    return (
      <div
        onClick={() => onOpen?.(property)}
        className="group overflow-hidden rounded-2xl bg-card shadow-sm cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] active:scale-[0.99]"
      >
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={thumbnail}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Type badge */}
          <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-background/80 px-2.5 py-1 backdrop-blur-md">
            <Icon size={12} className="text-primary" />
            <span className="text-[11px] text-foreground capitalize">{property.type.replace(/_/g, ' ')}</span>
          </div>
          {/* Listing type badge */}
          <div className="absolute right-2 top-2 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground capitalize">
            For {property.listingType}
          </div>
        </div>
        <div className="p-4">
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">{property.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{location || 'Karnataka'}</p>
          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="label">Price</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{property.priceLabel}</p>
            </div>
            <div className="text-right">
              <p className="label">Area</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{property.sizeLabel}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // hover variant — floats over satellite map, stays dark glass style
  return (
    <div
      onClick={() => onOpen?.(property)}
      className="w-72 overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
    >
      <div className="relative h-40 w-full">
        <Image src={thumbnail} alt={property.title} fill className="object-cover" />
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md">
          <Icon size={14} className="text-white/80" />
          <span className="text-xs text-white/80 capitalize">{property.type.replace(/_/g, ' ')}</span>
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-primary/80 px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground backdrop-blur-md capitalize">
          For {property.listingType}
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-white">{property.title}</h3>
        <p className="mt-1 text-sm text-white/45">{location || 'Karnataka'}</p>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/35">Price</p>
            <p className="text-sm font-semibold text-white">{property.priceLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-white/35">Area</p>
            <p className="text-sm font-semibold text-white">{property.sizeLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;
