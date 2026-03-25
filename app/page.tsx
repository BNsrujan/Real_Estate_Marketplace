import type { Metadata } from "next";
import { MapCanvasLoader } from "@/features/map/components/MapCanvasLoader";

export const metadata: Metadata = {
  title: "Namma Dharani — Real Estate Marketplace",
  description: "Explore properties across Karnataka on an interactive globe.",
};

export default function HomePage() {
  return (
    <main style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      <MapCanvasLoader />
    </main>
  );
}
