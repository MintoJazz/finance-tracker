import { Result } from "@/types/result.types";
import { CycleDetail } from "@/modules/cycles/models/cycle-detail.schema";
import { CycleRange } from "@/modules/cycles/models/cycle-primitives.schema";
import { CycleRuleItem } from "@/modules/cycles/application/interfaces/cycle-queries.interface";
import {
    CommitmentCycleFilters,
    CommitmentCycleItem,
    CommitmentsPeriodSummary,
} from "@/modules/cycles/models/commitment-cycle.schema";
import {
    CycleView,
} from "@/modules/cycles/models/obligation-cycle.schema";
import {
    AgreementCycleSourceData,
    CycleWindow,
} from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import {
    CycleDetailEngine,
    CycleWindowBoundaries,
    CycleWindowsResolution,
    CalculateCycleAmountsParams,
    BuildCycleDetailParams,
} from "./cycle-detail-engine.service";
import { CycleProjectionEngine } from "./cycle-projection-engine.service";
import { ObligationCycleEngine } from "./obligation-cycle-engine.service";

// Re-exporta tipos para manter retrocompatibilidade total
export type {
    CycleWindowBoundaries,
    CycleWindowsResolution,
    CalculateCycleAmountsParams,
    BuildCycleDetailParams,
};

/**
 * Facade unificada para o ecossistema de motores de ciclos.
 * Delega responsabilidades para os serviços especializados de domínio:
 * - CycleProjectionEngine: Projeções em lote e sumarização para visão geral de planejamento.
 * - ObligationCycleEngine: Projeções especializadas para o wizard de quitação de obrigações.
 * - CycleDetailEngine: Auditoria, vigência, saldos com polaridade e detalhes de ciclo único.
 */
export class CycleEngineService {
    private readonly projectionEngine: CycleProjectionEngine;
    private readonly obligationEngine: ObligationCycleEngine;
    private readonly detailEngine: CycleDetailEngine;

    constructor(
        projectionEngine?: CycleProjectionEngine,
        obligationEngine?: ObligationCycleEngine,
        detailEngine?: CycleDetailEngine
    ) {
        this.projectionEngine = projectionEngine ?? new CycleProjectionEngine();
        this.obligationEngine = obligationEngine ?? new ObligationCycleEngine();
        this.detailEngine = detailEngine ?? new CycleDetailEngine();
    }

    // ==========================================
    // Contexto 1: Projeção de Ciclos em Lote
    // ==========================================

    projectCycles(
        sources: AgreementCycleSourceData[],
        window: CycleWindow,
        now: Date
    ): CommitmentCycleItem[] {
        return this.projectionEngine.projectCycles(sources, window, now);
    }

    applyFilters(
        cycles: CommitmentCycleItem[],
        filter?: CommitmentCycleFilters
    ): CommitmentCycleItem[] {
        return this.projectionEngine.applyFilters(cycles, filter);
    }

    summarizeCycles(cycles: CommitmentCycleItem[]): CommitmentsPeriodSummary {
        return this.projectionEngine.summarizeCycles(cycles);
    }

    // ==========================================
    // Contexto 2: Wizard de Quitação de Obrigações
    // ==========================================

    projectObligationCycles(
        source: AgreementCycleSourceData,
        window: CycleWindow,
        now: Date,
        maxAdvanceMonths: number = 3
    ): CycleView[] {
        return this.obligationEngine.projectObligationCycles(
            source,
            window,
            now,
            maxAdvanceMonths
        );
    }

    // ==========================================
    // Contexto 3: Detalhes do Ciclo (Extrato)
    // ==========================================

    validateAndResolveWindows(
        rules: CycleRuleItem[],
        agreement: { startsAt: Date; endsAt: Date | null },
        range: CycleRange
    ): Result<CycleWindowsResolution> {
        return this.detailEngine.validateAndResolveWindows(rules, agreement, range);
    }

    resolveCycleForDate(
        cursor: Date,
        sortedRules: CycleRuleItem[]
    ): CycleWindowBoundaries {
        return this.detailEngine.resolveCycleForDate(cursor, sortedRules);
    }

    calculateCycleAmounts(params: CalculateCycleAmountsParams): {
        total: number;
        paid: number;
        open: number;
        transferred: number;
        recognized?: number;
    } {
        return this.detailEngine.calculateCycleAmounts(params);
    }

    calculateCycleDetail(params: BuildCycleDetailParams): CycleDetail {
        return this.detailEngine.calculateCycleDetail(params);
    }

    formatRuleLabel(rule: CycleRuleItem): string {
        return this.detailEngine.formatRuleLabel(rule);
    }
}
