'use client';

import { MapPin, Phone, Share2, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Separator } from '@/shared/components/ui/separator';
import { StatusBadge } from '@/shared/components/common/status_badge';
import { useStore } from '@/shared/store';
import { saveToWatchlist as submitWatchlistAdd, removeFromWatchlist as apiRemove } from '@/features/profile/api/auth_api';
import type { Property } from '@/shared/types';

interface PropertyDetailHeaderProps {
  property: Property;
}

export function PropertyDetailHeader({ property }: PropertyDetailHeaderProps) {
  const { saved } = useStore((s) => s.watchlist);
  const { addToWatchlist, removeFromWatchlist, openLoginModal } = useStore((s) => s);
  const { isAuthenticated } = useStore((s) => s.auth);

  const isSaved = saved.some((p) => p.id === property.id);

  async function toggleSave() {
    if (!isAuthenticated) { openLoginModal(); return; }
    if (isSaved) {
      await apiRemove(property.id);
      removeFromWatchlist(property.id);
    } else {
      await submitWatchlistAdd(property.id);
      addToWatchlist(property);
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: property.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white leading-tight">{property.title}</h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {[property.city, property.districtName].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={property.status} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Price</p>
          <p className="text-2xl font-bold text-white">{property.priceLabel}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Area</p>
          <p className="text-lg font-semibold text-white">{property.sizeLabel}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {property.contactNumber && (
          <Button asChild className="flex-1 gap-2">
            <a href={`tel:${property.contactNumber}`}>
              <Phone className="h-4 w-4" />
              Call Seller
            </a>
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={toggleSave} className="border-white/20 bg-white/5">
          {isSaved ? <BookmarkCheck className="h-4 w-4 text-yellow-400" /> : <Bookmark className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={handleShare} className="border-white/20 bg-white/5">
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="bg-white/10" />
    </div>
  );
}
