"use client";
import { MapCanvasLoader } from "@/features/map/components/MapCanvasLoader";
import { AppSidebar } from "@/shared/components/sidebar";

export default function HomePage() {
  return (
    <main className="w-screen h-screen bg-black flex">
      <AppSidebar />
      <div className="relative h-screen flex-1 overflow-hidden">
        <MapCanvasLoader />
      </div>
    </main>
  );
}
