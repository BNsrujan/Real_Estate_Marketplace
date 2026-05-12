"use client";

import React from "react";
import {
  Home,
  Building2,
  Trees,
  Warehouse,
  Grid3X3,
  MapPin,
} from "lucide-react";
import type { Property } from "@/shared/types";

interface PropertyMarkerIconProps {
  property: Property;
  isActive?: boolean;
}


export function PropertyMarkerIcon({
  property,
  isActive = false,
}: PropertyMarkerIconProps) {
  const iconProps = {
    size: isActive ? 32 : 28,
    strokeWidth: 1.5,
    className: `transition-all duration-300 ${
      isActive ? "scale-125" : "scale-100"
    }`,
  };

  const getIconForType = (type: Property["type"]) => {
    switch (type) {
      case "house":
        return <Home {...iconProps} />;
      case "apartment":
        return <Building2 {...iconProps} />;
      case "agriculture land":
        return <Trees {...iconProps} />;
      case "commercial space":
        return <Warehouse {...iconProps} />;
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
        return "#10B981"; // Emerald
      case "apartment":
        return "#3B82F6"; // Blue
      case "agriculture land":
        return "#6FCF97"; // Green
      case "commercial space":
        return "#F59E0B"; // Amber
      case "commercial plots":
        return "#EC4899"; // Pink
      case "site":
        return "#8B5CF6"; // Purple
      default:
        return "#FFFFFF";
    }
  };

  const color = getColorForType(property.type);

  return (
    <div
      className={`
        flex items-center justify-center
        rounded-full
        backdrop-blur-lg
        border
        transition-all duration-300
        ${
          isActive
            ? "bg-gradient-to-br from-gray-900 to-black border-2 shadow-2xl ring-2"
            : "bg-gradient-to-br from-gray-800/90 to-black/80 border shadow-lg hover:shadow-xl"
        }
        p-3
      `}
      style={{
        borderColor: isActive ? color : "rgba(255, 255, 255, 0.3)",
        boxShadow: isActive
          ? `0 0 32px ${color}60, 0 0 16px ${color}30, inset 0 0 16px ${color}20`
          : `0 8px 24px rgba(0, 0, 0, 0.4), 0 0 16px ${color}30`,
      }}
    >
      <div
        style={{
          color,
          textShadow: `0 0 8px ${color}80`,
        }}
      >
        {getIconForType(property.type)}
      </div>
    </div>
  );
}

export default PropertyMarkerIcon;
