"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type BlurPanelProps = React.HTMLAttributes<HTMLDivElement> & {
  glass?: boolean;
};

export const BlurPanel: React.FC<BlurPanelProps> = ({
  children,
  className,
  glass = true,
  ...rest
}) => {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border border-white/10",
        glass
          ? "backdrop-blur-md bg-[rgba(255,255,255,0.02)]"
          : "bg-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default BlurPanel;
