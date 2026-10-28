"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toggle } from "@/components/ui/toggle";
import { ErrorView } from "@/components/error-view";
import { WalletMovementSearch } from "@/modules/ledger/ui/components/wallet-movement-search";
import { ContractCycleProfileMobileProps } from "../types";
import { ContractCycleSummary } from "../../../components/contract-cycle-profile/contract-cycle-summary";
import { ContractCycleNavigator } from "../../../components/contract-cycle-profile/contract-cycle-navigator";
import { ContractCycleEntryList } from "../../../components/contract-cycle-profile/contract-cycle-entry-list";
import { ContractCycleProfileSkeleton } from "../../../components/contract-cycle-profile/skeletons/contract-cycle-profile-skeleton";
import { CycleEntryActionContext } from "../../../components/contract-cycle-profile/contract-cycle-entry-actions";

export default function ContractCycleProfileViewMobile({
    cycle,
    entries,
    isLoading,
    error,
    onSkip,
    onViewEntry,
    onReverseEntry,
}: ContractCycleProfileMobileProps) {
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
            <div className="w-full max-w-xl mx-auto p-4">
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
        <div className="flex w-full flex-col gap-4 pb-8">
            {/* 1. Seletor Horizontal de Ciclo no topo */}
            <div className="px-3.5 pt-2">
                <ContractCycleNavigator cycle={cycle} />
            </div>

            {/* 2. Resumo do Ciclo (Nome, Regra, Vencimento, Destaque de Saldo, Barra de Progresso e Ações) */}
            <div className="px-4">
                <ContractCycleSummary cycle={cycle} onSkip={onSkip} />
            </div>

            {/* 3. Seção Extrato do Ciclo */}
            <div className="flex flex-col gap-2.5 pt-1">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-base font-semibold tracking-tight text-foreground">
                            Extrato do Ciclo
                        </h2>
                        <Badge variant="outline" className="tabular-nums text-xs">
                            {filteredEntries.length}
                        </Badge>
                    </div>
                    <Toggle
                        size="sm"
                        variant="outline"
                        pressed={includeReversed}
                        onPressedChange={setIncludeReversed}
                        className="text-xs h-8 px-2.5 gap-1.5 border-border/80"
                        aria-label="Incluir lançamentos estornados"
                    >
                        {includeReversed ? (
                            <Eye className="size-3.5" />
                        ) : (
                            <EyeOff className="size-3.5 text-muted-foreground" />
                        )}
                        <span>Estornadas</span>
                    </Toggle>
                </div>

                {/* Busca */}
                <div className="px-4 w-full mb-1">
                    <WalletMovementSearch
                        value={searchTerm}
                        onChange={setSearchTerm}
                    />
                </div>

                {/* Listagem padrão MovementList com ListItem */}
                <ContractCycleEntryList
                    entries={filteredEntries}
                    actionContext={entryActionContext}
                    hasFilters={Boolean(searchTerm) || !includeReversed}
                    onClearFilters={() => {
                        setSearchTerm(undefined);
                        setIncludeReversed(true);
                    }}
                />
            </div>
        </div>
    );
}

