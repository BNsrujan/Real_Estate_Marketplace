import maplibregl from "maplibre-gl";
import type { Property } from "@/shared/types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────


const PIN = {
  width:      40,
  height:     40,
  headSize:   33,  
  iconSize:   15,  // icon inside the head
} as const;

const PIN_ACTIVE = {
  width:      48,
  height:     62,
  headSize:   48,
  iconSize:   24,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────────────────

const ICONS = {
  house: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`,

  apartment: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
      <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
    </svg>`,

  "agriculture land": `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M7 20h10"/>
      <path d="M10 20c5.5-2.5.8-6.4 3-10"/>
      <path d="M9.5 9.4c1.1.9 1.8 2.5 1.8 4.1 0 .4-.3.8-.7.8-1.5 0-3-1.2-3.9-2.3-.3-.3-.3-.8 0-1.1 1.2-1.2 2.8-1.5 4.3-1.5Z"/>
      <path d="M14.1 6a7 7 0 0 0-1.1 4c0 .2.2.3.4.3a4.6 4.6 0 0 0 4-2.4c.3-.4.1-1.1-.3-1.3A6.5 6.5 0 0 0 14.1 6Z"/>
    </svg>`,

  "commercial space": `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>
    </svg>`,

  "commercial plots": `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>
    </svg>`,

  site: `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Property Type Config  (color, icon, label per type)
// ─────────────────────────────────────────────────────────────────────────────

type TypeConfig = { color: string; icon: string; label: string };

const TYPE_CONFIG: Record<Property["type"], TypeConfig> = {
  house:              { color: "#10B981", icon: ICONS.house,              label: "House"      },
  apartment:          { color: "#3B82F6", icon: ICONS.apartment,          label: "Apt"        },
  "agriculture land": { color: "#6FCF97", icon: ICONS["agriculture land"], label: "Agri"       },
  "commercial space": { color: "#F59E0B", icon: ICONS["commercial space"], label: "Commercial" },
  "commercial plots": { color: "#EC4899", icon: ICONS["commercial plots"], label: "Plot"       },
  site:               { color: "#8B5CF6", icon: ICONS.site,               label: "Site"       },
};

const FALLBACK_CONFIG: TypeConfig = { color: "#FFFFFF", icon: ICONS.site, label: "Property" };

function getTypeConfig(type: Property["type"]): TypeConfig {
  return TYPE_CONFIG[type] ?? FALLBACK_CONFIG;
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS Injection  (keyframes and utility classes Tailwind can't handle)
// ─────────────────────────────────────────────────────────────────────────────

function injectMarkerStyles() {
  const STYLE_ID = "property-marker-styles";
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes marker-pop {
      0%   { transform: scale(0.5); opacity: 0; }
      70%  { transform: scale(1.1);             }
      100% { transform: scale(1);   opacity: 1; }
    }
    @keyframes pulse-ring {
      0%   { transform: scale(1);   opacity: 0.5; }
      100% { transform: scale(2.2); opacity: 0;   }
    }
    .marker-pop        { animation: marker-pop 0.25s cubic-bezier(0.34,1.56,0.64,1) forwards; }
    .marker-pulse-ring { animation: pulse-ring 1.6s ease-out infinite; }
    .marker-pin:hover  { transform: scale(1.12) !important; z-index: 999 !important; }
  `;
  document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────────────────────
// Marker Element Builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Google Maps-style pin shape, drawn as an inline SVG.
 * It's a circle (head) with a downward-pointing triangle tail beneath it.
 * The anchor point (tip) sits at the very bottom centre.
 */
function buildPinSvg(color: string, isActive: boolean): SVGElement {
  const { width, height, headSize } = isActive ? PIN_ACTIVE : PIN;
  const cx = width / 2;          // horizontal centre
  const cy = headSize / 2;       // vertical centre of the head circle
  const r  = headSize / 2 - 1;   // radius (1px inset so the stroke isn't clipped)

  // Triangle tail: left corner, right corner, tip
  const tailLeft  = cx - 12;
  const tailRight = cx + 12;
  const tailTip   = height;
  const tailTop   = headSize * 0.72; // slight gap between head and tail to make it look nicer

  const ns  = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("xmlns",   ns);
  svg.setAttribute("width",   String(width));
  svg.setAttribute("height",  String(height));
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.style.overflow = "visible";

  // ── Tail (triangle) ──────────────────────────────────────────────────────
  const tail = document.createElementNS(ns, "polygon");
  tail.setAttribute("points", `${tailLeft},${tailTop} ${tailRight},${tailTop} ${cx},${tailTip}`);
  tail.setAttribute("fill", color);

  // ── Head (filled circle) ─────────────────────────────────────────────────
  const head = document.createElementNS(ns, "circle");
  head.setAttribute("cx",     String(cx));
  head.setAttribute("cy",     String(cy));
  head.setAttribute("r",      String(r));
  head.setAttribute("fill",   color);

  // ── White inner circle (gives the icon a clean background) ───────────────
  const inner = document.createElementNS(ns, "circle");
  inner.setAttribute("cx",   String(cx));
  inner.setAttribute("cy",   String(cy));
  inner.setAttribute("r",    String(r - 4));
  inner.setAttribute("fill", "#ffffff");

  svg.appendChild(tail);
  svg.appendChild(head);
  svg.appendChild(inner);
  return svg;
}

/** Icon centred inside the pin head */
function buildIconElement(icon: string, color: string, isActive: boolean): HTMLElement {
  const { headSize, iconSize } = isActive ? PIN_ACTIVE : PIN;
  const cx = (isActive ? PIN_ACTIVE.width : PIN.width) / 2;

  const iconEl = document.createElement("div");
  iconEl.style.cssText = `
    position: absolute;
    top: ${(headSize - iconSize) / 2}px;
    left: ${cx - iconSize / 2}px;
    width: ${iconSize}px;
    height: ${iconSize}px;
    color: ${color};
    pointer-events: none;
  `;
  iconEl.innerHTML = icon;

  const svg = iconEl.querySelector<SVGElement>("svg");
  if (svg) { svg.style.width = "100%"; svg.style.height = "100%"; }

  return iconEl;
}

/**
 * Subtle pulsing ring shown below the active pin.
 * Rendered as a flat circle at ground level (where the tip meets the map).
 */
function buildPulseRing(color: string, isActive: boolean): HTMLElement {
  const { width, height } = isActive ? PIN_ACTIVE : PIN;
  const cx = width / 2;

  const ring = document.createElement("div");
  ring.className = "marker-pulse-ring";
  ring.style.cssText = `
    position: absolute;
    width: 15px; height: 6px;
    border-radius: 50%;
    background: ${color};
    opacity: 0.45;
    top: ${height - 3}px;
    left: ${cx - 6}px;
    pointer-events: none;
    transform-origin: center;
  `;
  return ring;
}

/**
 * Outer wrapper — purely for MapLibre to position.
 * MapLibre's anchor is set to "bottom" so the tip aligns with the coordinate.
 */
function buildWrapper(isActive: boolean): HTMLElement {
  const { width, height } = isActive ? PIN_ACTIVE : PIN;

  const wrapper = document.createElement("div");
  wrapper.className = "select-none marker-pin-container";
  wrapper.style.cssText = `
    position: relative;
    width: ${width}px;
    height: ${height}px;
  `;

  // Inner wrapper for animations and active scaling
  // This avoids clobbering MapLibre's positioning transform on the outer wrapper
  const inner = document.createElement("div");
  inner.className = "marker-inner-wrapper marker-pop";
  inner.style.cssText = `
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  `;
  
  wrapper.appendChild(inner);
  return wrapper;
}

/** Assembles all parts into the final marker DOM element */
function createMarkerElement(property: Property, isActive = false): HTMLElement {
  const { color, icon } = getTypeConfig(property.type);

  const wrapper = buildWrapper(isActive);
  const inner = wrapper.querySelector(".marker-inner-wrapper")!;

  inner.appendChild(buildPinSvg(color, isActive));
  inner.appendChild(buildIconElement(icon, color, isActive));
  if (isActive) inner.appendChild(buildPulseRing(color, isActive));

  return wrapper;
}

// ─────────────────────────────────────────────────────────────────────────────
// PropertyMarkerService
// ─────────────────────────────────────────────────────────────────────────────

export class PropertyMarkerService {
  private map: maplibregl.Map | null;
  private markers: Map<string, maplibregl.Marker> = new Map();

  constructor(map: maplibregl.Map) {
    this.map = map;
    injectMarkerStyles();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Renders all properties on the map and wires up interaction callbacks. */
  addMarkers(
    properties: Property[],
    onMarkerClick?: (property: Property) => void,
    onMarkerHover?: (property: Property) => void,
    onMarkerLeave?: () => void,
  ) {
    if (!this.map) return;
    this.clearMarkers();

    for (const property of properties) {
      const el     = createMarkerElement(property);
      const marker = this.placeMarker(el, property);

      this.attachEvents(el, property, { onMarkerClick, onMarkerHover, onMarkerLeave });
      this.markers.set(property.id, marker);
    }
  }

  /** Visually highlights or un-highlights a single marker. */
  updateMarkerActive(propertyId: string, isActive: boolean) {
    const marker = this.markers.get(propertyId);
    if (!marker) return;

    const el = marker.getElement();
    const inner = el.querySelector<HTMLElement>(".marker-inner-wrapper");
    if (inner) {
      inner.style.transform = isActive ? "scale(1.2)"  : "scale(1)";
      el.style.zIndex    = isActive ? "9999"        : "1";
    }
  }

  clearMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
  }

  removeMarker(propertyId: string) {
    this.markers.get(propertyId)?.remove();
    this.markers.delete(propertyId);
  }

  getMarkers() {
    return Array.from(this.markers.values());
  }

  dispose() {
    this.clearMarkers();
    this.map = null;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private placeMarker(el: HTMLElement, property: Property): maplibregl.Marker {
    // anchor: "bottom" keeps the pin tip exactly on the coordinate
    return new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([property.lng, property.lat])
      .addTo(this.map!);
  }

  private attachEvents(
    el: HTMLElement,
    property: Property,
    callbacks: {
      onMarkerClick?: (p: Property) => void;
      onMarkerHover?: (p: Property) => void;
      onMarkerLeave?: () => void;
    },
  ) {
    const stop = (e: Event) => e.stopPropagation();

    el.addEventListener("click",      (e) => { stop(e); callbacks.onMarkerClick?.(property); });
    el.addEventListener("mouseenter", (e) => { stop(e); callbacks.onMarkerHover?.(property); });
    el.addEventListener("mouseleave", (e) => { stop(e); callbacks.onMarkerLeave?.();         });
  }
}