import { useState } from "react"

export function useTransactionList(
    selected: number[], 
    selectAll: (ids: number[]) => void
) {
    const [filter, setFilter] = useState("")
    const selectionMode = selected.length > 0
    const clearSelection = () => selectAll([])

    return { filter, setFilter, selectionMode, clearSelection }
}