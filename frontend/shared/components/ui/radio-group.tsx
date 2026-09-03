"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // MD3 radio: 20px outer circle
        "peer relative flex aspect-square size-5 shrink-0 rounded-none outline-none",
        "border-2 border-border bg-transparent",
        "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        // checked: border turns primary
        "data-[state=checked]:border-primary",
        // focus ring
        "focus-visible:ring-3 focus-visible:ring-primary/40",
        // invalid
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        // disabled
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-full items-center justify-center"
      >  
        <span className="block size-2.5 rounded-none bg-primary animate-in zoom-in-50 duration-150" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
