/**
 * Read models e tipos do motor de projeção de ciclos de compromissos.
 *
 * CONVENÇÃO DE DATAS:
 * Todas as datas manipuladas pelo motor são DATAS CIVIS (sem componente de horário/fuso horário).
 * O motor não converte fuso horário. A infraestrutura e os mappers entregam instâncias de Date
 * já normalizadas para o início do dia civil (UTC 00:00 do Prisma ou startOfDay).
 */

export type EntryTypeData =
    | "DIRECT"
    | "TRANSFER"
    | "ACCRUAL"
    | "CLAIM_OPENING"
    | "SETTLEMENT"
    | "CLAIM_PAYMENT"
    | "CLAIM_RECEIPT"
    | "ADJUSTMENT"
    | "CLAIM_ACCEPTANCE"
    | "REVERSAL";

/**
 * Balde de movimentações pré-agregadas pela infraestrutura:
 * GROUP BY cycle_rule_id, reference_date, entry_type, reverses_entry_type, movement_direction
 *
 * referenceDate provém da view `vw_entry_cycle_rule` (data bruta, sem deslocamento de closingDay).
 */
export interface CycleAggregatedEntryData {
    referenceDate: Date;
    type: EntryTypeData;
    reversesEntryType: EntryTypeData | null; // Preenchido apenas quando type === "REVERSAL"
    direction: "CREDIT" | "DEBIT";
    amount: number; // centavos acumulados, >= 0
    count: number; // quantidade de movimentos individuais contidos no balde
}

export interface CycleRuleWithEntriesData {
    id: number;
    agreementId: number;
    effectiveFrom: Date;
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
    interval: number;
    closingDay: number | null;
    dueDay: number;
    entries: CycleAggregatedEntryData[];
}

export interface AmountLogEntryData {
    amount: number; // delta com sinal, em centavos (pode ser negativo)
    effectiveAt: Date;
}

export interface AgreementCycleSourceData {
    agreementId: number;
    balanceId: number;
    balanceName: string;
    balanceType: "CREDIT" | "COMMITMENT" | "PAYABLE" | "RECEIVABLE";
    includeInProjection: boolean;
    startsAt: Date;
    endsAt: Date | null;
    amountLog: AmountLogEntryData[]; // AgreementAmountEntry completo, ordenado por effectiveAt ASC
    rules: CycleRuleWithEntriesData[]; // CycleRules ordenadas por effectiveFrom ASC
}

export interface CycleWindow {
    from: Date; // Data civil inicial (inclusiva)
    to: Date; // Data civil final (inclusiva)
}
