"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      gap={8}
      icons={{
        success: <CircleCheckIcon className="size-4 text-primary" />,
        info:    <InfoIcon className="size-4 text-primary" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-500" />,
        error:   <OctagonXIcon className="size-4 text-destructive" />,
        loading: <Loader2Icon className="size-4 animate-spin text-muted-foreground" />,
      }}
      style={
        {
          // Base toast
          "--normal-bg":     "var(--card)",
          "--normal-text":   "var(--card-foreground)",
          "--normal-border": "var(--border)",

          // Success — MD3 secondary-container tonal
          "--success-bg":     "var(--secondary)",
          "--success-text":   "var(--primary)",
          "--success-border": "color-mix(in srgb, var(--primary) 20%, transparent)",

          // Error — destructive tonal
          "--error-bg":     "color-mix(in srgb, var(--destructive) 10%, transparent)",
          "--error-text":   "var(--destructive)",
          "--error-border": "color-mix(in srgb, var(--destructive) 20%, transparent)",

          // Warning — amber tonal (no MD3 token, stays semantic)
          "--warning-bg":     "color-mix(in srgb, #f59e0b 10%, transparent)",
          "--warning-text":   "#92400e",
          "--warning-border": "color-mix(in srgb, #f59e0b 30%, transparent)",

          // Info — primary tonal
          "--info-bg":     "color-mix(in srgb, var(--primary) 10%, transparent)",
          "--info-text":   "var(--primary)",
          "--info-border": "color-mix(in srgb, var(--primary) 20%, transparent)",

          // Shape & shadow
          "--border-radius": "calc(var(--radius) * 1.4)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:       "shadow-lg border text-sm font-medium",
          title:       "font-semibold",
          description: "text-xs opacity-80 mt-0.5",
          actionButton: "rounded-none bg-primary text-primary-foreground text-xs px-3 py-1.5 font-semibold hover:bg-primary/90 active:scale-95 transition-all",
          cancelButton: "rounded-none border border-border text-xs px-3 py-1.5 font-medium hover:bg-muted active:scale-95 transition-all",
          closeButton:  "rounded-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
