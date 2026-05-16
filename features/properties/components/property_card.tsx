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
import { useSidebarStore } from "@/features/sidebar/store/sidebar_store";

export interface Property {
  id: string;
  title: string;
  type:
    | "house"
    | "site"
    | "agriculture land"
    | "commercial space"
    | "apartment"
    | "commercial plots";
  price: string;
  size: string;
  lat: number;
  lng: number;
  district: string;
  images: string[];
}

const TYPE_ICON = {
  house: Home,
  "agriculture land": Wheat,
  site: MapPinned,
  "commercial space": Building2,
  apartment: Landmark,
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
  const Icon = TYPE_ICON[property.type];
  const setSelectedPropertyId = useSidebarStore((s) => s.setSelectedPropertyId);

  const handleClick = () => {
    setSelectedPropertyId(property.id);
    onOpen(property);
  };

  return (
    <div
      onClick={handleClick}
      className="w-72 overflow-hidden rounded-3xl border border-white/10 bg-black/80 backdrop-blur-2xl shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
    >
      {/* Image */}
      <div className="relative h-40 w-full">
        <Image
          src={property.images?.[0] || "/property/image.png"}
          alt={property.title}
          fill
          className="object-cover"
        />

        {/* Type badge */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-md">
          <Icon size={14} className="text-white/80" />
          <span className="text-xs text-white/80 capitalize">
            {property.type}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-semibold text-white">
          {property.title}
        </h3>

        <p className="mt-1 text-sm text-white/45">
          {property.district}, Karnataka
        </p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Price
            </p>
            <p className="text-sm font-semibold text-white">
              {property.price}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase tracking-wider text-white/35">
              Size
            </p>
            <p className="text-sm font-semibold text-white">
              {property.size}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}