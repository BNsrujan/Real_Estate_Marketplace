"use client";

import { MapCanvasLoader } from "@/features/map/components/map_canvas_loader";
import LoadingScreen from "@/shared/components/loading_screen";
import { AppSidebar } from "@/features/sidebar/sidebar";
import DetailPanel from "@/features/sidebarDetails/sidebar_detail_panel";
import { useState } from "react";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className="w-screen h-screen bg-black flex">
      <AppSidebar />
       <div className="hidden md:block pointer-events-auto">
         <DetailPanel  />
       </div>

      <div className="relative h-screen flex-1 overflow-hidden">
        <MapCanvasLoader setIsLoaded={setIsLoaded} />

        <div className="py-2">
          <LoadingScreen isLoaded={isLoaded} />
        </div>
      </div>
    </main>
  );
}