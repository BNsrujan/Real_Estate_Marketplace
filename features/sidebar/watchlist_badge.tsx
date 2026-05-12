"use client";

import {
  Avatar, AvatarImage, AvatarFallback,
  AvatarGroup, AvatarGroupCount,
} from "@/shared/components/ui/avatar";

export default function WatchlistBadge({
  property,
  isSelected,
  onClick,
}: {
  property: any;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="flex flex-col items-center w-full cursor-pointer"
      onClick={onClick}
    >
      <AvatarGroup
        className={`ring-2 rounded-xl transition-all duration-200 ${
          isSelected ? "ring-blue-500" : "ring-transparent"
        }`}
      >
        <Avatar>
          <AvatarImage src={property.images[0].image} alt={property.images[0].alt} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src={property.images[1].image} alt={property.images[1].alt} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+{property.images.length}</AvatarGroupCount>
      </AvatarGroup>
      <div className="text-xs font-medium text-muted-foreground truncate text-ellipsis pt-2 text-start w-full">
        {property.area}
      </div>
    </div>
  );
}