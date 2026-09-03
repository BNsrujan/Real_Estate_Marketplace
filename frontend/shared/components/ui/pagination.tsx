import * as React from "react"

import { cn } from "@/lib/utils"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = {
  isActive?: boolean
} & React.ComponentProps<"a">

function PaginationLink({
  className,
  isActive,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-none text-sm font-medium",
        "transition-all duration-200 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        isActive
          ? "bg-secondary text-primary font-semibold shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn(
        "w-auto gap-1.5 rounded-none border border-border px-3 text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      <ChevronLeftIcon size={16} />
      <span className="hidden sm:block text-sm">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn(
        "w-auto gap-1.5 rounded-none border border-border px-3 text-foreground hover:bg-muted",
        className
      )}
      {...props}
    >
      <span className="hidden sm:block text-sm">Next</span>
      <ChevronRightIcon size={16} />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex h-9 w-9 items-center justify-center text-muted-foreground",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon size={16} />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
