import maplibregl from "maplibre-gl";

export function addPropertyMarkers(map: maplibregl.Map, properties: any[]) {
  const markers: maplibregl.Marker[] = [];

  properties.forEach((prop) => {
    const el = document.createElement("div");
    el.className = "property-marker";

    el.innerHTML = `
      <div style="
        background:${prop.type === "house" ? "#00ff9d" : "#ffcc00"};
        padding:8px;
        border-radius:50%;
        box-shadow:0 0 12px rgba(0,255,255,0.8);
        font-size:14px;
      ">
        ${prop.type === "house" ? "🏠" : "🌱"}
      </div>
    `;

    const popup = new maplibregl.Popup({
      offset: 25,
      closeButton: false,
    }).setHTML(`
      <div style="color:white;font-family:Orbitron">
        <b>${prop.title}</b><br/>
        ₹${prop.price}<br/>
        ${prop.size}
      </div>
    `);

    const marker = new maplibregl.Marker(el)
      .setLngLat([prop.lng, prop.lat])
      .setPopup(popup)
      .addTo(map);

    markers.push(marker);
  });

  return markers;
}
