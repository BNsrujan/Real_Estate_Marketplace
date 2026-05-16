"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Bookmark,
  BookmarkCheck,
  Phone,
  MapPin,
  Home,
  Wheat,
  MapPinned,
  Building2,
  Landmark,
  Factory,
} from "lucide-react";
import Image from "next/image";

import type { Property } from "@/shared/types";
import PropertyHoverCard from "@/features/properties/components/property_card";
import { useStore } from "@/shared/store";

const TYPE_ICON: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  house: Home,
  agriculture: Wheat,
  site: MapPinned,
  commercial_space: Building2,
  apartment: Landmark,
  commercial_plot: Factory,
  "agriculture land": Wheat,
  "commercial space": Building2,
  "commercial plots": Factory,
};

interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
  isHoverMode?: boolean;
  markerLngLat?: { lng: number; lat: number } | null;
  mapInstance?: React.RefObject<unknown>;
}

export default function PropertyPopup({
  property,
  onClose,
  isHoverMode = false,
  markerLngLat,
  mapInstance,
}: PropertyPopupProps) {
  const [mounted, setMounted] = useState(false);
  const [screenPos, setScreenPos] = useState<{ x: number; y: number } | null>(null);

  const saved = useStore((s) => s.watchlist.saved);
  const addToWatchlist = useStore((s) => s.addToWatchlist);
  const removeFromWatchlist = useStore((s) => s.removeFromWatchlist);
  const isAuthenticated = useStore((s) => s.auth.isAuthenticated);
  const openLoginModal = useStore((s) => s.openLoginModal);

  const visible = property !== null;
  const isSaved = property ? saved.some((p) => p.id === property.id) : false;

  useEffect(() => { setMounted(true); }, []);

  // Project marker coords to screen for hover mode
  useEffect(() => {
    if (!markerLngLat || !mapInstance?.current || !visible || !isHoverMode) {
      setScreenPos(null);
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const map = mapInstance.current as any;
      const screenCoord = map.project([markerLngLat.lng, markerLngLat.lat]);
      const mapRect = map.getContainer().getBoundingClientRect();
      setScreenPos({
        x: screenCoord.x + mapRect.left,
        y: screenCoord.y + mapRect.top,
      });
    } catch {
      setScreenPos(null);
    }
  }, [markerLngLat, mapInstance, visible, isHoverMode]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!mounted || !property || typeof document === "undefined") return null;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // ── Hover mode: floating card near the marker ──────────────────────────────
  if (isHoverMode) {
    if (!screenPos || isMobile) return null;
    return createPortal(
      <div
        className="fixed transition-all duration-200 pointer-events-auto"
        style={{
          left: `${Math.round(screenPos.x + 24)}px`,
          top: `${Math.round(screenPos.y - 120)}px`,
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0.95)",
        }}
      >
        <PropertyHoverCard property={property} onOpen={() => {}} />
      </div>,
      document.body,
    );
  }

  // ── Click mode: fixed panel from the right ─────────────────────────────────
  const Icon = TYPE_ICON[property.type] ?? Home;
  const thumbnail = property.thumbnailUrl || property.imageUrls?.[0] || "/property/image.png";
  const location = [property.city, property.taluk, property.district].filter(Boolean).join(", ");

  const handleSave = () => {
    if (!isAuthenticated) {
      openLoginModal({ type: "SAVE_PROPERTY", payload: { propertyId: property.id } });
      return;
    }
    if (isSaved) {
      removeFromWatchlist(property.id);
    } else {
      addToWatchlist(property);
    }
  };

  const handleContact = () => {
    if (!isAuthenticated) {
      openLoginModal({ type: "CONTACT_SELLER", payload: { propertyId: property.id } });
    }
  };

  return createPortal(
    <>
      {/* Backdrop (mobile only) */}
      {isMobile && (
        <div className="fixed inset-0 z-[99998] bg-black/40" onClick={onClose} />
      )}

      {/* Detail panel */}
      <div
        className="fixed z-[99999] flex flex-col overflow-hidden bg-black/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl transition-all duration-300"
        style={
          isMobile
            ? { bottom: 0, left: 0, right: 0, maxHeight: "75vh", borderRadius: "24px 24px 0 0" }
            : { top: 0, right: 0, width: 380, height: "100vh" }
        }
      >
        {/* Hero image */}
        <div className="relative h-52 w-full flex-shrink-0">
          <Image src={thumbnail} alt={property.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
          >
            <X size={16} />
          </button>

          {/* Listing type */}
          <span className="absolute bottom-3 left-3 rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white capitalize">
            For {property.listingType}
          </span>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="absolute bottom-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 transition"
          >
            {isSaved
              ? <BookmarkCheck size={16} className="text-emerald-400" />
              : <Bookmark size={16} className="text-white" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Title & location */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                <Icon size={12} className="text-white/70" />
                <span className="text-[11px] text-white/70 capitalize">{property.type.replace(/_/g, " ")}</span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-white leading-tight">{property.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/50">
              <MapPin size={13} />
              {location || "Karnataka"}
            </p>
          </div>

          {/* Price & Area */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Price</p>
              <p className="text-lg font-bold text-white">{property.priceLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Area</p>
              <p className="text-lg font-bold text-white">
                {property.area} <span className="text-sm font-normal text-white/60">{property.areaUnit}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">About</p>
              <p className="text-sm text-white/70 leading-relaxed line-clamp-4">{property.description}</p>
            </div>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-3">Features</p>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f, i) => (
                  <span key={i} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                    {f.key}: {f.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="flex-shrink-0 p-4 pt-0 space-y-2">
          <button
            onClick={handleContact}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 font-semibold text-white hover:bg-emerald-600 transition"
          >
            <Phone size={16} />
            {isAuthenticated ? "Contact Seller" : "Login to Contact"}
          </button>
          <button
            onClick={handleSave}
            className={`w-full flex items-center justify-center gap-2 rounded-2xl border py-3.5 font-semibold transition ${
              isSaved
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                : "border-white/20 bg-white/5 text-white hover:bg-white/10"
            }`}
          >
            {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            {isSaved ? "Saved" : "Save Property"}
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
