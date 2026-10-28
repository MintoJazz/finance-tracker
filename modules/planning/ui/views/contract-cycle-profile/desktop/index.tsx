"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ErrorView } from "@/components/error-view";
import { WalletMovementSearch } from "@/modules/ledger/ui/components/wallet-movement-search";
import { ContractCycleProfileDesktopProps } from "../types";
import { ContractCycleSummary } from "../../../components/contract-cycle-profile/contract-cycle-summary";
import { ContractCycleNavigator } from "../../../components/contract-cycle-profile/contract-cycle-navigator";
import { ContractCycleEntryTable } from "../../../components/contract-cycle-profile/contract-cycle-entry-table";
import { ContractCycleProfileSkeleton } from "../../../components/contract-cycle-profile/skeletons/contract-cycle-profile-skeleton";
import { CycleEntryActionContext } from "../../../components/contract-cycle-profile/contract-cycle-entry-actions";

export default function ContractCycleProfileViewDesktop({
    cycle,
    entries,
    isLoading,
    error,
    onSkip,
    onViewEntry,
    onReverseEntry,
}: ContractCycleProfileDesktopProps) {
    const [searchTerm, setSearchTerm] = React.useState<string | undefined>(undefined);
    const [includeReversed, setIncludeReversed] = React.useState<boolean>(true);

    const entryActionContext = React.useMemo<CycleEntryActionContext>(() => {
        if (!cycle) {
            return {
                contractId: 0,
                cycleRange: { from: "", to: "" },
            };
        }
        return {
            contractId: cycle.contractId,
            cycleRange: cycle.range,
            onViewEntry,
            onReverseEntry,
        };
    }, [cycle, onViewEntry, onReverseEntry]);

    const filteredEntries = React.useMemo(() => {
        return entries.filter((entry) => {
            if (!includeReversed && (entry.type === "REVERSAL" || Boolean(entry.reversedByEntryId))) {
                return false;
            }
            if (searchTerm && searchTerm.trim().length > 0) {
                const term = searchTerm.toLowerCase();
                const matchesDesc = entry.description.toLowerCase().includes(term);
                const matchesCounterpart = entry.counterpart
                    ? entry.counterpart.label.toLowerCase().includes(term)
                    : false;
                return matchesDesc || matchesCounterpart;
            }
            return true;
        });
    }, [entries, includeReversed, searchTerm]);

    if (isLoading && !cycle) {
        return <ContractCycleProfileSkeleton />;
    }

    if (error || !cycle) {
        return (
            <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
                <ErrorView
                    title="Ciclo não encontrado"
                    error={
                        error ??
                        "Não foi possível encontrar as informações deste ciclo para o contrato informado."
                    }
                />
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 p-4 md:p-6 lg:p-8 lg:py-4 min-w-0">
            {/* Seletor Horizontal de Ciclo (Navegador com setas prev/next, status e total) */}
            <ContractCycleNavigator cycle={cycle} />

            {/* 1. Resumo do Ciclo (Nome, Regra, Status, Destaque de Saldo, Barra de Progresso e Ações Rápidas) */}
            <ContractCycleSummary cycle={cycle} onSkip={onSkip} />

            {/* 2. Seção Extrato do Ciclo replicando padrão do CardProfile */}
            <main className="min-w-0 w-full flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                            Extrato do Ciclo
                        </h2>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {filteredEntries.length}
                        </Badge>
                    </div>
                </div>

                {/* Busca + Toggle de Estornadas */}
                <div className="flex items-center gap-2.5 w-full mb-1">
                    <WalletMovementSearch
                        value={searchTerm}
                        onChange={setSearchTerm}
                        className="flex-1"
                    />
                    <Toggle
                        size="sm"
                        variant="outline"
                        pressed={includeReversed}
                        onPressedChange={setIncludeReversed}
                        className="text-xs gap-1.5 shrink-0"
                        aria-label="Incluir lançamentos estornados"
                    >
                        {includeReversed ? (
                            <Eye className="size-3.5" />
                        ) : (
                            <EyeOff className="size-3.5 text-muted-foreground" />
                        )}
                        Incluir estornadas
                    </Toggle>
                </div>

                {/* Tabela de Lançamentos padrão DataTable */}
                <ContractCycleEntryTable
                    entries={filteredEntries}
                    actionContext={entryActionContext}
                    hasFilters={Boolean(searchTerm) || !includeReversed}
                    onClearFilters={() => {
                        setSearchTerm(undefined);
                        setIncludeReversed(true);
                    }}
                />
            </main>
        </div>
    );
}
