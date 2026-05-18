"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // MD3 pill track: 52×32dp scale → 44×24px at 0.75 ratio
        "peer relative inline-flex max-h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent",
        "outline-none transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        // unchecked: surface-variant track + outline
        "data-[state=unchecked]:bg-input data-[state=unchecked]:border-border",
        // checked: primary track
        "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
        // focus
        "focus-visible:ring-3 focus-visible:ring-primary/40",
        // invalid
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        // disabled
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full shadow-sm ring-0",
          "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
          // unchecked: smaller thumb, muted color
          "data-[state=unchecked]:size-4 data-[state=unchecked]:translate-x-0.5 data-[state=unchecked]:bg-muted-foreground",
          // checked: larger thumb, white
          "data-[state=checked]:size-5 data-[state=checked]:translate-x-5 data-[state=checked]:bg-primary-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
