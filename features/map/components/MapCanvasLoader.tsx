"use client";

import dynamic from "next/dynamic";

// SSR must be disabled: MapLibre uses window/DOM APIs and Three.js uses WebGL.
// Placing this dynamic() call inside a "use client" file is the correct
// App Router pattern — it cannot live directly in a server component.
const MapCanvas = dynamic(
  () => import("./MapCanvas").then((m) => m.MapCanvas),
  { ssr: false },
);

export function MapCanvasLoader() {
  return <MapCanvas />;
}
