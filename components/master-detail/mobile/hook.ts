"use client"

import { useMemo, useState } from "react"
import { useSelectedLayoutSegment } from "next/navigation"
import type { MasterDetailData, MasterDetailContextValue, MasterDetailViewProps } from "../types"

type PanelState = { view: "master" | "detail"; at: string | null }

export function useMobileMasterDetail({ master, detail }: MasterDetailData): MasterDetailViewProps {
    const segment = useSelectedLayoutSegment()

    // No mobile: se a URL tem um item selecionado (ex: /categories/1), o padrão é exibir o detail.
    // Se a URL é a raiz sem segmento (ex: /categories) ou rota de modal (create/archived), o padrão é exibir o master.
    const isDetailSegment = Boolean(segment && segment !== "create" && segment !== "archived")
    const defaultView = isDetailSegment ? "detail" : "master"

    const [panel, setPanel] = useState<PanelState>(() => ({
        view: defaultView,
        at: segment,
    }))

    // Se o usuário interagiu manualmente no segmento atual (openMaster/closeMaster), respeita a escolha.
    // Caso contrário (primeira carga, reload ou navegação de segmento), segue a regra padrão do segmento.
    const isMasterOpen = panel.at === segment
        ? panel.view === "master"
        : defaultView === "master"

    const contextValue = useMemo<MasterDetailContextValue>(
        () => ({
            isMobile: true,
            isMasterOpen,
            openMaster: () => setPanel({ view: "master", at: segment }),
            closeMaster: () => setPanel({ view: "detail", at: segment }),
            segment,
        }),
        [isMasterOpen, segment]
    )

    return { master, detail, contextValue }
}
