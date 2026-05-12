"use client";

import React from "react";
import {
  Home,
  Building2,
  TreePine,
  ShoppingCart,
  Grid3X3,
  MapPin,
} from "lucide-react";
import type { Property } from "@/shared/types";

interface PropertyMarkerIconProps {
  property: Property;
  isActive?: boolean;
}

/**
 * Lucide-based marker icon component for properties
 * Renders different icons based on property type
 */
export function PropertyMarkerIcon({
  property,
  isActive = false,
}: PropertyMarkerIconProps) {
  const iconProps = {
    size: isActive ? 28 : 24,
    strokeWidth: 2.5,
    className: `transition-all duration-200 ${
      isActive ? "scale-110" : "scale-100"
    }`,
  };

  const getIconForType = (type: Property["type"]) => {
    switch (type) {
      case "house":
        return <Home {...iconProps} />;
      case "apartment":
        return <Building2 {...iconProps} />;
      case "agriculture land":
        return <TreePine {...iconProps} />;
      case "commercial space":
        return <ShoppingCart {...iconProps} />;
      case "commercial plots":
        return <Grid3X3 {...iconProps} />;
      case "site":
        return <MapPin {...iconProps} />;
      default:
        return <MapPin {...iconProps} />;
    }
  };

  const getColorForType = (type: Property["type"]): string => {
    switch (type) {
      case "house":
        return "#00FF88"; // Lime green
      case "apartment":
        return "#00DDFF"; // Cyan
      case "agriculture land":
        return "#88FF00"; // Yellow-green
      case "commercial space":
        return "#FF6B00"; // Orange
      case "commercial plots":
        return "#FFD700"; // Gold
      case "site":
        return "#FF00FF"; // Magenta
      default:
        return "#FFFFFF"; // White
    }
  };

  const color = getColorForType(property.type);

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        backdrop-blur-md
        border-2
        shadow-lg
        transition-all duration-200
        ${
          isActive
            ? "bg-black/70 border-white scale-110 shadow-2xl"
            : "bg-black/50 border-white/40 hover:border-white/80"
        }
        p-2
      `}
      style={{
        borderColor: isActive ? color : "rgba(255, 255, 255, 0.4)",
        boxShadow: isActive
          ? `0 0 24px ${color}80, 0 0 12px ${color}40`
          : "0 4px 12px rgba(0, 0, 0, 0.3)",
      }}
    >
      <div style={{ color }}>{getIconForType(property.type)}</div>
    </div>
  );
}

export default PropertyMarkerIcon;
