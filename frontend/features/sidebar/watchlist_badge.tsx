'use client';

import Image from 'next/image';
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

export default function WatchlistBadge({
  districtName,
  count,
  properties,
  active,
  onClick,
}: {
  districtName: string;
  count: number;
  properties: Property[];
  active: boolean;
  onClick: () => void;
}) {
  const firstProperty = properties[0];
  const secondProperty = properties[1] ?? firstProperty;
  const img0 = firstProperty?.images?.[0]?.url ?? firstProperty?.imageUrls?.[0] ?? '';
  const img1 = secondProperty?.images?.[0]?.url ?? secondProperty?.imageUrls?.[0] ?? '';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className="flex flex-col items-center w-full cursor-pointer focus-visible:outline-none"
        >
          <AvatarGroup className={`ring-2 rounded-none transition-all duration-200 ${active ? 'ring-primary/60' : 'ring-transparent hover:ring-hairline-strong'}`}>
            <Avatar className='rounded-none'>
              <AvatarImage src={img0} alt={firstProperty?.images?.[0]?.alt ?? districtName} className='rounded-none' />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarImage src={img1} alt={secondProperty?.images?.[0]?.alt ?? districtName} />
              <AvatarFallback>P</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+{count}</AvatarGroupCount>
          </AvatarGroup>
          <div className="text-xs font-medium text-muted-foreground truncate text-ellipsis pt-2 text-start w-full">
            {districtName}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="bg-foreground border border-border  rounded-none shadow-lg p-4 w-56 z-1100"
      >
        <p className="text-sm font-semibold mb-3 truncate text-background">{districtName} (+{count})</p>
        <div className="flex gap-2 flex-wrap">
          {properties.slice(0, 4).flatMap((property) =>
            property.images?.[0]?.url
              ? [{ url: property.images[0].url, alt: property.images[0].alt ?? property.title }]
              : property.imageUrls?.[0]
                ? [{ url: property.imageUrls[0], alt: property.title }]
                : []
          ).map((img, i) => (
            <Image
              key={i}
              src={img.url}
              alt={img.alt}
              width={48}
              height={48}
              className="h-12 w-12 rounded-none object-cover border border-border"
            />
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
