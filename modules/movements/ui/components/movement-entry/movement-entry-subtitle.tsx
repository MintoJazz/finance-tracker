import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import { resolveMovementEntrySubtitle } from "./presentation";

interface MovementEntrySubtitleProps {
    entry: MovementEntry;
    scope: MovementEntryScope;
    className?: string;
}

export function MovementEntrySubtitle({
    entry,
    scope,
    className,
}: MovementEntrySubtitleProps) {
    const subtitle = resolveMovementEntrySubtitle(entry, scope);

    if (!subtitle) {
        return null;
    }

    if (subtitle.href) {
        return (
            <Link
                href={subtitle.href}
                onClick={(e) => e.stopPropagation()}
                className={cn(
                    "inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline group truncate min-w-0 max-w-full",
                    className
                )}
                title={subtitle.text}
            >
                <span className="truncate">{subtitle.text}</span>
                <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0" />
            </Link>
        );
    }

    return (
        <span
            className={cn(
                "text-xs text-muted-foreground truncate font-normal min-w-0 max-w-full",
                className
            )}
            title={subtitle.text}
        >
            {subtitle.text}
        </span>
    );
}

