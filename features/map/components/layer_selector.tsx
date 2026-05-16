"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Check, Layers3 } from "lucide-react";

type LayerType = {
  id: string;
  name: string;
  image: string;
  color: string;
};

const mapLayers: LayerType[] = [
  {
    id: "satellite",
    name: "Satellite",
    image: "/pics/layers/satellite.png",
    color: "from-emerald-400/20 to-green-500/10",

  },
  {
    id: "standerd",
    name: "Standard",
    image: "/pics/layers/standard.png",
    color: "from-orange-400/20 to-red-500/10",

  },
  {
    id: "traffic",
    name: "Traffic",
    image: "/pics/layers/traffic.png",
    color: "from-cyan-400/20 to-blue-500/10",

  },
  {
    id: "osm",
    name: "OSM",
    image: "/pics/layers/osm.png",
    color: "from-purple-400/20 to-pink-500/10",

  },
];

const MapLayerSelector = () => {
  const [activeLayer, setActiveLayer] = useState<LayerType>(mapLayers[0]);
  const [isExpanded, setIsExpanded] = useState(false);

  const otherLayers = useMemo(() => {
    return mapLayers.filter((layer) => layer.id !== activeLayer.id);
  }, [activeLayer]);

  const handleLayerChange = (layer: LayerType) => {
    setActiveLayer(layer);
    setTimeout(() => {
      setIsExpanded(false);
    }, 250);
  };

  return (
    <div className="relative w-full z-500 flex items-end gap-2 md:gap-4 flex-wrap md:flex-nowrap justify-start">

      <div className="relative flex items-end">

        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="
            group
            relative
            overflow-hidden
            rounded-2xl md:rounded-3xl
            border border-white/10
            bg-black/40
            backdrop-blur-2xl
            shadow-[0_10px_50px_rgba(0,0,0,0.45)]
            transition-all duration-300
            hover:scale-[1.02]
            active:scale-[0.98]
            w-full md:w-auto
          "
        >

          <div
            className={`absolute inset-0 bg-gradient-to-br ${activeLayer.color}`}
          />

          <div className="relative flex items-center gap-2 md:gap-4 p-2 md:p-0">

            <div
              className="
                relative
                h-14 md:h-20
                w-14 md:w-20
                overflow-hidden
                rounded-lg md:rounded-2xl
                border border-white/10
              "
            >
              <Image
                src={activeLayer.image}
                alt={activeLayer.name}
                fill
                className="
                  object-cover
                  transition-transform duration-500
                  group-hover:scale-110
                "
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* Content */}
            <div className="hidden md:block absolute text-left bottom-2 center left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-2 text-white/60">

                <Layers3 size={14} />
                <h3 className="text-sm font-semibold text-white/30">
                  {activeLayer.name}
                </h3>
              </div>
            </div>
          </div>
        </button>

        <div
          className={`
            absolute bottom-0 left-full ml-2 md:ml-4
            flex items-end gap-2 md:gap-3
            transition-all duration-500
            ${isExpanded
              ? "translate-x-0 opacity-100"
              : "-translate-x-10 opacity-0 pointer-events-none"
            }
          `}
        >
          {otherLayers.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => handleLayerChange(layer)}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl md:rounded-3xl
                border border-white/10
                bg-black/35
                backdrop-blur-xl
                shadow-2xl
                transition-all duration-500
                hover:scale-[1.02]
                active:scale-[0.98]
              "
              style={{
                transitionDelay: `${index * 90}ms`,
              }}
            >
              {/* Image */}
              <div className="relative h-14 md:h-20 w-14 md:w-20 overflow-hidden">
                <Image
                  src={layer.image}
                  alt={layer.name}
                  fill
                  className="
                    object-cover
                    transition-transform duration-700
                    group-hover:scale-110
                  "
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"
                />

                {/* Layer Name */}
                <div className="absolute text-left bottom-2 center left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-2 text-white/60">

                    <h3 className="text-xs  text-wrap font-semibold text-white/30">
                      {layer.name}
                    </h3>
                  </div>
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
