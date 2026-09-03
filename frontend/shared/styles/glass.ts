/**
 * Centralized glass/glow design tokens for futuristic UI.
 * Used throughout the application for consistent translucent styling.
 */

export const GLASS = {
  // Base glass effects
  container: "bg-black/35 backdrop-blur-2xl border border-white/10",
  containerSmall: "bg-black/20 backdrop-blur-xl border border-white/5",
  
  // Text colors
  text: {
    primary: "text-white",
    secondary: "text-white/80",
    tertiary: "text-white/60",
    muted: "text-white/40",
  },
  
  // Border styles
  border: {
    primary: "border-white/10",
    secondary: "border-white/5",
    active: "border-white/20",
    accent: "border-cyan-400/40",
  },
  
  // Hover states
  hover: {
    bg: "hover:bg-white/10",
    bgLight: "hover:bg-white/5",
    text: "hover:text-white",
  },
  
  // Shadows (glow effects)
  shadow: {
    soft: "shadow-[0_10px_50px_rgba(0,0,0,0.45)]",
    glow: "shadow-[0_0_8px_rgba(255,255,255,0.04)]",
    glowCyan: "shadow-[0_0_20px_rgba(34,211,238,0.9)]",
  },
  
  // Combined utils
  button: "rounded-2xl border border-white/10 px-4 py-3 bg-black/35 text-white/80 transition-all duration-300 hover:bg-white/10 hover:text-white active:scale-95",
  card: "rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] backdrop-blur-xl",
  input: "rounded-3xl border border-white/10 bg-[rgba(255,255,255,0.03)] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/20",
} as const;

export type GlassToken = typeof GLASS;
