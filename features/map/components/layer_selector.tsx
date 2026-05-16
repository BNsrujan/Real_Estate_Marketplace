"use client";

import Image from "next/image";
import { useMemo } from "react";
import { Layers3 } from "lucide-react";
import { useStore } from "@/shared/store";
import type { LayerType } from "@/shared/types";

type LayerDef = {
  id: LayerType;
  name: string;
  image: string;
  color: string;
};

const MAP_LAYERS: LayerDef[] = [
  { id: "satellite", name: "Satellite", image: "/pics/layers/satellite.png", color: "from-emerald-400/20 to-green-500/10" },
  { id: "standard", name: "Standard",  image: "/pics/layers/standard.png",  color: "from-orange-400/20 to-red-500/10" },
  { id: "traffic",  name: "Traffic",   image: "/pics/layers/traffic.png",   color: "from-cyan-400/20 to-blue-500/10" },
  { id: "osm",      name: "OSM",       image: "/pics/layers/osm.png",       color: "from-purple-400/20 to-pink-500/10" },
];

interface MapLayerSelectorProps {
  onLayerChange?: (layer: LayerType) => void;
}

const MapLayerSelector = ({ onLayerChange }: MapLayerSelectorProps) => {
  const activeLayerType = useStore((s) => s.map.activeLayer);
  const setMap = useStore((s) => s.setMap);
  const isExpanded = useStore((s) => s.ui.isBottomSheetOpen);
  const setUI = useStore((s) => s.setUI);

  const activeLayer = MAP_LAYERS.find((l) => l.id === activeLayerType) ?? MAP_LAYERS[0];
  const otherLayers = useMemo(() => MAP_LAYERS.filter((l) => l.id !== activeLayer.id), [activeLayer]);

  const handleLayerChange = (layer: LayerDef) => {
    setMap({ activeLayer: layer.id });
    onLayerChange?.(layer.id);
    setTimeout(() => setUI({ isBottomSheetOpen: false }), 250);
  };

  const toggleExpanded = () => setUI({ isBottomSheetOpen: !isExpanded });

  return (
    <div className="relative w-full z-500 flex items-end gap-2 md:gap-4 flex-wrap md:flex-nowrap justify-start">
      <div className="relative flex items-end">
        <button
          onClick={toggleExpanded}
          className={`
            group relative overflow-hidden rounded-2xl md:rounded-3xl
            border border-white/10 bg-black/40 backdrop-blur-2xl
            shadow-[0_10px_50px_rgba(0,0,0,0.45)]
            transition-all duration-300 hover:scale-[1.02]  
            w-full md:w-auto
          `}
        >
          <div className={`absolute inset-0 bg-linear-to-br ${activeLayer.color}`} />
          <div className="relative flex items-center gap-2 md:gap-4 p-2 md:p-0">
            <div className="relative h-14 md:h-20 w-14 md:w-20 overflow-hidden rounded-lg md:rounded-2xl border border-white/10">
              <Image
                src={activeLayer.image}
                alt={activeLayer.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110  "
              />
              <div className="absolute inset-0 bg-black/50 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
            </div>
            <div className="hidden md:block absolute text-left bottom-2 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 text-white/60">
                {/* <Layers3 size={14} /> */}
                <h3 className="text-sm font-semibold text-white/40">{activeLayer.name}</h3>
              </div>
            </div>
          </div>
        </button>

        <div
          className={`
            absolute bottom-0 left-full ml-2 md:ml-4
            flex items-end gap-2 md:gap-3
            transition-all duration-500
            ${isExpanded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0 pointer-events-none"}
          `}
        >
          {otherLayers.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer)}
              className="
                group relative overflow-hidden rounded-2xl md:rounded-3xl
                border border-white/10 bg-black/35 backdrop-blur-xl shadow-2xl
                transition-all duration-500 hover:scale-[1.02]  
              "
              style={{ transitionDelay: `${index * 90}ms` }}
            >
              <div className="relative h-14 md:h-20 w-14 md:w-20 overflow-hidden">
                <Image
                  src={layer.image}
                  alt={layer.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-left">
                  <h3 className="text-xs font-semibold text-white/30 text-wrap">{layer.name}</h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MapLayerSelector;
