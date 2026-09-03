"use client";

export const dynamic = "force-static";

import { MapCanvasLoader } from "@/features/map/components/map_canvas_loader";
import LoadingScreen from "@/shared/components/loading_screen";
import { AppSidebar } from "@/features/sidebar/sidebar";
import { DetailPanel } from "@/features/sidebar/components/sidebar_details";
import MobileBottomNav from "@/features/sidebar/components/mobile_bottom_nav";
import MobileBottomDrawer from "@/features/sidebar/components/mobile_bottom_drawer";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

const MAP_LOAD_TIMEOUT_MS = 8000;

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Arm a timeout the moment this page mounts; clear it once the map reports loaded.
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        setIsLoaded(true); // dismiss the loading screen anyway
        toast.warning("Map took too long to load. Try refreshing if tiles are missing.");
      }
    }, MAP_LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoaded = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoaded(true);
  }, []);

  return (
    <main className="w-screen h-screen bg-black flex">
      <AppSidebar />
      <DetailPanel />

      <div className="relative h-screen flex-1 overflow-hidden">
        <MapCanvasLoader setIsLoaded={handleLoaded} />

        <div className="py-2">
          <LoadingScreen isLoaded={isLoaded} />
        </div>
      </div>

      <MobileBottomNav />
      <MobileBottomDrawer />
    </main>
  );
}