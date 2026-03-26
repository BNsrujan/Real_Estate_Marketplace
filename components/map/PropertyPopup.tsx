"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Property } from "@/types";

const TYPE_ICON: Record<string, string> = {
  house: "🏠",
  land: "🌱",
  apartment: "🏢",
  commercial: "🏗️",
};

const TYPE_COLOR: Record<string, string> = {
  house: "#4ade80",
  land: "#facc15",
  apartment: "#38bdf8",
  commercial: "#fb923c",
};

interface PropertyPopupProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyPopup({
  property,
  onClose,
}: PropertyPopupProps) {
  const [mounted, setMounted] = useState(false);
  const prevProp = useRef<Property | null>(null);

  const startY = useRef<number | null>(null);
  const currentY = useRef(0);

  const visible = property !== null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (property) prevProp.current = property;
  const display = property ?? prevProp.current;

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, onClose]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    currentY.current = e.touches[0].clientY - startY.current;
  };

  const handleTouchEnd = () => {
    if (currentY.current > 100) {
      onClose();
    }
    startY.current = null;
    currentY.current = 0;
  };

  if (!mounted || !display) return null;

  const accent = TYPE_COLOR[display.type] ?? "#38bdf8";

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return createPortal(
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99990,
          background: visible
            ? "linear-gradient(to top, rgba(0,0,0,0.55), transparent)"
            : "transparent",
        }}
      />

      {/* POPUP */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: `translateX(-50%) translateY(${visible ? "0" : "100%"})`,
          width: isMobile ? "100vw" : "520px",
          zIndex: 99999,
          transition: "transform 0.4s ease",
          background: "#020617",
          borderRadius: "20px 20px 0 0",
          padding: isMobile ? "16px" : "24px",
        }}
      >
        {/* TITLE */}
        <h2
          style={{
            color: "#fff",
            fontSize: "18px",
            marginBottom: "8px",
            whiteSpace: "normal",
          }}
        >
          {display.title}
        </h2>

        {/* INFO */}
        <p style={{ color: "#aaa", fontSize: "13px" }}>📍 {display.district}</p>

        <div style={{ marginTop: "12px" }}>
          <p>💰 ₹{display.price}</p>
          <p>📐 {display.size}</p>
        </div>

        {/* CTA */}
        <a
          href={`/properties/${display.id}`}
          style={{
            display: "block",
            marginTop: "16px",
            textAlign: "center",
            padding: "12px",
            background: accent,
            borderRadius: "10px",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          View Details →
        </a>
      </div>
    </>,
    document.body,
  );
}
