"use client";

import dynamic from "next/dynamic";

const MapCanvas = dynamic(
  () => import("./Map_canvas").then((m) => m.MapCanvas),
  {
    ssr: false,
  }
);

interface Props {
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapCanvasLoader({ setIsLoaded }: Props) {
  return <MapCanvas setIsLoaded={setIsLoaded} />;
}