"use client"

import { MasterDetailContext } from "../context"
import type { MasterDetailViewProps } from "../types"

export default function MasterDetailMobile({ master, detail, contextValue }: MasterDetailViewProps) {
    return (
        <MasterDetailContext.Provider value={contextValue}>
            {contextValue.isMasterOpen ? master : detail}
        </MasterDetailContext.Provider>
    )
}
