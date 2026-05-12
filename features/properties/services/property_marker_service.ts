import maplibregl from "maplibre-gl";
import type { Property } from "@/shared/types";

/**
 * Service to render property markers on the map using custom markers with lucide icons
 * Creates and manages DOM-based markers for each property with proper cleanup
 */
export class PropertyMarkerService {
  private markers: Map<string, maplibregl.Marker> = new Map();
  private map: maplibregl.Map | null = null;

  constructor(map: maplibregl.Map) {
    this.map = map;
  }

  /**
   * Create a marker DOM element with premium styling and icons
   */
  private createMarkerElement(property: Property, isActive: boolean = false) {
    const el = document.createElement("div");
    el.className = "property-marker-container";

    // Premium color palette
    const typeColorMap: Record<Property["type"], string> = {
      house: "#10B981",
      apartment: "#3B82F6",
      "agriculture land": "#6FCF97",
      "commercial space": "#F59E0B",
      "commercial plots": "#EC4899",
      site: "#8B5CF6",
    };

    // Better icon representations
    const typeIconMap: Record<Property["type"], string> = {
      house: "🏘️",
      apartment: "🏗️",
      "agriculture land": "🌾",
      "commercial space": "🏭",
      "commercial plots": "📐",
      site: "📍",
    };

    const color = typeColorMap[property.type] || "#FFFFFF";
    const icon = typeIconMap[property.type] || "📍";
    const size = isActive ? "56px" : "48px";
    const fontSize = isActive ? "24px" : "20px";

    el.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${size};
        height: ${size};
        border-radius: 50%;
        background: linear-gradient(135deg, rgba(51, 65, 85, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
        border: 2px solid ${isActive ? color : "rgba(255, 255, 255, 0.3)"};
        backdrop-filter: blur(16px);
        cursor: pointer;
        font-size: ${fontSize};
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: ${
          isActive
            ? `0 0 40px ${color}80, 0 0 20px ${color}40, inset 0 0 20px ${color}20, 0 20px 40px rgba(0, 0, 0, 0.5)`
            : `0 12px 32px rgba(0, 0, 0, 0.4), 0 0 20px ${color}40, 0 0 40px ${color}10`
        };
        transform: ${isActive ? "scale(1.3)" : "scale(1)"};
        border-radius: 50%;
        position: relative;
      ">
        <div style="
          filter: drop-shadow(0 0 6px ${color}80);
          transform: ${isActive ? "scale(1.2)" : "scale(1)"};
          transition: all 0.3s;
        ">
          ${icon}
        </div>
        ${
          isActive
            ? `<div style="
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid ${color};
          animation: pulse-ring 2s infinite;
          pointer-events: none;
        "></div>`
            : ""
        }
      </div>
      <style>
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 ${color}40;
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 12px transparent;
          }
          100% {
            box-shadow: 0 0 0 24px transparent;
            transform: scale(1);
          }
        }
      </style>
    `;

    el.style.cursor = "pointer";

    return el;
  }

  /**
   * Add markers for all properties
   */
  addMarkers(properties: Property[], onMarkerClick?: (prop: Property) => void) {
    if (!this.map) return;

    // Clear existing markers
    this.clearMarkers();

    properties.forEach((property) => {
      const el = this.createMarkerElement(property);

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([property.lng, property.lat])
        .addTo(this.map!);

      // Click handler
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onMarkerClick?.(property);
      });

      // Hover effect
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.15)";
        el.style.zIndex = "999";
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.zIndex = "1";
      });

      this.markers.set(property.id, marker);
    });
  }

  /**
   * Update a specific marker as active/inactive
   */
  updateMarkerActive(propertyId: string, isActive: boolean) {
    const marker = this.markers.get(propertyId);
    if (!marker) return;

    // Get the property data from the marker's LngLat
    const lngLat = marker.getLngLat();
    
    // We need to update the element
    // Since we can't easily get the property data here, we'll just update the visual state
    const el = marker.getElement();
    if (isActive) {
      el.style.transform = "scale(1.2)";
      el.style.zIndex = "9999";
    } else {
      el.style.transform = "scale(1)";
      el.style.zIndex = "1";
    }
  }

  /**
   * Remove all markers
   */
  clearMarkers() {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
  }

  /**
   * Remove a specific marker
   */
  removeMarker(propertyId: string) {
    const marker = this.markers.get(propertyId);
    if (marker) {
      marker.remove();
      this.markers.delete(propertyId);
    }
  }

  /**
   * Get all active markers
   */
  getMarkers() {
    return Array.from(this.markers.values());
  }

  /**
   * Clean up the service
   */
  dispose() {
    this.clearMarkers();
    this.map = null;
  }
}
