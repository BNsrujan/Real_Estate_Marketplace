"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const MapControlButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ children, className, ...rest }) => {
  return (
    <button
      {...rest}
      className={cn(
        "rounded-xl border border-white/10 bg-[rgba(0,0,0,0.35)] text-white p-2 transition-colors hover:bg-[rgba(255,255,255,0.04)]",
        className,
      )}
    >
      {children}
    </button>
  );
};

export default MapControlButton;
