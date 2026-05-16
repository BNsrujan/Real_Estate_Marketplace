"use client";

import { ArrowRight, Compass } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function StartExploreButton({ onClick }: Props) {
  return (
    <div
      className="
        absolute
        bottom-6
        left-1/2
        z-20
        flex
        w-full
        -translate-x-1/2
        justify-center
        px-4

        md:bottom-12
      "
    >
      <button
        onClick={onClick}
        className="
          group
          relative
          overflow-hidden
          rounded-lg md:rounded-3xl
          border-3
          border-white/20 backdrop-blur-md hover:border-white/30 transition
          bg-black/40
          px-4 py-2 md:px-6 md:py-4
          duration-300

        "
      >
        {/* Content */}
        <div className="relative flex items-center gap-4">
          {/* Text */}
          <div className="flex flex-col text-left">
            <span
              className="
                text-sm
                font-semibold
                tracking-[0.18em]
                text-white
              "
            >
              EXPLORE KARNATAKA
            </span>
          </div>
          <div >
            <ArrowRight size={18} />
          </div>
        </div>
      </button>
    </div>
  );
}
