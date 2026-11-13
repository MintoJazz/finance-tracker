"use client";

import React, { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Monitor,
    Smartphone,
    RotateCcw,
    CheckCircle2,
    Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ViewRenderer } from "@/components/adaptive";
import { MovementEntryScope } from "@/modules/movements/models/movement-entry.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { MovementFilterDrawer } from "@/modules/movements/ui/components/movement-filter/drawer";
import { MovementFilter } from "@/modules/movements/ui/components/movement-filter";
import { useMovementEntryFilters } from "@/modules/movements/ui/hooks/use-movement-entry-filters";
import {
    ALL_MOCK_CYCLE_DETAILS,
    MOCK_CONTRACT_CYCLE_PARTIAL,
} from "@/modules/cycles/infra/mock/cycle-detail.mock";
import { CycleStatementAdaptiveConfig } from "../views/cycle-statement";

type ViewportMode = "desktop" | "mobile";

export function CycleStatementPlaygroundView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Estado da Viewport simulada no playground
    const [viewportMode, setViewportMode] = useState<ViewportMode>("desktop");

    // 2. Estado do Modal de Filtros Mobile (Pertence à viewport pai!)
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

    // 3. Lê parâmetros atuais da URL
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");
    const urlScope = searchParams.get("scope") as MovementEntryScope | null;

    const scope: MovementEntryScope =
        urlScope === "CARD" ? "CARD" : "CONTRACT_CYCLE";

    const range: CycleRange = useMemo(() => {
        if (urlFrom && urlTo) {
            return { from: urlFrom, to: urlTo };
        }
        return {
            from: MOCK_CONTRACT_CYCLE_PARTIAL.from,
            to: MOCK_CONTRACT_CYCLE_PARTIAL.to,
        };
    }, [urlFrom, urlTo]);

    const balanceId = scope === "CARD" ? 20 : 10;

    // 4. Hook de filtros gerenciado pelo pai para sincronizar com o Drawer
    const {
        filters,
        applyFilters,
        clearFilters,
    } = useMovementEntryFilters(scope);

    // 5. Troca de cenário mockado
    const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = ALL_MOCK_CYCLE_DETAILS.find((c) => c.label === e.target.value);
        if (!selected) return;

        const newScope = selected.source.kind === "CARD" ? "CARD" : "CONTRACT_CYCLE";
        const params = new URLSearchParams(searchParams.toString());
        params.set("from", selected.from);
        params.set("to", selected.to);
        params.set("scope", newScope);
        params.delete("page");
        params.delete("q");
        params.delete("direction");
        params.delete("types");

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // 6. Reset completo
    const handleResetAll = () => {
        const params = new URLSearchParams();
        params.set("from", MOCK_CONTRACT_CYCLE_PARTIAL.from);
        params.set("to", MOCK_CONTRACT_CYCLE_PARTIAL.to);
        params.set("scope", "CONTRACT_CYCLE");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const activePreset = ALL_MOCK_CYCLE_DETAILS.find(
        (c) => c.from === range.from && c.to === range.to
    );

    return (
        <div className="w-full min-h-screen bg-background text-foreground flex flex-col">
            {/* Barra Superior de Controle do Playground */}
            <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-sm px-4 py-3">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-xs">
                            PL
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-sm font-semibold tracking-tight text-foreground">
                                    Playground do Extrato de Ciclo
                                </h1>
                                <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                                    {scope}
                                </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                                Teste visual e funcional da view unificada com desacoplamento de actions
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Seletor de Cenários Mock */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                Cenário:
                            </span>
                            <select
                                value={activePreset?.label ?? ""}
                                onChange={handleSelectPreset}
                                className="h-8 rounded-lg border border-border bg-card px-2 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-ring"
                            >
                                <option value="" disabled>
                                    Navegação Customizada ({range.from} a {range.to})
                                </option>
                                <optgroup label="Contratos & Obrigações">
                                    {ALL_MOCK_CYCLE_DETAILS.filter(
                                        (c) => c.source.kind === "CONTRACT"
                                    ).map((c) => (
                                        <option key={`${c.from}_${c.to}`} value={c.label}>
                                            {c.label} ({c.status})
                                        </option>
                                    ))}
                                </optgroup>
                                <optgroup label="Cartão de Crédito">
                                    {ALL_MOCK_CYCLE_DETAILS.filter(
                                        (c) => c.source.kind === "CARD"
                                    ).map((c) => (
                                        <option key={`${c.from}_${c.to}`} value={c.label}>
                                            {c.label} ({c.status})
                                        </option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        {/* Alternador de Viewport */}
                        <div className="flex items-center border border-border rounded-lg p-0.5 bg-muted/40">
                            <Button
                                type="button"
                                variant={viewportMode === "desktop" ? "secondary" : "ghost"}
                                size="xs"
                                onClick={() => setViewportMode("desktop")}
                                className="gap-1 text-xs h-7"
                            >
                                <Monitor className="size-3.5" />
                                <span className="hidden md:inline">Desktop</span>
                            </Button>
                            <Button
                                type="button"
                                variant={viewportMode === "mobile" ? "secondary" : "ghost"}
                                size="xs"
                                onClick={() => setViewportMode("mobile")}
                                className="gap-1 text-xs h-7"
                            >
                                <Smartphone className="size-3.5" />
                                <span className="hidden md:inline">Mobile</span>
                            </Button>
                        </div>

                        {/* Reset */}
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleResetAll}
                            title="Resetar para cenário inicial"
                            className="size-8"
                        >
                            <RotateCcw className="size-3.5" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Painel Informativo de URL e Ações */}
            <div className="w-full bg-muted/30 border-b border-border/40 px-4 py-2 text-xs">
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-muted-foreground font-mono">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Calendar className="size-3.5 text-foreground" />
                            <span>Vigência:</span>
                            <strong className="text-foreground">{range.from}</strong> a{" "}
                            <strong className="text-foreground">{range.to}</strong>
                        </span>
                        <span>•</span>
                        <span>
                            Escopo: <strong className="text-foreground">{scope}</strong>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        >
                            <CheckCircle2 className="size-2.5 mr-1" />
                            Actions Desacopladas
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Área de Visualização do Componente */}
            <main className="flex-1 w-full p-4 md:p-6 lg:p-8 flex justify-center">
                {viewportMode === "desktop" ? (
                    <div className="w-full max-w-4xl">
                        <ViewRenderer
                            data={{
                                balanceId,
                                range,
                                scope,
                            }}
                            {...CycleStatementAdaptiveConfig.views.desktop}
                        />
                    </div>
                ) : (
                    /* Frame Simulado de Celular (Mobile Viewport) */
                    <div className="w-full max-w-sm border border-border/80 rounded-3xl p-4 shadow-xl bg-background flex flex-col relative overflow-hidden">
                        {/* Notch simulado */}
                        <div className="mx-auto w-24 h-4 bg-muted/60 rounded-full mb-3 shrink-0" />

                        <div className="w-full flex-1 overflow-y-auto">
                            <ViewRenderer
                                data={{
                                    balanceId,
                                    range,
                                    scope,
                                    // Callback repassado para a toolbar mobile abrir o drawer nesta viewport pai!
                                    onOpenFilters: () => setIsFilterDrawerOpen(true),
                                }}
                                {...CycleStatementAdaptiveConfig.views.mobile}
                            />
                        </div>

                        {/* Barra inferior simulada do celular */}
                        <div className="mx-auto w-32 h-1 bg-muted/60 rounded-full mt-3 shrink-0" />
                    </div>
                )}
            </main>

            {/* Drawer de Filtros Mobile: Gerenciado e montado na VIEWPORT PAI! */}
            <MovementFilterDrawer
                open={isFilterDrawerOpen}
                onOpenChange={setIsFilterDrawerOpen}
                filters={filters}
                onApply={applyFilters}
                onClear={clearFilters}
                scope={scope}
            >
                <MovementFilter.Direction />
                <MovementFilter.Types />
            </MovementFilterDrawer>
        </div>
    );
}
