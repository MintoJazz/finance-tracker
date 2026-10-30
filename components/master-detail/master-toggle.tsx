"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMasterDetail } from "./context"

/** Abre o master no mobile. No desktop não renderiza nada. */
export function OpenMasterButton({ children = "Abrir master" }: { children?: React.ReactNode }) {
    const { isMobile, openMaster } = useMasterDetail()
    if (!isMobile) return null

    return (
        <Button type="button" variant="outline" size="sm" onClick={openMaster}>
            {children}
        </Button>
    )
}

/** Volta ao detail no mobile. No desktop não renderiza nada. */
export function CloseMasterButton({ children = "Voltar ao detail" }: { children?: React.ReactNode }) {
    const { isMobile, closeMaster } = useMasterDetail()
    if (!isMobile) return null

    return (
        <Button type="button" variant="outline" size="sm" onClick={closeMaster}>
            {children}
        </Button>
    )
}

/**
 * Link para usar dentro do master. No mobile fecha o master ao clicar, o que cobre o caso de
 * escolher o item que já está selecionado (a URL não muda, então o segmento não muda).
 */
export function MasterLink({ onClick, ...props }: React.ComponentProps<typeof Link>) {
    const { closeMaster } = useMasterDetail()

    return (
        <Link
            {...props}
            onClick={(event) => {
                onClick?.(event)
                closeMaster()
            }}
        />
    )
}
