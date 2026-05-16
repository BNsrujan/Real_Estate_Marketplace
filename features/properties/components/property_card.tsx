"use client";

import Image from "next/image";
import {
  Home,
  Wheat,
  MapPinned,
  Building2,
  Landmark,
  Factory,
} from "lucide-react";
import type { Property } from "@/shared/types";

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home,
  agriculture: Wheat,
  site: MapPinned,
  commercial_space: Building2,
  apartment: Landmark,
  commercial_plot: Factory,
  // legacy labels (in case old data still flows through)
  "agriculture land": Wheat,
  "commercial space": Building2,
  "commercial plots": Factory,
};

interface PropertyHoverCardProps {
  property: Property;
  onOpen: (property: Property) => void;
}

export default function PropertyHoverCard({
  property,
  onOpen,
}: PropertyHoverCardProps) {
  const Icon = TYPE_ICON[property.type] ?? Home;
  const thumbnail = property.thumbnailUrl || property.imageUrls?.[0] || "/property/image.png";
  const location = [property.city, property.district].filter(Boolean).join(", ");

  return (
    <div
      onClick={() => onOpen(property)}
      className="w-72 overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative h-40 w-full">
        <Image
          src={thumbnail}
          alt={property.title}
          fill
          className="object-cover"
        />

        {/* Type badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md">
          <Icon size={14} className="text-white/80" />
          <span className="text-xs text-white/80 capitalize">
            {property.type.replace(/_/g, " ")}
          </span>
        </div>

        {/* Listing type badge */}
        <div className="absolute right-3 top-3 rounded-full bg-emerald-500/80 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md capitalize">
          {property.listingType}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-white">
          {property.title}
        </h3>

        <p className="mt-1 text-sm text-white/45">
          {location || "Karnataka"}
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Price
            </p>
            <p className="text-sm font-semibold text-white">
              {property.priceLabel}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Area
            </p>
            <p className="text-sm font-semibold text-white">
              {property.area} {property.areaUnit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
