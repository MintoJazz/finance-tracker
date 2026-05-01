import { useCallback, useRef, useState } from "react"

export type PendingChange<T> = {
    action: "add" | "edit" | "remove",
    domain?: T | Partial<T>,
    original?: T
}

type Drafts<T> = Record<number, PendingChange<T>>

function omitKey<T>(record: Drafts<T>, id: number): Drafts<T> {
    const { [id]: _, ...rest } = record
    return rest
}

export function useDraftList<Domain>() {
    const [drafts, setDrafts] = useState<Record<number, PendingChange<Domain>>>({})
    const index = useRef(-1);

    const discard = useCallback((id: number) => setDrafts(prev => omitKey(prev, id)), [])

    const add = useCallback((data: Domain) => {
        const id = index.current
        index.current -= 1
        setDrafts(prev => ({ ...prev, [id]: { action: "add", domain: data } }))
    }, [])

    const edit = useCallback((id: number, data: Partial<Domain>, original?: Domain) => setDrafts((prev) => {
        const accumulated = { ...prev[id]?.domain, ...data } as Partial<Domain>
        
        if (id < 0) return ({ ...prev, [id]: { ...prev[id], domain: accumulated } })
        else if (Object.keys(accumulated).some(key => accumulated[key as keyof Domain] !== original?.[key as keyof Domain])) return ({ ...prev, [id]: { action: "edit", domain: accumulated } })
        else return omitKey(prev, id)
    }), [])

    const remove = useCallback((id: number) => {
        if (id < 0) discard(id)
        else setDrafts(prev => ({ ...prev, [id]: { action: "remove" } }))
    }, [discard])

    return { drafts, add, edit, remove }
}