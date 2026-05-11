"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type FloatingButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    size?: "sm" | "md" | "lg";
  };

export const FloatingButton: React.FC<FloatingButtonProps> = ({
  children,
  className,
  size = "md",
  ...rest
}) => {
  const sizes: Record<string, string> = {
    sm: "h-9 w-9 text-sm",
    md: "h-12 w-12 text-base",
    lg: "h-14 w-14 text-lg",
  };

  return (
    <button
      {...rest}
      className={cn(
        "rounded-full flex items-center justify-center border border-white/10 backdrop-blur-md bg-[rgba(255,255,255,0.02)] shadow-sm transition-transform hover:-translate-y-1",
        sizes[size],
        className,
      )}
    >
      {children}
    </button>
  );
};

export default FloatingButton;
