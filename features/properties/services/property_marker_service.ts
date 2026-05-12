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
   * Create a marker DOM element with lucide icon
   */
  private createMarkerElement(property: Property, isActive: boolean = false) {
    const el = document.createElement("div");
    el.className = "property-marker-container";

    // Get color based on property type
    const typeColorMap: Record<Property["type"], string> = {
      house: "#00FF88",
      apartment: "#00DDFF",
      "agriculture land": "#88FF00",
      "commercial space": "#FF6B00",
      "commercial plots": "#FFD700",
      site: "#FF00FF",
    };

    // Get icon name and label based on type
    const typeIconMap: Record<Property["type"], string> = {
      house: "🏠",
      apartment: "🏢",
      "agriculture land": "🌳",
      "commercial space": "🛒",
      "commercial plots": "📊",
      site: "📍",
    };

    const color = typeColorMap[property.type] || "#FFFFFF";
    const icon = typeIconMap[property.type] || "📍";

    el.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: ${isActive ? "48px" : "40px"};
        height: ${isActive ? "48px" : "40px"};
        border-radius: 50%;
        background: rgba(0, 0, 0, ${isActive ? "0.8" : "0.5"});
        border: 2px solid ${isActive ? color : "rgba(255, 255, 255, 0.4)"};
        backdrop-filter: blur(12px);
        cursor: pointer;
        font-size: ${isActive ? "20px" : "16px"};
        transition: all 0.2s ease;
        box-shadow: ${
          isActive
            ? `0 0 24px ${color}80, 0 0 12px ${color}40`
            : "0 4px 12px rgba(0, 0, 0, 0.3)"
        };
        transform: ${isActive ? "scale(1.1)" : "scale(1)"};
      ">
        ${icon}
      </div>
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
