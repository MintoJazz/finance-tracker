"use client";

import { useCallback } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Monta o href de um modal interceptado mantendo a query atual (offset, from/to, filtros…).
 *
 * A tela de fundo continua montada e lê a query da URL. Se ela sumir ao abrir o modal,
 * os hooks do fundo refazem as buscas, e como a URL já é a do modal esse POST de server
 * action cai na rota interceptada (que não conhece as actions do fundo) e dá 404.
 */
export function useModalHref() {
    const searchParams = useSearchParams();
    const query = searchParams.toString();

    return useCallback(
        (path: string) => (query ? `${path}?${query}` : path),
        [query]
    );
}
