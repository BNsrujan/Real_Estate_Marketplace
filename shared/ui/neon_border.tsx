"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type NeonBorderProps = React.HTMLAttributes<HTMLDivElement> & {
  intensity?: "low" | "medium" | "high";
};

export const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  className,
  intensity = "low",
  ...rest
}) => {
  const intensityClass =
    intensity === "high"
      ? "shadow-[0_0_24px_rgba(0,255,255,0.12)]"
      : intensity === "medium"
        ? "shadow-[0_0_12px_rgba(0,255,255,0.08)]"
        : "shadow-[0_0_6px_rgba(255,255,255,0.04)]";

  return (
    <div
      {...rest}
      className={cn(
        "rounded-3xl border border-white/10 bg-transparent",
        intensityClass,
        className,
      )}
    >
      {children}
    </div>
  );
};

export default NeonBorder;
