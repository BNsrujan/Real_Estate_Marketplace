import mapboxgl from "mapbox-gl";
import type { Property } from "@/shared/types";

const SOURCE_ID = "properties-source";
const LAYER_ID = "properties-symbol-layer";
const ACTIVE_LAYER_ID = "properties-active-symbol-layer";

const INK = "#1a1814";
const PARCHMENT = "#f4efe4";
const VERMILION = "#c4442a";

const TYPE_ICON_PATH: Record<Property["type"], string> = {
  house: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22 9 12 15 12 15 22",
  villa: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22 9 12 15 12 15 22",
  apartment:
    "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",
  agriculture:
    "M7 20h10 M10 20c5.5-2.5.8-6.4 3-10 M9.5 9.4c1.1.9 1.8 2.5 1.8 4.1 0 .4-.3.8-.7.8-1.5 0-3-1.2-3.9-2.3-.3-.3-.3-.8 0-1.1 1.2-1.2 2.8-1.5 4.3-1.5Z M14.1 6a7 7 0 0 0-1.1 4c0 .2.2.3.4.3a4.6 4.6 0 0 0 4-2.4c.3-.4.1-1.1-.3-1.3A6.5 6.5 0 0 0 14.1 6Z",
  commercial_space:
    "M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M17 18h1 M12 18h1 M7 18h1",
  commercial_plot:
    "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z M3 9h18 M3 15h18 M9 3v18 M15 3v18",
  site: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  plot: "M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z M3 9h18 M3 15h18 M9 3v18 M15 3v18",
};

const TYPE_CONFIG = Object.fromEntries(
  Object.entries(TYPE_ICON_PATH).map(([type, iconPath]) => [
    type,
    { color: INK, iconPath },
  ]),
) as Record<Property["type"], { color: string; iconPath: string }>;

// ─────────────────────────────────────────────────────────────────────────────
// PropertyMarkerService
// ─────────────────────────────────────────────────────────────────────────────

export class PropertyMarkerService {
  private map: mapboxgl.Map | null;
  private properties: Property[] = [];
  private onMarkerClick?: (property: Property) => void;
  private onMarkerHover?: (property: Property) => void;
  private onMarkerLeave?: () => void;
  private imagesLoaded = false;
  private readonly styleRef: unknown;
  private loadGeneration = 0;
  private ready: Promise<void>;
  private layerEventsBound = false;

  private readonly handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!e.features?.[0]) return;
    e.originalEvent.stopPropagation();
    const props = e.features[0].properties;
    const property = this.properties.find((p) => p.id === props?.id);
    if (property) this.onMarkerClick?.(property);
  };

  private readonly handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
    if (!this.map || !this.isCurrent()) return;
    this.map.getCanvas().style.cursor = "pointer";
    if (e.features && e.features[0]) {
      const props = e.features[0].properties;
      const property = this.properties.find((p) => p.id === props?.id);
      if (property) this.onMarkerHover?.(property);
    }
  };

  private readonly handleMouseLeave = () => {
    if (!this.map || !this.isCurrent()) return;
    this.map.getCanvas().style.cursor = "";
    this.onMarkerLeave?.();
  };

  constructor(map: mapboxgl.Map) {
    this.map = map;
    this.styleRef = this.getCurrentStyle();
    this.ready = this.init();
  }

  private async init(): Promise<void> {
    if (!this.map) return;

    const imagesLoaded = await this.loadMarkerImages();
    if (imagesLoaded && this.isCurrent()) {
      this.initLayers();
    }
  }

  private async loadMarkerImages(): Promise<boolean> {
    if (!this.map || this.imagesLoaded || !this.isCurrent()) return false;

    const map = this.map;
    const generation = ++this.loadGeneration;

    const isCurrentLoad = () => (
      generation === this.loadGeneration &&
      this.map === map &&
      this.isCurrent()
    );

    const promises = Object.entries(TYPE_CONFIG).map(async ([type, config]) => {
      const normalImg = await this.createPinImage(
        config.color,
        config.iconPath,
        34,
        40,
      );
      if (!isCurrentLoad()) return;

      const activeImg = await this.createPinImage(
        config.color,
        config.iconPath,
        44,
        58,
        true,
      );
      if (!isCurrentLoad()) return;

      const normalImageId = `pin-${type}`;
      const activeImageId = `pin-${type}-active`;

      if (!map.hasImage(normalImageId)) {
        map.addImage(normalImageId, normalImg, { pixelRatio: 2 });
      }
      if (!map.hasImage(activeImageId)) {
        map.addImage(activeImageId, activeImg, { pixelRatio: 2 });
      }
    });

    await Promise.all(promises);
    if (!isCurrentLoad()) return false;

    this.imagesLoaded = true;
    return true;
  }

  private getCurrentStyle(): unknown {
    return (this.map as { style?: unknown } | null)?.style;
  }

  private isCurrent(): boolean {
    return !!this.map && this.getCurrentStyle() === this.styleRef;
  }

  private getPropertySource(): mapboxgl.GeoJSONSource | null {
    const source = this.map?.getSource(SOURCE_ID);
    return source && "setData" in source ? (source as mapboxgl.GeoJSONSource) : null;
  }

  private createPinImage(
    color: string,
    iconPath: string,
    width: number,
    height: number,
    isActive = false,
  ): Promise<HTMLImageElement | ImageBitmap> {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ratio = 2;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(ratio, ratio);

      const cx = width / 2;
      const head = isActive ? 30 : 22;
      const stroke = isActive ? 1.75 : 1.25;
      const headTop = 1;
      const headBottom = headTop + head;
      const fill = isActive ? VERMILION : PARCHMENT;
      const mark = isActive ? PARCHMENT : color;

      ctx.strokeStyle = isActive ? VERMILION : INK;
      ctx.lineWidth = stroke;
      ctx.beginPath();
      ctx.moveTo(cx, headBottom);
      ctx.lineTo(cx, height - 1.5);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, height - 1.5, isActive ? 2.4 : 1.8, 0, Math.PI * 2);
      ctx.fillStyle = isActive ? VERMILION : INK;
      ctx.fill();

      ctx.fillStyle = fill;
      ctx.fillRect(cx - head / 2, headTop, head, head);
      ctx.strokeStyle = isActive ? VERMILION : INK;
      ctx.lineWidth = stroke;
      ctx.strokeRect(cx - head / 2, headTop, head, head);

      ctx.strokeStyle = mark;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const iconSize = isActive ? 16 : 12;
      ctx.save();
      ctx.translate(cx - iconSize / 2, headTop + head / 2 - iconSize / 2);
      ctx.scale(iconSize / 24, iconSize / 24);
      ctx.stroke(new Path2D(iconPath));
      ctx.restore();

      const img = new Image();
      img.onload = () => resolve(img);
      img.src = canvas.toDataURL();
    });
  }

  private initLayers() {
    if (!this.map || !this.isCurrent()) return;

    if (!this.map.getSource(SOURCE_ID)) {
      this.map.addSource(SOURCE_ID, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (this.map.getSource(SOURCE_ID) && !this.map.getLayer(LAYER_ID)) {
      this.map.addLayer({
        id: LAYER_ID,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "icon-image": ["concat", "pin-", ["get", "type"]],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
          "icon-offset": [0, 0],
        },
      });
    }

    if (this.map.getSource(SOURCE_ID) && !this.map.getLayer(ACTIVE_LAYER_ID)) {
      this.map.addLayer({
        id: ACTIVE_LAYER_ID,
        type: "symbol",
        source: SOURCE_ID,
        filter: ["==", ["get", "id"], ""],
        layout: {
          "icon-image": ["concat", "pin-", ["get", "type"], "-active"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
          "icon-offset": [0, 0],
        },
      });
    }

    if (!this.layerEventsBound) {
      this.map.on("click", LAYER_ID, this.handleClick);
      this.map.on("click", ACTIVE_LAYER_ID, this.handleClick);
      this.map.on("mouseenter", LAYER_ID, this.handleMouseEnter);
      this.map.on("mouseenter", ACTIVE_LAYER_ID, this.handleMouseEnter);
      this.map.on("mouseleave", LAYER_ID, this.handleMouseLeave);
      this.map.on("mouseleave", ACTIVE_LAYER_ID, this.handleMouseLeave);
      this.layerEventsBound = true;
    }
  }

  addMarkers(
    properties: Property[],
    onMarkerClick?: (property: Property) => void,
    onMarkerHover?: (property: Property) => void,
    onMarkerLeave?: () => void,
  ) {
    if (!this.map || !this.isCurrent()) return;
    this.properties = properties;
    this.onMarkerClick = onMarkerClick;
    this.onMarkerHover = onMarkerHover;
    this.onMarkerLeave = onMarkerLeave;

    const updateSource = () => {
      if (!this.map || !this.isCurrent()) return;
      const source = this.getPropertySource();
      if (source) {
        source.setData({
          type: "FeatureCollection",
          features: this.properties.map((p) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [Number(p.lng), Number(p.lat)],
            },
            properties: { ...p },
          })),
        });
      }
    };

    if (this.imagesLoaded) {
      updateSource();
    } else {
      void this.ready.then(() => {
        if (this.imagesLoaded) updateSource();
      });
    }
  }

  updateMarkerActive(propertyId: string, isActive: boolean) {
    if (!this.map || !this.isCurrent()) return;
    if (!this.map.getLayer(ACTIVE_LAYER_ID) || !this.map.getLayer(LAYER_ID)) return;
    if (isActive) {
      this.map.setFilter(ACTIVE_LAYER_ID, ["==", ["get", "id"], propertyId]);
      this.map.setFilter(LAYER_ID, ["!=", ["get", "id"], propertyId]);
    } else {
      this.map.setFilter(ACTIVE_LAYER_ID, ["==", ["get", "id"], ""]);
      this.map.setFilter(LAYER_ID, ["all"]);
    }
  }

  clearMarkers() {
    if (!this.map || !this.isCurrent()) return;
    const source = this.getPropertySource();
    if (source) {
      source.setData({ type: "FeatureCollection", features: [] });
    }
    this.properties = [];
  }

  hasMarkers(): boolean {
    return this.properties.length > 0;
  }

  dispose() {
    if (!this.map) return;
    this.loadGeneration++;
    if (this.layerEventsBound) {
      this.map.off("click", LAYER_ID, this.handleClick);
      this.map.off("click", ACTIVE_LAYER_ID, this.handleClick);
      this.map.off("mouseenter", LAYER_ID, this.handleMouseEnter);
      this.map.off("mouseenter", ACTIVE_LAYER_ID, this.handleMouseEnter);
      this.map.off("mouseleave", LAYER_ID, this.handleMouseLeave);
      this.map.off("mouseleave", ACTIVE_LAYER_ID, this.handleMouseLeave);
      this.layerEventsBound = false;
    }
    if (!(this.map as { style?: unknown }).style) {
      this.imagesLoaded = false;
      this.map = null;
      return;
    }
    if (this.map.getLayer(ACTIVE_LAYER_ID))
      this.map.removeLayer(ACTIVE_LAYER_ID);
    if (this.map.getLayer(LAYER_ID)) this.map.removeLayer(LAYER_ID);
    if (this.map.getSource(SOURCE_ID)) this.map.removeSource(SOURCE_ID);
    this.imagesLoaded = false;
    this.map = null;
  }
}
