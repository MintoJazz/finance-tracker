"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { InputGroupButton } from "@/components/ui/input-group";
import { WalletMovementSearch } from "@/modules/movements/ui/components/wallet-movement-search";

export interface InstallmentSearchBarProps {
    value?: string;
    onChange: (q: string | undefined) => void;
    onOpenFilters: () => void;
    activeFilterCount: number;
    className?: string;
}

/**
 * Barra de busca de parcelamentos com botão integrado para abertura do Drawer/Modal de filtros.
 */
export function InstallmentSearchBar({
    value,
    onChange,
    onOpenFilters,
    activeFilterCount,
    className,
}: InstallmentSearchBarProps) {
    return (
        <WalletMovementSearch
            value={value}
            onChange={onChange}
            placeholder="Buscar por descrição, categoria ou cartão..."
            className={className}
        >
            <InputGroupButton
                type="button"
                variant="ghost"
                size="xs"
                onClick={onOpenFilters}
                className="h-6 gap-1 px-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer"
                aria-label="Filtrar parcelamentos"
            >
                <SlidersHorizontal className="size-3.5 text-muted-foreground" />
                {activeFilterCount > 0 && (
                    <Badge
                        variant="secondary"
                        className="h-4 min-w-4 px-1 text-[10px] font-bold"
                    >
                        {activeFilterCount}
                    </Badge>
                )}
            </InputGroupButton>
        </WalletMovementSearch>
    );
}
