"use client";

import { useEffect, useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
    const subscribe = (callback: () => void) => {
        if (typeof window === "undefined") {
            return () => {};
        }

        const media = window.matchMedia(query);
        media.addEventListener("change", callback);
        return () => media.removeEventListener("change", callback);
    };

    const getSnapshot = () => {
        if (typeof window === "undefined") {
            return false;
        }
        return window.matchMedia(query).matches;
    };

    const getServerSnapshot = () => false;

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useIsDesktop(breakpoint = "(min-width: 768px)"): boolean {
    const isDesktop = useMediaQuery(breakpoint);

    useEffect(() => {
        const viewport = isDesktop ? "desktop" : "mobile";
        document.cookie = `viewport=${viewport}; path=/; max-age=31536000; SameSite=Lax`;
    }, [isDesktop]);

    return isDesktop;
}

export function useIsMobile(breakpoint = "(min-width: 768px)"): boolean {
    return !useIsDesktop(breakpoint);
}
