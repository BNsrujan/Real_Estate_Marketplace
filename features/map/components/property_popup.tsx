"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Property } from "@/shared/types";
import PropertyHoverCard from "@/features/properties/components/property_card";


/* ─── types ───────────────────────────────────────────────── */
interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
  isHoverMode?: boolean;
  markerLngLat?: { lng: number; lat: number } | null;
  mapInstance?: any;
}

/* ─── component ───────────────────────────────────────────── */
export default function PropertyPopup({ property, onClose, isHoverMode = false, markerLngLat, mapInstance }: PropertyPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null);
  const prevProp = useRef<Property | null>(null);

  const visible = property !== null;

  useEffect(() => {
    if (!markerLngLat || !mapInstance?.current || !visible) {
      setScreenPos(null);
      return;
    }

    try {
      const map = mapInstance.current;
      const screenCoord = map.project([markerLngLat.lng, markerLngLat.lat]);
      const mapContainer = map.getContainer();
      const mapRect = mapContainer.getBoundingClientRect();

      setScreenPos({
        x: screenCoord.x + mapRect.left,
        y: screenCoord.y + mapRect.top,
      });
    } catch (e) {
      console.error('Error projecting marker position:', e);
      setScreenPos(null);
    }
  }, [markerLngLat, mapInstance, visible]);

  useEffect(() => { setMounted(true); }, []);

  const [displayProperty, setDisplayProperty] = useState<Property | null>(property);

  useEffect(() => {
    if (property) setDisplayProperty(property);
  }, [property]);

  const display = property ?? displayProperty;

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!mounted || !display || typeof document === "undefined") return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (isHoverMode && screenPos && !isMobile) {
    return createPortal(
      <div
        className="fixed transition-all duration-200"
        style={{
          left: `${Math.round(screenPos.x + 24)}px`,
          top: `${Math.round(screenPos.y - 120)}px`,
          zIndex: 99999,
          pointerEvents: "auto",
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
        }}
      >
        <PropertyHoverCard
          property={display as any}
          onOpen={() => {}}
        />
      </div>,
      document.body
    );
  }
}
