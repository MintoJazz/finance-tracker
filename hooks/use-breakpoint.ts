"use client"

import { useEffect, useState } from "react"

const MQL = "(min-width: 768px)"

function getIsDesktop() {
    if (globalThis.window === undefined) return false
    return globalThis.window.matchMedia(MQL).matches
}

export function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState(getIsDesktop)

    useEffect(() => {
        const mql = globalThis.window.matchMedia(MQL)
        const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
        mql.addEventListener("change", handler)
        return () => mql.removeEventListener("change", handler)
    }, [])

    return isDesktop
}