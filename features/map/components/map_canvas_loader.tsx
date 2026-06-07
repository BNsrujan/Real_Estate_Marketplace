"use client";

import dynamic from "next/dynamic";
import { ErrorBoundary } from "@/shared/components/common/error_boundary";

const MapCanvas = dynamic(
  () => import("./Map_canvas").then((m) => m.MapCanvas),
  {
    ssr: false,
  }
);

interface Props {
  setIsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
}

function MapCanvasFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
      <div className="max-w-sm px-6 text-center">
        <h2 className="text-lg font-semibold">Map unavailable</h2>
        <p className="mt-2 text-sm text-zinc-400">
          The map failed to load. Refresh the page to try again.
        </p>
      </div>
    </div>
  );
}

export function MapCanvasLoader({ setIsLoaded }: Props) {
  return (
    <ErrorBoundary fallback={<MapCanvasFallback />} onError={() => setIsLoaded(true)}>
      <MapCanvas setIsLoaded={setIsLoaded} />
    </ErrorBoundary>
  );
}
