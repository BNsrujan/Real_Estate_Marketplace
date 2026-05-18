"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  error?: string
  suffix?: React.ReactNode
}

function Input({
  className,
  type,
  label,
  error,
  id,
  suffix,
  required,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false)
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  const value = props.value ?? props.defaultValue
  const hasValue = value !== undefined && value !== "" && value !== null
  const floated = focused || !!hasValue

  // ── Plain input (no floating label) ────────────────────────────────────────
  if (!label) {
    const baseInput = (
      <input
        type={type}
        data-slot="input"
        id={id}
        required={required}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          "h-14 w-full min-w-0 rounded-t-md rounded-b-none border-0 border-b-2 border-border",
          "bg-input px-3 pt-4 pb-1 text-sm text-foreground outline-none",
          "placeholder:text-muted-foreground transition-colors",
          "focus-visible:border-b-2 focus-visible:border-primary focus-visible:ring-0",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-0",
          "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          suffix && "pr-10",
          className,
        )}
        {...props}
      />
    )
    if (!suffix) return baseInput
    return (
      <div className="relative">
        {baseInput}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {suffix}
        </div>
      </div>
    )
  }

  // ── Floating-label variant ─────────────────────────────────────────────────
  return (
    <div className="w-full">
      <div
        className={cn(
          "relative h-14 w-full rounded-t-md rounded-b-none bg-input",
          "border-b-2 transition-colors duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
          error
            ? "border-destructive"
            : focused
              ? "border-primary"
              : "border-border",
        )}
      >
        <input
          type={type}
          data-slot="input"
          id={inputId}
          placeholder=" "
          required={required}
          onFocus={(e) => { setFocused(true); onFocus?.(e) }}
          onBlur={(e) => { setFocused(false); onBlur?.(e) }}
          className={cn(
            "absolute inset-0 h-full w-full bg-transparent",
            "px-3 pt-5 pb-2 text-sm text-foreground outline-none",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            suffix && "pr-10",
            className,
          )}
          {...props}
        />

        {/* Floating label */}
        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-3 select-none",
            "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
            floated
              ? "top-2 text-[11px] leading-none"
              : "top-1/2 -translate-y-1/2 text-sm",
            error
              ? "text-destructive"
              : focused
                ? "text-primary"
                : "text-muted-foreground",
          )}
        >
          {label}
          {required && <span className="ml-0.5">*</span>}
        </label>

        {/* Right-side adornment (e.g. show/hide password button) */}
        {suffix && (
          <div className="absolute right-3 bottom-2.5 flex items-center">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p className="ml-1 pt-0.5 text-[11px] text-destructive">{error}</p>
      )}
    </div>
  )
}

export { Input }
