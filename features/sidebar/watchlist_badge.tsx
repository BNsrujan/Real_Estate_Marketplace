'use client';

import {
  Avatar, AvatarImage, AvatarFallback,
  AvatarGroup, AvatarGroupCount,
} from '@/shared/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip';
import type { Property } from '@/shared/types';

export default function WatchlistBadge({ property }: { property: Property }) {
  const img0 = property.images?.[0]?.url ?? property.imageUrls?.[0] ?? '';
  const img1 = property.images?.[1]?.url ?? property.imageUrls?.[1] ?? '';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center w-full cursor-pointer">
          <AvatarGroup className="ring-2 ring-transparent rounded-md transition-all duration-200 hover:ring-white/20">
            <Avatar className='rounded-md'>
              <AvatarImage src={img0} alt={property.images?.[0]?.alt ?? property.title} className='rounded-md' />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={img1} alt={property.images?.[1]?.alt ?? property.title} />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+{(property.images?.length ?? property.imageUrls?.length ?? 0)}</AvatarGroupCount>
          </AvatarGroup>
          <div className="text-xs font-medium text-muted-foreground truncate text-ellipsis pt-2 text-start w-full">
            {property.city}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="bg-foreground border border-border  rounded-2xl shadow-lg p-4 w-56 z-1100"
      >
        <p className="text-sm font-semibold mb-3 truncate text-background">{property.sizeLabel}</p>
        <div className="flex gap-2 flex-wrap">
          {(property.images?.length
            ? property.images.slice(0, 4).map((img) => ({ url: img.url, alt: img.alt }))
            : property.imageUrls?.slice(0, 4).map((url) => ({ url, alt: property.title })) ?? []
          ).map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.alt}
              className="h-12 w-12 rounded-xl object-cover border border-border"
            />
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
