"use client";

import { ArrowRight, Compass } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function StartExploreButton({ onClick }: Props) {
  return (
    <div className="absolute bottom-6 md:bottom-12 left-1/2 z-20 flex w-full -translate-x-1/2 justify-center px-4">
      <button
        onClick={onClick}
        className="
          group relative overflow-hidden
          flex items-center gap-3
          rounded-full
          bg-primary px-6 py-3.5 md:px-8 md:py-4
          shadow-lg hover:shadow-xl
          transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]
          hover:bg-primary/90 active:scale-95
        "
      >
        {/* Atmospheric glow behind button */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-primary/40 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
        />

        <Compass
          size={18}
          className="relative text-primary-foreground transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:rotate-12"
        />

        <span className="relative text-sm font-semibold tracking-wide text-primary-foreground">
          Explore Karnataka
        </span>

        <ArrowRight
          size={16}
          className="relative text-primary-foreground/80 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-x-1"
        />
      </button>
    </div>
  );
}
