"use client";

import { MapCanvasLoader } from "@/features/map/components/MapCanvasLoader";
import LoadingScreen from "@/shared/components/LoadingScreen";
import { AppSidebar } from "@/shared/components/sidebar";
import { useState } from "react";

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <main className="w-screen h-screen bg-black flex">
      <AppSidebar />

      <div className="relative h-screen flex-1 overflow-hidden">
        <MapCanvasLoader setIsLoaded={setIsLoaded} />

        <div className="">
          <LoadingScreen isLoaded={isLoaded} />
        </div>
      </div>
    </main>
  );
}