import { useState, useEffect } from "react"

export function useMounted() {
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        const timeoutId = setTimeout(() => setIsMounted(true), 0)
        return () => clearTimeout(timeoutId)
    }, [])

    return isMounted
}