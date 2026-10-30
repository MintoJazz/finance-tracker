"use client"

import { useMemo } from "react"
import { useSelectedLayoutSegment } from "next/navigation"
import type { MasterDetailData, MasterDetailContextValue, MasterDetailViewProps } from "../types"

const noop = () => {}

export function useDesktopMasterDetail({ master, detail }: MasterDetailData): MasterDetailViewProps {
    const segment = useSelectedLayoutSegment()

    const contextValue = useMemo<MasterDetailContextValue>(
        () => ({
            isMobile: false,
            isMasterOpen: true,
            openMaster: noop,
            closeMaster: noop,
            segment,
        }),
        [segment]
    )

    return { master, detail, contextValue }
}
