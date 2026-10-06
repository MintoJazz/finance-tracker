"use client";

import * as React from "react";
import { Archive, LucideProps } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

function ArchiveSlash({ className, ...props }: LucideProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("lucide lucide-archive-slash", className)}
            {...props}
        >
            <rect width="20" height="5" x="2" y="3" rx="1" />
            <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
            <path d="M10 12h4" />
            <line x1="2" x2="22" y1="2" y2="22" />
        </svg>
    );
}

export interface IncludeArchivedToggleProps
    extends React.ComponentProps<typeof Toggle> {
    label?: string;
    iconClassName?: string;
}

export function IncludeArchivedToggle({
    label = "Incluir arquivados",
    iconClassName,
    className,
    pressed,
    size = "sm",
    variant = "outline",
    ...props
}: IncludeArchivedToggleProps) {
    const ArchiveIcon = pressed ? Archive : ArchiveSlash;

    return (
        <Toggle
            pressed={pressed}
            aria-label={label}
            size={size}
            variant={variant}
            className={cn("gap-1.5", className)}
            {...props}
        >
            <ArchiveIcon className={cn("size-4", iconClassName)} />
            {label}
        </Toggle>
    );
}