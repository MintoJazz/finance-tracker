import * as React from "react"
import { cn } from "@/lib/utils"

export const EntityHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-3.5 px-1", className)} {...props} />
  )
)
EntityHeader.displayName = "EntityHeader"

export const EntityHeaderMedia = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0", className)} {...props} />
  )
)
EntityHeaderMedia.displayName = "EntityHeaderMedia"

export const EntityHeaderContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col min-w-0 flex-1", className)} {...props} />
  )
)
EntityHeaderContent.displayName = "EntityHeaderContent"

export const EntityHeaderTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold text-lg truncate text-foreground", className)} {...props}>
        {children}
    </h3>
  )
)
EntityHeaderTitle.displayName = "EntityHeaderTitle"

export const EntityHeaderDescription = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn("text-sm text-muted-foreground truncate", className)} {...props} />
  )
)
EntityHeaderDescription.displayName = "EntityHeaderDescription"
