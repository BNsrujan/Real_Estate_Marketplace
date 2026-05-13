"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  MapPin,
  Ruler,
  Home,
  Sprout,
  Building2,
  Construction,
  IndianRupee,
} from "lucide-react";
import type { Property } from "@/shared/types";

/* ─── per-type config ─────────────────────────────────────── */
const TYPE_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    neon: string;          // text / border glow colour
    glow: string;          // box-shadow glow
    badge: string;         // pill bg
    cta: string;           // CTA gradient
    ctaHover: string;
    label: string;
  }
> = {
  house: {
    icon: <Home size={16} />,
    neon: "#4ade80",
    glow: "0 0 22px #4ade8066, 0 0 6px #4ade8044",
    badge: "bg-green-500/15 text-green-400 border border-green-500/30",
    cta: "from-green-400 via-emerald-400 to-teal-400",
    ctaHover: "hover:from-green-300 hover:to-teal-300",
    label: "House",
  },
  land: {
    icon: <Sprout size={16} />,
    neon: "#facc15",
    glow: "0 0 22px #facc1566, 0 0 6px #facc1544",
    badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    cta: "from-yellow-400 via-amber-400 to-orange-400",
    ctaHover: "hover:from-yellow-300 hover:to-orange-300",
    label: "Land",
  },
  apartment: {
    icon: <Building2 size={16} />,
    neon: "#38bdf8",
    glow: "0 0 22px #38bdf866, 0 0 6px #38bdf844",
    badge: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    cta: "from-sky-400 via-blue-400 to-indigo-400",
    ctaHover: "hover:from-sky-300 hover:to-indigo-300",
    label: "Apartment",
  },
  commercial: {
    icon: <Construction size={16} />,
    neon: "#fb923c",
    glow: "0 0 22px #fb923c66, 0 0 6px #fb923c44",
    badge: "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    cta: "from-orange-400 via-red-400 to-pink-400",
    ctaHover: "hover:from-orange-300 hover:to-pink-300",
    label: "Commercial",
  },
};

const FALLBACK = TYPE_CONFIG.apartment;

/* ─── types ───────────────────────────────────────────────── */
interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
  isHoverMode?: boolean;
}

/* ─── component ───────────────────────────────────────────── */
export default function PropertyPopup({ property, onClose, isHoverMode = false }: PropertyPopupProps) {
  const [mounted, setMounted] = useState(false);
  const prevProp = useRef<Property | null>(null);

  /* drag-to-dismiss */
  const startY = useRef<number | null>(null);
  const currentY = useRef(0);

  const visible = property !== null;

  useEffect(() => { setMounted(true); }, []);

  if (property) prevProp.current = property;
  const display = property ?? prevProp.current;

  /* ESC key */
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    currentY.current = e.touches[0].clientY - startY.current;
  };
  const handleTouchEnd = () => {
    if (currentY.current > 100) onClose();
    startY.current = null;
    currentY.current = 0;
  };

  if (!mounted || !display) return null;

  const cfg = TYPE_CONFIG[display.type] ?? FALLBACK;
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        className="fixed inset-0"
        style={{
          zIndex: 99990,
          background: visible
            ? "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)"
            : "transparent",
          pointerEvents: visible ? "auto" : "none",
          opacity: visible ? 1 : 0,
          transition: `opacity ${isHoverMode ? "0.2s" : "0.4s"} ease-in-out`,
        }}
      />

      {/* ── Sheet ── */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="fixed bottom-0 left-1/2"
        style={{
          transform: `translateX(-50%) translateY(${visible ? "0" : "100%"})`,
          width: isMobile ? "100vw" : "520px",
          zIndex: 99999,
          transition: `transform ${isHoverMode ? "0.25s" : "0.42s"} cubic-bezier(${isHoverMode ? "0.4, 0, 0.2, 1" : "0.32, 0.72, 0, 1"})`,

          /* glossy dark surface */
          background:
            "linear-gradient(160deg, rgba(15,17,28,0.97) 0%, rgba(8,10,20,0.99) 100%)",
          backdropFilter: "blur(24px)",
          borderRadius: "24px 24px 0 0",
          border: `1px solid ${cfg.neon}33`,
          borderBottom: "none",
          boxShadow: `${cfg.glow}, inset 0 1px 0 ${cfg.neon}22`,
          padding: isMobile ? "20px 16px 32px" : "28px 28px 40px",
        }}
      >
        {/* ── Drag handle ── */}
        <div className="flex justify-center mb-4">
          <div
            className="rounded-full"
            style={{
              width: 40,
              height: 4,
              background: `${cfg.neon}55`,
              boxShadow: `0 0 8px ${cfg.neon}66`,
            }}
          />
        </div>

        {/* ── Header row ── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Type badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${cfg.badge}`}
            style={{ boxShadow: `0 0 10px ${cfg.neon}33` }}
          >
            {cfg.icon}
            {cfg.label}
          </span>

          {/* Close */}
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              width: 32,
              height: 32,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Title ── */}
        <h2
          className="font-bold leading-snug mb-1"
          style={{
            fontSize: isMobile ? 20 : 22,
            color: "#ffffff",
            textShadow: `0 0 30px ${cfg.neon}44`,
          }}
        >
          {display.title}
        </h2>

        {/* ── Location ── */}
        <p
          className="flex items-center gap-1.5 text-sm mb-4"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          <MapPin size={13} style={{ color: cfg.neon }} />
          {display.district}
        </p>

        {/* ── Divider ── */}
        <div
          className="mb-4"
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${cfg.neon}44 0%, transparent 100%)`,
          }}
        />

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Price */}
          <div
            className="rounded-2xl p-3 flex flex-col gap-1"
            style={{
              background: `${cfg.neon}0d`,
              border: `1px solid ${cfg.neon}22`,
              boxShadow: `inset 0 0 14px ${cfg.neon}0a`,
            }}
          >
            <span
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest"
              style={{ color: cfg.neon, opacity: 0.7 }}
            >
              <IndianRupee size={11} />
              Price
            </span>
            <span className="font-bold text-white text-base leading-tight">
              ₹{display.price}
            </span>
          </div>

          {/* Size */}
          <div
            className="rounded-2xl p-3 flex flex-col gap-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <span
              className="flex items-center gap-1 text-xs font-medium uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              <Ruler size={11} />
              Size
            </span>
            <span className="font-bold text-white text-base leading-tight">
              {display.size}
            </span>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}