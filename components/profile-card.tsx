import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface ProfileCardProps extends React.ComponentProps<typeof Card> {
    isArchived?: boolean;
}

export const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
    ({ className, isArchived, ...props }, ref) => (
        <Card
            ref={ref}
            className={cn(
                "w-full transition-colors",
                isArchived && "border-amber-500/30",
                className
            )}
            {...props}
        />
    )
)
ProfileCard.displayName = "ProfileCard"

export const ProfileCardBanner = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("relative w-full h-16 border-b border-border/40", className)}
        {...props}
    />
))
ProfileCardBanner.displayName = "ProfileCardBanner"

export interface ProfileCardAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
    isArchived?: boolean;
}

export const ProfileCardAvatar = React.forwardRef<HTMLDivElement, ProfileCardAvatarProps>(
    ({ className, isArchived, children, ...props }, ref) => (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-10">
            <div
                ref={ref}
                className={cn(
                    "flex size-12 sm:size-13 items-center justify-center rounded-2xl border-[1.5px] bg-card shadow-sm select-none transition-transform hover:scale-105",
                    isArchived && "opacity-75",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </div>
    )
)
ProfileCardAvatar.displayName = "ProfileCardAvatar"

export const ProfileCardContent = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof CardContent>
>(({ className, ...props }, ref) => (
    <CardContent ref={ref} className={cn("flex flex-col gap-4 pt-8 px-4 sm:px-4.5 pb-4", className)} {...props} />
))
ProfileCardContent.displayName = "ProfileCardContent"
