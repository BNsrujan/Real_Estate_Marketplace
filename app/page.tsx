import type { Metadata } from "next";
import { MapCanvasLoader } from "@/features/map/components/MapCanvasLoader";

export const metadata: Metadata = {
  title: "Namma Dharani — Real Estate Marketplace",
  description: "Explore properties across Karnataka on an interactive globe.",
};

export default function HomePage() {
  return (
    <main className="w-screen h-screen relative overflow-hidden bg-black">
      <MapCanvasLoader />
    </main>
  );
}
