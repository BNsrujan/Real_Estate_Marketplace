"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: "sm" | "md" | "lg";
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  size = "md",
  ...rest
}) => {
  const sizes: Record<string, string> = {
    sm: "p-3",
    md: "p-5",
    lg: "p-8",
  };

  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl bg-card border border-border shadow-sm transition-shadow duration-300 hover:shadow-md",
        sizes[size],
        className,
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
