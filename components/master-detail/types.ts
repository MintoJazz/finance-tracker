import type { ReactNode } from "react"

/**
 * Painéis do master/detail. Chegam já renderizados pelo servidor (Server Components
 * passados como props pelo layout) e só são posicionados aqui.
 *
 * IMPORTANTE: nunca importe o conteúdo de master/detail dentro de `components/master-detail`,
 * senão ele viraria Client Component. Eles devem ser instanciados no `layout.tsx` da rota.
 */
export interface MasterDetailData {
    master: ReactNode
    detail: ReactNode
}

export interface MasterDetailContextValue {
    isMobile: boolean
    /** Desktop: sempre true. Mobile: depende do estado de alternância. */
    isMasterOpen: boolean
    /** Desktop: no-op. */
    openMaster: () => void
    /** Desktop: no-op. */
    closeMaster: () => void
    /** Segmento ativo abaixo do layout (`null` quando não há seleção). */
    segment: string | null
}

export interface MasterDetailViewProps extends MasterDetailData {
    contextValue: MasterDetailContextValue
}
