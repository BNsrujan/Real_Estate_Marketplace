'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import type { PropertyImage } from '@/shared/types';

interface PropertyImageGalleryProps {
  images: PropertyImage[];
  coverFirst?: boolean;
}

export function PropertyImageGallery({ images, coverFirst = true }: PropertyImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const sorted = coverFirst
    ? [...images].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0))
    : images;

  if (!sorted.length) return null;

  function prev() { setActiveIdx((i) => (i - 1 + sorted.length) % sorted.length); }
  function next() { setActiveIdx((i) => (i + 1) % sorted.length); }

  return (
    <>
      <div className="space-y-2">
        {/* Main image */}
        <div
          className="relative aspect-video w-full cursor-zoom-in overflow-hidden rounded-none"
          onClick={() => { setActiveIdx(0); setLightboxOpen(true); }}
        >
          <Image
            src={sorted[0].url}
            alt={sorted[0].alt || ''}
            fill
            className="object-cover"
            priority
          />
          {sorted.length > 1 && (
            <button
              type="button"
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded-none bg-parchment/95 px-2 py-1 text-xs text-ink backdrop-blur-sm"
            >
              <Maximize2 className="h-3 w-3" />
              {sorted.length} photos
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {sorted.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {sorted.slice(1, 5).map((img, idx) => (
              <div
                key={img.id}
                className="relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-none"
                onClick={() => { setActiveIdx(idx + 1); setLightboxOpen(true); }}
              >
                <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                {idx === 3 && sorted.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-parchment/95 text-sm font-medium text-ink">
                    +{sorted.length - 5}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl border-hairline bg-terrain/95 p-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-none">
            <Image
              src={sorted[activeIdx].url}
              alt={sorted[activeIdx].alt || ''}
              fill
              className="object-contain"
            />
            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-none bg-parchment/95 p-2 text-ink hover:bg-parchment/95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none bg-parchment/95 p-2 text-ink hover:bg-parchment/95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-none bg-parchment/95 px-3 py-1 text-xs text-ink">
              {activeIdx + 1} / {sorted.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
