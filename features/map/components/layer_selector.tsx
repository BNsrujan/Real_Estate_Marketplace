"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useStore } from "@/shared/store";
import type { LayerType } from "@/shared/types";

type LayerDef = {
  id: LayerType;
  name: string;
  image: string;
};

const MAP_LAYERS: LayerDef[] = [
  { id: "satellite", name: "Satellite", image: "/pics/layers/satellite.png" },
  { id: "standard",  name: "Standard",  image: "/pics/layers/standard.png" },
  { id: "traffic",   name: "Traffic",   image: "/pics/layers/traffic.png" },
  { id: "osm",       name: "OSM",       image: "/pics/layers/osm.png" },
];

interface MapLayerSelectorProps {
  onLayerChange?: (layer: LayerType) => void;
}

const MapLayerSelector = ({ onLayerChange }: MapLayerSelectorProps) => {
  const activeLayerType = useStore((s) => s.map.activeLayer);
  const setMap          = useStore((s) => s.setMap);
  const isExpanded      = useStore((s) => s.ui.isBottomSheetOpen);
  const setUI           = useStore((s) => s.setUI);

  const activeLayer  = MAP_LAYERS.find((l) => l.id === activeLayerType) ?? MAP_LAYERS[0];
  const otherLayers  = useMemo(() => MAP_LAYERS.filter((l) => l.id !== activeLayer.id), [activeLayer]);

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
          className="
            group relative overflow-hidden rounded-lg md:rounded-3xl
            border border-white/15 bg-black/50 backdrop-blur-2xl
            shadow-[0_8px_32px_rgba(0,0,0,0.4)]
            transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
            hover:scale-[1.03] hover:border-white/25 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]
            active:scale-[0.98]
            w-full md:w-auto
          "
        >

          <div className="relative flex items-center gap-2 md:gap-4 p-0.5 md:p-0">
            <div className="relative h-14 md:h-20 w-14 md:w-20 overflow-hidden rounded-md md:rounded-2xl border border-white/10">
              <Image
                src={activeLayer.image}
                alt={activeLayer.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div className="hidden md:block absolute text-left bottom-2 left-1/2 -translate-x-1/2">
              <h3 className="text-sm font-medium text-white/50 z-20">{activeLayer.name}</h3>
            </div>
          </div>
        </button>

        {/* Other layers — slide out on expand */}
        <div
          className={`
            absolute bottom-0 left-full ml-2 md:ml-4
            flex items-end gap-2 md:gap-3
            transition-all duration-500 ease-[cubic-bezier(0.2,0,0,1)]
            ${isExpanded ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0 pointer-events-none"}
          `}
        >
          {otherLayers.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer)}
              className="
                group relative overflow-hidden rounded-lg md:rounded-xl
                border border-white/10 bg-black/40 backdrop-blur-xl shadow-xl
                transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
                hover:scale-[1.05] hover:border-white/20
                active:scale-95
              "
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              <div className="relative h-14 md:h-20 w-14 md:w-20 overflow-hidden">
                <Image
                  src={layer.image}
                  alt={layer.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
                  <h3 className="text-[10px] font-semibold text-white/50">{layer.name}</h3>
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
