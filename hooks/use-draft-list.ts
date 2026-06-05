/* eslint-disable @typescript-eslint/no-unused-vars */
import { Drafts, PendingChange, WithId } from "@/types/changes";
import { useCallback, useMemo, useRef, useState } from "react"

function omitKey<T extends WithId>(record: Drafts<T>, id: number): Drafts<T> {
    const { [id]: _, ...rest } = record
    return rest
}

export function useDraftList<Domain extends WithId>(originals: Domain[] = []) {
    const [drafts, setDrafts] = useState<Record<number, PendingChange<Domain>>>({})
    const index = useRef(-1);

    const discard = useCallback((id: number) => setDrafts(prev => omitKey(prev, id)), [])

    const add = useCallback((data: Domain) => {
        const id = index.current
        index.current -= 1
        setDrafts(prev => ({ ...prev, [id]: { action: "add", domain: {...data, id} } }))
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

    const getNewDrafts = useCallback(() => Object.entries(drafts).filter(([_, change]) => change.action === "add").map(([_, change]) => change.domain as Domain), [drafts])

    const items = useMemo(() => {
        const combined = originals.map(element => {
            const draft = drafts[element.id];
            
            if (draft?.action === "edit" && draft.domain) return { ...element, ...draft.domain } as Domain
            
            return element;
        });

        return [...combined, ...getNewDrafts()];
    }, [originals, drafts, getNewDrafts]);

    return { drafts, add, edit, remove, items }
}