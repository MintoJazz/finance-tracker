import { useCallback, useState } from "react";

export function useSelection() {
    const [selected, setSelected] = useState<number[]>([])

    const select = useCallback((id: number) => setSelected(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]), [])
    const clear = useCallback(() => setSelected([]), [])
    const selectAll = useCallback((ids: number[]) => setSelected(ids), [])

    return { selected, select, clear, selectAll }
}