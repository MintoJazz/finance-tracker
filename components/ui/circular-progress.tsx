import * as React from "react";
import { cn } from "@/lib/utils";

export interface CircularProgressProps
    extends Omit<React.SVGAttributes<SVGSVGElement>, "strokeWidth"> {
    value: number;
    max?: number;
    /** Diâmetro em px. */
    size?: number;
    strokeWidth?: number;
    trackClassName?: string;
    indicatorClassName?: string;
}

function CircularProgress({
    value,
    max = 100,
    size = 16,
    strokeWidth = 2.5,
    className,
    trackClassName,
    indicatorClassName,
    ...props
}: CircularProgressProps) {
    const ratio = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const center = size / 2;

    return (
        <svg
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={value}
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={cn("shrink-0 -rotate-90", className)}
            {...props}
        >
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                className={cn("stroke-muted", trackClassName)}
            />
            <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - ratio)}
                className={cn(
                    "stroke-primary transition-[stroke-dashoffset]",
                    indicatorClassName
                )}
            />
        </svg>
    );
}

export { CircularProgress };
