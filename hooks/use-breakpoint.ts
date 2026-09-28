"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false)

    useEffect(() => {
        const media = window.matchMedia(query)
        setMatches(media.matches)

        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches)
        }

        media.addEventListener("change", listener)
        return () => media.removeEventListener("change", listener)
    }, [query])

    return matches
}

export function useIsDesktop(breakpoint = "(min-width: 768px)"): boolean {
    return useMediaQuery(breakpoint)
}

export function useIsMobile(breakpoint = "(min-width: 768px)"): boolean {
    return !useIsDesktop(breakpoint)
}
