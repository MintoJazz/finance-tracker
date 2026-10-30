"use client"

import { createContext, useContext } from "react"
import type { MasterDetailContextValue } from "./types"

export const MasterDetailContext = createContext<MasterDetailContextValue | null>(null)

export function useMasterDetail() {
    const ctx = useContext(MasterDetailContext)
    if (!ctx) throw new Error("useMasterDetail must be used within a MasterDetail view")
    return ctx
}
