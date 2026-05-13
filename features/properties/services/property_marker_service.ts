import maplibregl from "maplibre-gl";
import type { Property } from "@/shared/types";

export class PropertyMarkerService {
  private markers: Map<string, maplibregl.Marker> = new Map();
  private map: maplibregl.Map | null = null;

  constructor(map: maplibregl.Map) {
    this.map = map;
    this.injectStyles();
  }

  /** Inject keyframes + utility classes that Tailwind can't generate dynamically */
  private injectStyles() {
    if (document.getElementById("property-marker-styles")) return;
    const style = document.createElement("style");
    style.id = "property-marker-styles";
    style.textContent = `
      @keyframes pulse-ring {
        0%   { transform: scale(1);    opacity: 0.6; }
        50%  { transform: scale(1.5);  opacity: 0.2; }
        100% { transform: scale(2);    opacity: 0;   }
      }
      @keyframes marker-pop {
        0%   { transform: scale(0.5); opacity: 0; }
        70%  { transform: scale(1.1); }
        100% { transform: scale(1);   opacity: 1; }
      }
      .marker-pop      { animation: marker-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      .pulse-ring      { animation: pulse-ring 1.8s ease-out infinite; }
      .marker-hover:hover { transform: scale(1.15) !important; z-index: 999 !important; }
    `;
    document.head.appendChild(style);
  }

  private getTypeConfig(type: Property["type"]): { color: string; icon: string; label: string } {
    const config: Record<Property["type"], { color: string; icon: string; label: string }> = {
      house:             { color: "#10B981", icon: "🏘️", label: "House"       },
      apartment:         { color: "#3B82F6", icon: "🏗️", label: "Apt"         },
      "agriculture land":{ color: "#6FCF97", icon: "🌾", label: "Agri"        },
      "commercial space":{ color: "#F59E0B", icon: "🏭", label: "Commercial"  },
      "commercial plots":{ color: "#EC4899", icon: "📐", label: "Plot"        },
      site:              { color: "#8B5CF6", icon: "📍", label: "Site"        },
    };
    return config[type] ?? { color: "#FFFFFF", icon: "📍", label: "Property" };
  }

  private createMarkerElement(property: Property, isActive = false): HTMLElement {
    const { color, icon, label } = this.getTypeConfig(property.type);

    const wrapper = document.createElement("div");
    wrapper.className = "select-none";
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      width: ${isActive ? "56px" : "44px"};
      height: ${isActive ? "56px" : "44px"};
    `;

    // ── Pulse ring (active only) ──────────────────────────────────────────
    if (isActive) {
      const ring = document.createElement("div");
      ring.className = "pulse-ring absolute rounded-full pointer-events-none";
      ring.style.cssText = `
        width: 100px; height: 100px;
        border: 2px solid ${color};
        top: 50%; left: 50%;
        transform-origin: center;
        margin-top: -50px; margin-left: -50px;
      `;
      wrapper.appendChild(ring);
    }

    // ── Main bubble ───────────────────────────────────────────────────────
    const bubble = document.createElement("div");
    bubble.className = [
      "marker-bubble marker-pop",
      "relative flex items-center justify-center",
      "rounded-full backdrop-blur-xl",
      "transition-all duration-300 ease-out",
      "marker-hover",
    ].join(" ");

    const size = isActive ? 56 : 44;
    bubble.style.cssText = `
      width: ${size}px; height: ${size}px;
      background: linear-gradient(135deg, rgba(30,41,59,0.97) 0%, rgba(15,23,42,0.99) 100%);
      border: 2px solid ${isActive ? color : "rgba(255,255,255,0.18)"};
      box-shadow: ${
        isActive
          ? `0 0 0 4px ${color}30, 0 0 24px ${color}60, 0 16px 40px rgba(0,0,0,0.6)`
          : `0 8px 24px rgba(0,0,0,0.45), 0 0 16px ${color}25`
      };
      z-index: 2;
    `;

    // icon
    const iconEl = document.createElement("div");
    iconEl.className = "transition-transform duration-300";
    iconEl.style.cssText = `
      font-size: ${isActive ? "22px" : "18px"};
      filter: drop-shadow(0 0 5px ${color}90);
      transform: ${isActive ? "scale(1.1)" : "scale(1)"};
    `;
    iconEl.textContent = icon;
    bubble.appendChild(iconEl);

    // active center dot
    if (isActive) {
      const dot = document.createElement("div");
      dot.className = "absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900";
      dot.style.background = color;
      bubble.appendChild(dot);
    }

    wrapper.appendChild(bubble);

    // ── Price tag ─────────────────────────────────────────────────────────
    const tag = document.createElement("div");
    tag.className = [
      "absolute px-2 py-0.5 rounded-full",
      "text-[10px] font-semibold tracking-wide",
      "backdrop-blur-md border whitespace-nowrap",
      "transition-all duration-300",
    ].join(" ");
    tag.style.cssText = `
      top: 100%;
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background: rgba(15,23,42,0.88);
      border-color: ${isActive ? color : "rgba(255,255,255,0.12)"};
      color: ${isActive ? color : "rgba(255,255,255,0.75)"};
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      z-index: 1;
    `;
    tag.textContent = property.price ?? label;
    wrapper.appendChild(tag);

    return wrapper;
  }

  addMarkers(
    properties: Property[],
    onMarkerClick?: (prop: Property) => void,
    onMarkerHover?: (prop: Property) => void,
    onMarkerLeave?: () => void,
  ) {
    if (!this.map) return;
    this.clearMarkers();

    properties.forEach((property) => {
      const el = this.createMarkerElement(property);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([property.lng, property.lat])
        .addTo(this.map!);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClick?.(property);
      });

      el.addEventListener("mouseenter", (e) => {
        e.stopPropagation();
        onMarkerHover?.(property);
      });

      el.addEventListener("mouseleave", (e) => {
        e.stopPropagation();
        onMarkerLeave?.();
      });

      this.markers.set(property.id, marker);
    });
  }

  updateMarkerActive(propertyId: string, isActive: boolean) {
    const marker = this.markers.get(propertyId);
    if (!marker) return;
    const el = marker.getElement();

    // find the bubble
    const bubble = el.querySelector<HTMLElement>(".marker-bubble");
    if (bubble) {
      bubble.style.transform = isActive ? "scale(1.15)" : "scale(1)";
      bubble.style.zIndex    = isActive ? "999" : "1";
    }
    el.style.zIndex = isActive ? "9999" : "1";
  }

  clearMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers.clear();
  }

  removeMarker(propertyId: string) {
    const marker = this.markers.get(propertyId);
    if (marker) {
      marker.remove();
      this.markers.delete(propertyId);
    }
  }

  getMarkers() {
    return Array.from(this.markers.values());
  }

  dispose() {
    this.clearMarkers();
    this.map = null;
  }
}
