"use client"

import { MasterDetailContext } from "../context"
import type { MasterDetailViewProps } from "../types"

// 4rem = altura do AppHeader (h-16) no PrivateLayout.
export default function MasterDetailDesktop({ master, detail, contextValue }: MasterDetailViewProps) {
    return (
        <MasterDetailContext.Provider value={contextValue}>
            <div className="flex flex-col md:flex-row min-h-[calc(100svh-4rem)]">
                <section className="min-w-0 flex-1">{detail}</section>
                <aside className="hidden md:block sticky top-0 h-[calc(100svh-4rem)] w-80 shrink-0 overflow-y-auto border-l border-border/40">
                    {master}
                </aside>
            </div>
        </MasterDetailContext.Provider>
    )
}
