"use client";

import {
  Avatar, AvatarImage, AvatarFallback,
  AvatarGroup, AvatarGroupCount,
} from "@/shared/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export default function WatchlistBadge({ property }: { property: any }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center w-full cursor-pointer">
          <AvatarGroup className="ring-2 ring-transparent rounded-xl transition-all duration-200 hover:ring-white/20">
            <Avatar>
              <AvatarImage src={property.images[0]?.image} alt={property.images[0].alt} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={property.images[1]?.image} alt={property.images[1]?.alt || "property"} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+{property.images.length}</AvatarGroupCount>
          </AvatarGroup>
          <div className="text-xs font-medium text-muted-foreground truncate text-ellipsis pt-2 text-start w-full">
            {property.area}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="bg-black/90 border border-white/10 text-white rounded-2xl shadow-xl backdrop-blur-xl p-4 w-56 z-1100 [--tooltip-bg:var(--color-black)]"
      >
        <div className="">
        <p className="text-sm font-semibold mb-3 truncate">{property.area}</p>
        <div className="flex gap-2 flex-wrap">
          {property.images.slice(0, 4).map((img: { image: string; alt: string }, i: number) => (
            <img
              key={i}
              src={img.image}
              alt={img.alt}
              className="h-12 w-12 rounded-lg object-cover border border-white/10"
            />
          ))}
        </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}