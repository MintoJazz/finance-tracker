import * as React from "react"
import { cn } from "@/lib/utils"

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  onSelect?: () => void;
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  ({ className, onSelect, role, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="item"
        role={role || (onSelect ? "button" : undefined)}
        tabIndex={onSelect ? 0 : undefined}
        onClick={
          onSelect
            ? (e) => {
                if (!e.currentTarget.contains(e.target as Node)) return;
                onSelect();
              }
            : props.onClick
        }
        onKeyDown={
          onSelect
            ? (e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect();
                }
              }
            : props.onKeyDown
        }
        className={cn(
          "group/item flex w-full flex-col gap-2 px-4 sm:px-5 py-3 hover:bg-muted/40 transition-colors text-sm",
          onSelect && "cursor-pointer focus-visible:outline-none focus-visible:bg-muted/40",
          className
        )}
        {...props}
      />
    )
  }
)
ListItem.displayName = "ListItem"

const ListItemHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between gap-3 w-full", className)} {...props} />
  )
)
ListItemHeader.displayName = "ListItemHeader"

const ListItemAvatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("shrink-0", className)} {...props} />
  )
)
ListItemAvatar.displayName = "ListItemAvatar"

const ListItemContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col min-w-0 flex-1", className)} {...props} />
  )
)
ListItemContent.displayName = "ListItemContent"

const ListItemTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2 min-w-0", className)} {...props} />
  )
)
ListItemTitle.displayName = "ListItemTitle"

const ListItemSubtitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-1.5 text-xs text-muted-foreground truncate", className)} {...props} />
  )
)
ListItemSubtitle.displayName = "ListItemSubtitle"

const ListItemActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div 
      ref={ref} 
      className={cn("flex items-center gap-1 shrink-0", className)} 
      role="presentation"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      {...props} 
    />
  )
)
ListItemActions.displayName = "ListItemActions"

const ListItemFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center justify-between gap-3 w-full text-xs text-muted-foreground", className)} {...props} />
  )
)
ListItemFooter.displayName = "ListItemFooter"

const ListItemFooterLeft = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-4 min-w-0 flex-1", className)} {...props} />
  )
)
ListItemFooterLeft.displayName = "ListItemFooterLeft"

const ListItemFooterRight = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-baseline gap-1.5 shrink-0 justify-end", className)} {...props} />
  )
)
ListItemFooterRight.displayName = "ListItemFooterRight"

interface ListItemFooterInfoProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ElementType;
}

const ListItemFooterInfo = React.forwardRef<HTMLDivElement, ListItemFooterInfoProps>(
  ({ className, icon: Icon, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-1.5 min-w-0", className)} {...props}>
      {Icon && <Icon className="size-3.5 shrink-0" />}
      <span className="truncate">{children}</span>
    </div>
  )
)
ListItemFooterInfo.displayName = "ListItemFooterInfo"

export {
  ListItem,
  ListItemHeader,
  ListItemAvatar,
  ListItemContent,
  ListItemTitle,
  ListItemSubtitle,
  ListItemActions,
  ListItemFooter,
  ListItemFooterLeft,
  ListItemFooterRight,
  ListItemFooterInfo
}
