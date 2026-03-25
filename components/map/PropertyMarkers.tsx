// // import maplibregl from "maplibre-gl";

// // export function addPropertyMarkers(
// //   map: maplibregl.Map,
// //   properties: any[],
// //   onClick?: (prop: any) => void,
// // ) {
// //   const markers: maplibregl.Marker[] = [];

// //   properties.forEach((prop) => {
// //     const el = document.createElement("div");
// //     el.className = "property-marker";

// //     el.innerHTML = `
// //       <div class="pm-icon">${
// //         prop.type === "house" ? "🏠" : prop.type === "land" ? "🌱" : "🏗️"
// //       }</div>
// //       <div class="pm-pulse"></div>
// //     `;

// //     const marker = new maplibregl.Marker(el)
// //       .setLngLat([prop.lng, prop.lat])
// //       .addTo(map);

// //     el.addEventListener("click", (e) => {
// //       e.stopPropagation();
// //       console.log("MARKER CLICKED", prop);
// //       if (onClick) onClick(prop);
// //     });

// //     markers.push(marker);
// //   });

// //   return markers;
// // }

// import maplibregl from "maplibre-gl";

// export function addPropertyMarkers(
//   map: maplibregl.Map,
//   properties: any[],
//   onClick?: (prop: any) => void,
// ) {
//   const markers: maplibregl.Marker[] = [];

//   properties.forEach((prop) => {
//     const el = document.createElement("div");

//     // 🎯 Color based on type
//     let color = "#22c55e"; // house = green
//     if (prop.type === "land") color = "#ef4444"; // red
//     if (prop.type === "site") color = "#eab308"; // yellow

//     el.style.width = "18px";
//     el.style.height = "18px";
//     el.style.borderRadius = "50%";
//     el.style.background = color;
//     el.style.boxShadow = `0 0 12px ${color}`;
//     el.style.cursor = "pointer";
//     el.style.transition = "transform 0.2s";

//     // ✨ Hover effect
//     el.onmouseenter = () => {
//       el.style.transform = "scale(1.4)";
//     };
//     el.onmouseleave = () => {
//       el.style.transform = "scale(1)";
//     };

//     const marker = new maplibregl.Marker(el)
//       .setLngLat([prop.lng, prop.lat])
//       .addTo(map);

//     el.addEventListener("click", (e) => {
//       e.stopPropagation();
//       console.log("MARKER CLICKED:", prop);
//       onClick?.(prop);
//     });

//     markers.push(marker);
//   });

//   return markers;
// }

import maplibregl from "maplibre-gl";

export function addPropertyMarkers(
  map: maplibregl.Map,
  properties: any[],
  onClick?: (prop: any) => void,
) {
  const markers: maplibregl.Marker[] = [];

  properties.forEach((prop) => {
    const el = document.createElement("div");

    let color = "#22c55e";
    if (prop.type === "land") color = "#ef4444";
    if (prop.type === "site") color = "#eab308";

    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.background = color;
    el.style.border = "2px solid white";
    el.style.boxShadow = `0 0 12px ${color}`;
    el.style.cursor = "pointer";
    el.style.transition = "all 0.2s";

    el.onmouseenter = () => {
      el.style.transform = "scale(1.4)";
      el.style.boxShadow = `0 0 20px ${color}`;
    };

    el.onmouseleave = () => {
      el.style.transform = "scale(1)";
      el.style.boxShadow = `0 0 12px ${color}`;
    };

    const marker = new maplibregl.Marker(el)
      .setLngLat([prop.lng, prop.lat])
      .addTo(map);

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick?.(prop);
    });

    markers.push(marker);
  });

  return markers;
}
