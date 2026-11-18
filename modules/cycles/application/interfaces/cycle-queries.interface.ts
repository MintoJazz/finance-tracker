import { BalanceType, CycleFrequency } from "@/prisma/generated/prisma/client";
import { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";
import { CycleRuleRecord } from "@/modules/cycles/application/services/cycle-engine.registry";
import { CycleWindowBoundaries } from "@/modules/cycles/application/services/cycle-window.engine";

export interface AgreementContextRecord {
    balanceId: number;
    balanceName: string;
    balanceType: BalanceType;
    isActive: boolean;
    frequency: CycleFrequency;
    interval: number;
    startsAt: Date;
    endsAt: Date | null;
}

export interface FindCycleRulesInWindowParams {
    agreementId: number;
    from: Date;
    to: Date;
}

export interface AggregateCyclesParams {
    balanceId: number;
    balanceType: BalanceType;
    windows: CycleWindowBoundaries[];
    today: Date;
    isOnce: boolean;
    includeProjected?: boolean;
    statuses?: CycleStatus[];
}

export interface AggregatedCycleRow {
    from: Date;
    to: Date;
    dueDate: Date;
    closingDate: Date | null;
    label: string;
    ruleId: number;
    movementsCount: number;
    isConsolidated: boolean;
    recognizedAmount: number;
    paidAmount: number;
    transferredAmount: number;
    remainingAmount: number;
    totalAmount: number;
    settlementDate: Date | null;
    hasReceipt: boolean;
    isOverdue: boolean;
    status: CycleStatus;
}

export interface ICycleQueries {
    /**
     * 1. Busca o cabeçalho leve (Balance + Agreement) validando o escopo do contextId.
     */
    findAgreementContext(
        balanceId: number,
        contextId: number
    ): Promise<AgreementContextRecord | null>;

    /**
     * 2. Busca as CycleRules vigentes no intervalo [from, to] com 1 regra de folga
     * imediatamente anterior (âncora) e 1 imediatamente posterior (borda de transição).
     */
    findCycleRulesInWindow(
        params: FindCycleRulesInWindowParams
    ): Promise<CycleRuleRecord[]>;

    /**
     * 3. Agrega em lote (ou unitariamente) as vigências informadas, resolvendo saldos,
     * polaridade, valor esperado do AgreementAmountEntry e inferência/filtro de status no SQL.
     */
    aggregateCycles(
        params: AggregateCyclesParams
    ): Promise<AggregatedCycleRow[]>;
}