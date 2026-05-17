'use client';

import { useEffect, useRef } from 'react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  zoom?: number;
}

export function PropertyMap({ lat, lng, zoom = 14 }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: { remove: () => void } | null = null;

    async function init() {
      const maplibregl = await import('maplibre-gl');
      const m = new maplibregl.Map({
        container: containerRef.current!,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [lng, lat],
        zoom,
      });
      new maplibregl.Marker({ color: '#ffffff' }).setLngLat([lng, lat]).addTo(m);
      mapRef.current = m;
      map = m;
    }

    init();
    return () => { map?.remove(); mapRef.current = null; };
  }, [lat, lng, zoom]);

  return (
    <div
      ref={containerRef}
      className="h-52 w-full overflow-hidden rounded-xl border border-white/10"
    />
  );
}
