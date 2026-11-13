"use client";

import React, { useMemo, useState } from "react";
import {
    Monitor,
    Smartphone,
    RotateCcw,
    Eye,
    EyeOff,
    Receipt,
    Copy,
    SlidersHorizontal,
    Code2,
    Wallet,
    CreditCard,
    FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
    MovementEntry,
    MovementEntryScope,
} from "@/modules/movements/models/movement-entry.schema";
import {
    MOCK_WALLET_ENTRIES,
    MOCK_CARD_ENTRIES,
    MOCK_CONTRACT_CYCLE_ENTRIES,
} from "../../infra/mock/movement-entries.mock";
import { MovementEntryTable } from "../components/movement-entry-table";
import { MovementEntryList } from "../components/movement-entry-list";
import { WalletMovementSearch } from "../components/wallet-movement-search";
import type { RowAction } from "@/components/data-table";
import type { RowLike } from "@/types/actions.types";

type ViewportMode = "desktop" | "mobile";
type StateMode = "data" | "empty" | "loading";

export function StatementPlaygroundView() {
    const [scope, setScope] = useState<MovementEntryScope>("WALLET");
    const [viewport, setViewport] = useState<ViewportMode>("desktop");
    const [stateMode, setStateMode] = useState<StateMode>("data");
    const [searchTerm, setSearchTerm] = useState<string | undefined>("");
    const [includeReversed, setIncludeReversed] = useState<boolean>(true);
    const [selectedEntry, setSelectedEntry] = useState<MovementEntry | null>(null);

    // Mocks conforme o escopo selecionado
    const rawEntries = useMemo(() => {
        if (scope === "WALLET") return MOCK_WALLET_ENTRIES;
        if (scope === "CARD") return MOCK_CARD_ENTRIES;
        return MOCK_CONTRACT_CYCLE_ENTRIES;
    }, [scope]);

    // Filtragem em memória
    const filteredEntries = useMemo(() => {
        if (stateMode === "empty") return [];

        return rawEntries.filter((item) => {
            if (!includeReversed && item.isReversed) {
                return false;
            }
            if (!searchTerm || !searchTerm.trim()) {
                return true;
            }
            const term = searchTerm.toLowerCase();
            return (
                item.description.toLowerCase().includes(term) ||
                (item.counterpart.name &&
                    item.counterpart.name.toLowerCase().includes(term))
            );
        });
    }, [rawEntries, stateMode, includeReversed, searchTerm]);

    // Helper para extrair item do RowLike
    const getEntry = (row: RowLike<MovementEntry>): MovementEntry =>
        "original" in row ? row.original : row;

    // Ações para a tabela (RowActions padrão)
    const rowActions: RowAction<MovementEntry, unknown>[] = useMemo(
        () => [
            {
                label: "Inspecionar JSON",
                icon: Code2,
                onClick: (row) => {
                    const entry = getEntry(row);
                    setSelectedEntry(entry);
                    toast.add({
                        title: "Lançamento Selecionado",
                        description: `Lançamento #${entry.entryId} selecionado no inspetor.`,
                        type: "info",
                    });
                },
            },
            {
                label: "Ver comprovante",
                icon: Receipt,
                disabled: (row) => !getEntry(row).hasAttachment,
                onClick: (row) => {
                    const entry = getEntry(row);
                    toast.add({
                        title: "Comprovante",
                        description: `Abrindo comprovante do lançamento: "${entry.description}"`,
                        type: "success",
                    });
                },
            },
            {
                label: "Copiar ID da transação",
                icon: Copy,
                onClick: (row) => {
                    const entry = getEntry(row);
                    navigator.clipboard.writeText(String(entry.id));
                    toast.add({
                        title: "Copiado",
                        description: "ID copiado para a área de transferência!",
                        type: "success",
                    });
                },
            },
            {
                label: "Estornar lançamento",
                icon: RotateCcw,
                variant: "destructive",
                disabled: (row) => getEntry(row).isReversed,
                onClick: (row) => {
                    const entry = getEntry(row);
                    toast.add({
                        title: "Simulação de Estorno",
                        description: `Simulando estorno do lançamento #${entry.id}`,
                        type: "warning",
                    });
                },
            },
        ],
        []
    );

    return (
        <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-12">
            {/* Cabeçalho do Playground */}
            <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-20 px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="size-5 text-primary" />
                            <h1 className="text-lg font-bold tracking-tight">
                                Playground de Extratos Genéricos
                            </h1>
                            <Badge variant="outline" className="text-[10px] uppercase">
                                UI Preview
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Validação visual do modelo unificado <code>MovementEntry</code> e
                            componentes adaptativos em Carteiras, Cartões e Ciclos.
                        </p>
                    </div>

                    {/* Controles de Escopo e Viewport */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Seletor de Escopo */}
                        <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
                            <Button
                                type="button"
                                variant={scope === "WALLET" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => {
                                    setScope("WALLET");
                                    setSelectedEntry(null);
                                }}
                                className="h-7 px-2.5 text-xs gap-1.5"
                            >
                                <Wallet className="size-3.5" />
                                Carteiras
                            </Button>
                            <Button
                                type="button"
                                variant={scope === "CARD" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => {
                                    setScope("CARD");
                                    setSelectedEntry(null);
                                }}
                                className="h-7 px-2.5 text-xs gap-1.5"
                            >
                                <CreditCard className="size-3.5" />
                                Cartões
                            </Button>
                            <Button
                                type="button"
                                variant={scope === "CONTRACT_CYCLE" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => {
                                    setScope("CONTRACT_CYCLE");
                                    setSelectedEntry(null);
                                }}
                                className="h-7 px-2.5 text-xs gap-1.5"
                            >
                                <FileText className="size-3.5" />
                                Ciclos
                            </Button>
                        </div>

                        {/* Seletor de Viewport */}
                        <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
                            <Button
                                type="button"
                                variant={viewport === "desktop" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewport("desktop")}
                                className="h-7 px-2.5 text-xs gap-1.5"
                                title="Viewport Tabela (Desktop)"
                            >
                                <Monitor className="size-3.5" />
                                Tabela
                            </Button>
                            <Button
                                type="button"
                                variant={viewport === "mobile" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setViewport("mobile")}
                                className="h-7 px-2.5 text-xs gap-1.5"
                                title="Viewport Lista (Mobile)"
                            >
                                <Smartphone className="size-3.5" />
                                Lista
                            </Button>
                        </div>

                        {/* Seletor de Estado */}
                        <div className="inline-flex items-center rounded-lg border border-border p-0.5 bg-muted/40">
                            <Button
                                type="button"
                                variant={stateMode === "data" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStateMode("data")}
                                className="h-7 px-2 text-xs"
                            >
                                Dados
                            </Button>
                            <Button
                                type="button"
                                variant={stateMode === "empty" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStateMode("empty")}
                                className="h-7 px-2 text-xs"
                            >
                                Vazio
                            </Button>
                            <Button
                                type="button"
                                variant={stateMode === "loading" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setStateMode("loading")}
                                className="h-7 px-2 text-xs"
                            >
                                Skeleton
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal do Playground */}
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-6 flex flex-col lg:flex-row gap-6 items-start">
                {/* Seção Esquerda: Extrato Renderizado */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-4">
                    {/* Barra de Filtros e Busca */}
                    <div className="flex flex-wrap items-center gap-3">
                        <WalletMovementSearch
                            value={searchTerm}
                            onChange={(val) => setSearchTerm(val)}
                            className="flex-1 min-w-[200px]"
                        />
                        <Toggle
                            size="sm"
                            variant="outline"
                            pressed={includeReversed}
                            onPressedChange={setIncludeReversed}
                            className="text-xs gap-1.5 shrink-0 h-9"
                        >
                            {includeReversed ? (
                                <Eye className="size-3.5" />
                            ) : (
                                <EyeOff className="size-3.5 text-muted-foreground" />
                            )}
                            Incluir estornadas
                        </Toggle>
                    </div>

                    {/* Visualização de Tabela ou Lista */}
                    <div className="w-full bg-card rounded-xl border border-border p-4 shadow-sm min-w-0 overflow-hidden">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm font-semibold tracking-tight">
                                    {scope === "WALLET"
                                        ? "Extrato de Carteira"
                                        : scope === "CARD"
                                        ? "Extrato da Fatura"
                                        : "Lançamentos do Ciclo Contratual"}
                                </h2>
                                <Badge variant="secondary" className="text-xs">
                                    {filteredEntries.length} itens
                                </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Renderizando: <strong>{viewport === "desktop" ? "MovementEntryTable" : "MovementEntryList"}</strong>
                            </span>
                        </div>

                        {viewport === "desktop" ? (
                            <MovementEntryTable
                                data={filteredEntries}
                                scope={scope}
                                isLoading={stateMode === "loading"}
                                rowActions={rowActions}
                                hasFilters={Boolean(searchTerm) || !includeReversed}
                                onClearFilters={() => {
                                    setSearchTerm("");
                                    setIncludeReversed(true);
                                    setStateMode("data");
                                }}
                            />
                        ) : (
                            <div className="max-w-md mx-auto border-x border-border/60 bg-background/50 rounded-lg p-1">
                                <MovementEntryList
                                    entries={filteredEntries}
                                    scope={scope}
                                    isLoading={stateMode === "loading"}
                                    onSelectEntry={(entry) => {
                                        setSelectedEntry(entry);
                                        toast.add({
                                            title: "Lançamento Selecionado",
                                            description: `Selecionado: "${entry.description}"`,
                                            type: "info",
                                        });
                                    }}
                                    hasFilters={Boolean(searchTerm) || !includeReversed}
                                    onClearFilters={() => {
                                        setSearchTerm("");
                                        setIncludeReversed(true);
                                        setStateMode("data");
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Seção Direita: Painel Inspetor do Modelo de Dados */}
                <div className="w-full lg:w-96 shrink-0 flex flex-col gap-3 sticky top-24">
                    <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <Code2 className="size-4 text-primary" />
                                <span>Inspetor de Dados Puros</span>
                            </div>
                            {selectedEntry && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedEntry(null)}
                                    className="h-6 px-1.5 text-[11px] text-muted-foreground"
                                >
                                    Limpar
                                </Button>
                            )}
                        </div>

                        <p className="text-[11px] text-muted-foreground mb-3">
                            {selectedEntry
                                ? `Inspeção do lançamento #${selectedEntry.id}:`
                                : "Clique em 'Inspecionar JSON' na tabela ou selecione um item na lista mobile para auditar o objeto de dados."}
                        </p>

                        <div className="bg-muted/40 rounded-lg p-3 text-[11px] font-mono overflow-auto max-h-[460px] border border-border/50">
                            {selectedEntry ? (
                                <pre className="whitespace-pre-wrap break-all text-xs">
                                    {JSON.stringify(selectedEntry, null, 2)}
                                </pre>
                            ) : (
                                <div className="text-muted-foreground italic text-center py-8">
                                    Nenhum item selecionado.
                                </div>
                            )}
                        </div>

                        {selectedEntry && (
                            <div className="mt-3 pt-3 border-t border-border flex flex-col gap-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tipo Contábil:</span>
                                    <Badge variant="outline" className="text-[10px]">
                                        {selectedEntry.type}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sentido:</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-[10px]",
                                            selectedEntry.direction === "CREDIT"
                                                ? "text-emerald-500 border-emerald-500/30"
                                                : "text-rose-500 border-rose-500/30"
                                        )}
                                    >
                                        {selectedEntry.direction}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Kind da Contraparte:</span>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {selectedEntry.counterpart.kind}
                                    </Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Appearance:</span>
                                    <span className="text-[11px] font-mono">
                                        {selectedEntry.counterpart.appearance
                                            ? JSON.stringify(selectedEntry.counterpart.appearance)
                                            : "null (usa theming registry)"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatementPlaygroundView;
