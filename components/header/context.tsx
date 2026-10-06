"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { RouteKey } from "./config"

const HeaderContext = createContext<{
  labels: Partial<Record<RouteKey, string>>
  setLabel: (key: RouteKey, value: string | undefined) => void
} | null>(null)

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [labels, setLabels] = useState<Partial<Record<RouteKey, string>>>({})

  const setLabel = useCallback((key: RouteKey, value: string | undefined) => {
    setLabels(prev => {
      if (prev[key] === value) return prev
      return { ...prev, [key]: value }
    })
  }, [])

  const value = useMemo(() => ({ labels, setLabel }), [labels, setLabel])

  return (
    <HeaderContext.Provider value={value}>
      {children}
    </HeaderContext.Provider>
  )
}

export function useHeaderContext() {
  const ctx = useContext(HeaderContext)
  if (!ctx) throw new Error("useHeaderContext must be used within HeaderProvider")
  return ctx
}

export function useBreadcrumbLabel(key: RouteKey, value: string | null | undefined) {
  const ctx = useContext(HeaderContext)
  const setLabel = ctx?.setLabel

  useEffect(() => {
    if (!setLabel) return
    setLabel(key, value ?? undefined)
    return () => setLabel(key, undefined)
  }, [setLabel, key, value])
}
