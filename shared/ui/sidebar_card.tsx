"use client";

import React from "react";
import { GlassCard } from "./glass_card";

export type SidebarCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export const SidebarCard: React.FC<SidebarCardProps> = ({
  children,
  title,
  className,
  ...rest
}) => {
  return (
    <GlassCard className={className} {...rest}>
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-white/90">{title}</h4>
      )}
      {children}
    </GlassCard>
  );
};

export default SidebarCard;
