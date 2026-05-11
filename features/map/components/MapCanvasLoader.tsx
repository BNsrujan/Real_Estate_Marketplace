"use client";

import dynamic from "next/dynamic";

const MapCanvas = dynamic(
  () => import("./MapCanvas").then((m) => m.MapCanvas),
  { ssr: false },
);

export function MapCanvasLoader() {
  return <MapCanvas />;
}
