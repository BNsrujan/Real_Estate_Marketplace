import maplibregl from "maplibre-gl";

export function addPropertyMarkers(
  map: maplibregl.Map,
  properties: any[],
  onClick?: (prop: any) => void,
) {
  const markers: maplibregl.Marker[] = [];

  properties.forEach((prop) => {
    const el = document.createElement("div");
    el.className = "property-marker";

    el.innerHTML = `
      <div class="pm-icon">${
        prop.type === "house" ? "🏠" : prop.type === "land" ? "🌱" : "🏗️"
      }</div>
      <div class="pm-pulse"></div>
    `;

    const marker = new maplibregl.Marker(el)
      .setLngLat([prop.lng, prop.lat])
      .addTo(map);

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (onClick) onClick(prop);
    });

    markers.push(marker);
  });

  return markers;
}
