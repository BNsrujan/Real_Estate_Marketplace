import maplibregl from "maplibre-gl";
import type { Property } from "@/shared/types";

const SOURCE_ID = "property-markers-source";
const LAYER_ID = "property-markers-layer";

/**
 * Renders property markers using a GeoJSON source and symbol layer for perfect sync and UI design.
 */
export function addPropertyMarkers(
  map: maplibregl.Map,
  properties: Property[],
  onClick?: (property: Property) => void,
): maplibregl.Marker[] {
  if (!map) return [];

  // Helper to create pin image if it doesn't exist
  const ensurePinImage = async (type: string, color: string) => {
    const imgId = `sync-pin-${type}`;
    if (map.hasImage(imgId)) return imgId;

    const width = 40;
    const height = 40;
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);

    const cx = width / 2;
    const headSize = 33;
    const r = headSize / 2;
    const cy = r;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx - 12, headSize * 0.7);
    ctx.lineTo(cx + 12, headSize * 0.7);
    ctx.lineTo(cx, height);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
    ctx.fill();

    const img = await new Promise<HTMLImageElement>((resolve) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.src = canvas.toDataURL();
    });

    if (!map.hasImage(imgId)) {
      map.addImage(imgId, img, { pixelRatio: 2 });
    }
    return imgId;
  };

  const TYPE_COLORS: Record<string, string> = {
    house: "#10B981",
    apartment: "#3B82F6",
    "agriculture land": "#6FCF97",
    "commercial space": "#F59E0B",
    "commercial plots": "#EC4899",
    site: "#8B5CF6",
  };

  // 1. Ensure Source exists
  let source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
  if (!source) {
    map.addSource(SOURCE_ID, {
      type: "geojson",
      data: { type: "FeatureCollection", features: [] },
    });
    source = map.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
  }

  // 2. Update data
  source.setData({
    type: "FeatureCollection",
    features: properties.map((p) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      properties: { ...p },
    })),
  });

  // 3. Ensure Images and Layer exist
  const init = async () => {
    for (const [type, color] of Object.entries(TYPE_COLORS)) {
      await ensurePinImage(type, color);
    }

    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: "symbol",
        source: SOURCE_ID,
        layout: {
          "icon-image": ["concat", "sync-pin-", ["get", "type"]],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-anchor": "bottom",
        },
      });

      map.on("click", LAYER_ID, (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties as Property;
          onClick?.(props);
        }
      });

      map.on("mouseenter", LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
    }
  };

  init();

  return [];
}
