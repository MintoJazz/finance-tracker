/**
 * Motor puro de cálculo, projeção, filtragem e consolidação de ciclos de compromissos.
 *
 * REGRAS ARQUITETURAIS:
 * - Sem I/O, sem Prisma, sem detalhes de banco.
 * - Instante atual (`now`) é parâmetro obrigatório (sem `new Date()` interno).
 * - Todas as datas manipuladas são datas civis (`startOfDay`).
 */
import {
    addMonths,
    format,
    isAfter,
    isBefore,
    startOfDay,
    startOfMonth,
    startOfWeek,
    startOfYear,
} from "date-fns";
import {
    CommitmentCycleFilters,
    CommitmentCycleItem,
    CommitmentCycleStatusEnum,
    CommitmentsPeriodSummary,
} from "@/modules/cycles/models/commitment-cycle.schema";
import {
    CycleStatus,
    CycleView,
} from "@/modules/cycles/models/obligation-cycle.schema";
import {
    AgreementCycleSourceData,
    CycleAggregatedEntryData,
    CycleRuleWithEntriesData,
    CycleWindow,
} from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";
import {
    CycleEngineRegistry,
    CyclePeriodBoundaries,
} from "@/modules/cycles/application/services/cycle-engine.registry";

interface InternalCycleBucket {
    boundaries: CyclePeriodBoundaries;
    rule: CycleRuleWithEntriesData;
    source: AgreementCycleSourceData;
    entries: CycleAggregatedEntryData[];
}

export class CycleEngineService {
    /**
     * Projeta os ciclos para a janela temporal especificada.
     */
    projectCycles(
        sources: AgreementCycleSourceData[],
        window: CycleWindow,
        now: Date
    ): CommitmentCycleItem[] {
        const today = startOfDay(now);
        const winFrom = startOfDay(window.from);
        const winTo = startOfDay(window.to);

        const result: CommitmentCycleItem[] = [];

        for (const source of sources) {
            const agreementStarts = startOfDay(source.startsAt);
            const agreementEnds = source.endsAt ? startOfDay(source.endsAt) : null;

            // Contrato deve estar vigente em algum momento da janela
            if (isAfter(agreementStarts, winTo)) continue;
            if (agreementEnds && isBefore(agreementEnds, winFrom)) continue;

            const rules = [...source.rules].sort(
                (a, b) => startOfDay(a.effectiveFrom).getTime() - startOfDay(b.effectiveFrom).getTime()
            );

            if (rules.length === 0) continue;

            // Map de baldes por cycleKey para este source
            const bucketsByKey = new Map<string, InternalCycleBucket>();

            // 1. Distribuir entradas pré-agregadas para os baldes de ciclo
            for (const rule of rules) {
                const strategy = CycleEngineRegistry.getStrategy(rule.frequency);

                for (const entry of rule.entries) {
                    const shiftedRef = strategy.resolveReferenceDate(entry.referenceDate, rule);
                    const boundaries = strategy.getCycleBoundaries(shiftedRef, rule);

                    // Só processa se o vencimento do ciclo cair na janela
                    if (isBefore(boundaries.dueDate, winFrom) || isAfter(boundaries.dueDate, winTo)) {
                        continue;
                    }

                    if (!bucketsByKey.has(boundaries.cycleKey)) {
                        bucketsByKey.set(boundaries.cycleKey, {
                            boundaries,
                            rule,
                            source,
                            entries: [],
                        });
                    }
                    bucketsByKey.get(boundaries.cycleKey)!.entries.push(entry);
                }
            }

            // 2. Se o contrato participa da projeção, gerar ciclos projetados na janela
            if (source.includeInProjection) {
                for (let rIdx = 0; rIdx < rules.length; rIdx++) {
                    const rule = rules[rIdx];
                    const nextRule = rules[rIdx + 1];
                    const strategy = CycleEngineRegistry.getStrategy(rule.frequency);

                    const ruleStart = startOfDay(rule.effectiveFrom);
                    const ruleEnd = nextRule ? startOfDay(nextRule.effectiveFrom) : null;
                    const currentPeriodStart = this.resolveCurrentPeriodStart(rule.frequency, today);

                    if (rule.frequency === "ONCE") {
                        const boundaries = strategy.getCycleBoundaries(rule.effectiveFrom, rule);
                        const dueDateInWindow =
                            !isBefore(boundaries.dueDate, winFrom) &&
                            !isAfter(boundaries.dueDate, winTo);
                        const isNotPastPeriod = !isBefore(boundaries.dueDate, currentPeriodStart);

                        if (dueDateInWindow && isNotPastPeriod) {
                            if (!bucketsByKey.has(boundaries.cycleKey)) {
                                bucketsByKey.set(boundaries.cycleKey, {
                                    boundaries,
                                    rule,
                                    source,
                                    entries: [],
                                });
                            }
                        }
                        continue;
                    }

                    // Projeções iniciam a partir do período corrente em diante (sem projetar meses retroativos passados)
                    const effectiveProjectionStart = isAfter(winFrom, currentPeriodStart)
                        ? winFrom
                        : currentPeriodStart;

                    let cursor = strategy.stepCycle(effectiveProjectionStart, -1, rule.interval);
                    const maxCursor = strategy.stepCycle(winTo, 2, rule.interval);

                    while (!isAfter(cursor, maxCursor)) {
                        const boundaries = strategy.getCycleBoundaries(cursor, rule);

                        // O ciclo pertence a esta regra se o período-base começa dentro da vigência dela
                        const periodStartsAt = boundaries.beginsAt;
                        const belongsToThisRule =
                            !isBefore(periodStartsAt, ruleStart) &&
                            (!ruleEnd || isBefore(periodStartsAt, ruleEnd));

                        // O ciclo deve estar dentro da vigência do contrato
                        const withinAgreement =
                            !isBefore(boundaries.endsAt, agreementStarts) &&
                            (!agreementEnds || !isAfter(boundaries.beginsAt, agreementEnds));

                        // O vencimento deve cair dentro da janela solicitada
                        const dueDateInWindow =
                            !isBefore(boundaries.dueDate, winFrom) &&
                            !isAfter(boundaries.dueDate, winTo);

                        // Ciclos puramente projetados não devem pertencer a períodos anteriores ao período corrente
                        const isNotPastPeriod = !isBefore(boundaries.dueDate, currentPeriodStart);

                        if (belongsToThisRule && withinAgreement && dueDateInWindow && isNotPastPeriod) {
                            if (!bucketsByKey.has(boundaries.cycleKey)) {
                                bucketsByKey.set(boundaries.cycleKey, {
                                    boundaries,
                                    rule,
                                    source,
                                    entries: [],
                                });
                            }
                        }

                        cursor = strategy.stepCycle(cursor, 1, rule.interval);
                    }
                }
            }

            // 3. Processar cada ciclo do contrato
            for (const bucket of bucketsByKey.values()) {
                const { boundaries, entries } = bucket;

                // Direção que aumenta a obrigação
                const directionThatIncreases: "CREDIT" | "DEBIT" =
                    source.balanceType === "RECEIVABLE" ? "CREDIT" : "DEBIT";

                let recognizedAmount = 0;
                let paidAmount = 0;
                let totalEntriesCount = 0;
                let latestSettlementDate: Date | null = null;

                for (const entry of entries) {
                    totalEntriesCount += entry.count;

                    // signed: +amount se aumenta a obrigação, -amount se diminui
                    const signed =
                        entry.direction === directionThatIncreases
                            ? entry.amount
                            : -entry.amount;

                    // Classificação do tipo da transação
                    const effectiveType =
                        entry.type === "REVERSAL" && entry.reversesEntryType
                            ? entry.reversesEntryType
                            : entry.type;

                    const isRecognized =
                        ["ACCRUAL", "CLAIM_OPENING", "ADJUSTMENT"].includes(effectiveType) ||
                        (effectiveType === "DIRECT" && source.balanceType === "CREDIT");

                    const isPaid = ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"].includes(
                        effectiveType
                    );

                    if (isRecognized) {
                        recognizedAmount += signed;
                    } else if (isPaid) {
                        // Pagamentos possuem direção oposta à que aumenta a obrigação;
                        // logo, 'signed' é negativo para pagamento normal (-signed é positivo)
                        paidAmount += -signed;
                        if (!latestSettlementDate || isAfter(entry.referenceDate, latestSettlementDate)) {
                            latestSettlementDate = entry.referenceDate;
                        }
                    }
                }

                paidAmount = Math.max(0, paidAmount);

                // Valor esperado
                let expectedAmount = 0;
                if (source.balanceType !== "CREDIT") {
                    expectedAmount = this.calculateVigenteAmount(
                        source.amountLog,
                        boundaries.dueDate
                    );
                }

                const totalAmount =
                    recognizedAmount > 0 ? recognizedAmount : expectedAmount;

                const remainingAmount = Math.max(0, totalAmount - paidAmount);

                // Omissão de ciclos de cartão de crédito vazios
                if (
                    source.balanceType === "CREDIT" &&
                    recognizedAmount === 0 &&
                    paidAmount === 0
                ) {
                    continue;
                }

                // Se o contrato tem includeInProjection=false e não possui lançamentos, omitir
                if (!source.includeInProjection && totalEntriesCount === 0) {
                    continue;
                }

                // Ciclos projetados (sem lançamentos reais) devem ser apenas do período corrente ou futuros
                const currentPeriodStart = this.resolveCurrentPeriodStart(bucket.rule.frequency, today);
                if (totalEntriesCount === 0 && isBefore(boundaries.dueDate, currentPeriodStart)) {
                    continue;
                }

                const status = this.calculateStatus(
                    totalEntriesCount,
                    totalAmount,
                    paidAmount,
                    remainingAmount,
                    recognizedAmount,
                    boundaries.dueDate,
                    boundaries.endsAt,
                    today
                );

                const item: CommitmentCycleItem = {
                    cycleKey: boundaries.cycleKey,
                    agreementId: source.agreementId,
                    balanceId: source.balanceId,
                    balanceName: source.balanceName,
                    balanceType: source.balanceType === "CREDIT" ? "CREDIT" : "COMMITMENT",
                    label: boundaries.label,
                    from: format(boundaries.beginsAt, "yyyy-MM-dd"),
                    to: format(boundaries.endsAt, "yyyy-MM-dd"),
                    closingDate: boundaries.closingDate ?? boundaries.dueDate,
                    dueDate: boundaries.dueDate,
                    totalAmount,
                    paidAmount,
                    remainingAmount,
                    status,
                    movementsCount: totalEntriesCount,
                    settlementDate: status === "PAID" ? latestSettlementDate : null,
                };

                result.push(item);
            }
        }

        // Ordenação por dueDate ASC
        result.sort((a, b) => {
            const timeDiff = a.dueDate.getTime() - b.dueDate.getTime();
            if (timeDiff !== 0) return timeDiff;
            return a.balanceId - b.balanceId;
        });

        return result;
    }

    /**
     * Projeta ciclos para a tela de quitação de obrigações (PAY_OBLIGATION / RECEIVE_OBLIGATION).
     *
     * Regras:
     * - Status refinados: SETTLED, OPEN, PARTIAL, PROJECTED, UNRECORDED.
     * - MAX_ADVANCE: não projeta ciclos além de maxAdvanceMonths (padrão 3 meses) do período corrente.
     * - Omissão de ciclos vazios para cartões de crédito (CREDIT).
     */
    projectObligationCycles(
        source: AgreementCycleSourceData,
        window: CycleWindow,
        now: Date,
        maxAdvanceMonths: number = 3
    ): CycleView[] {
        const today = startOfDay(now);
        const winFrom = startOfDay(window.from);
        const winTo = startOfDay(window.to);

        const agreementStarts = startOfDay(source.startsAt);
        const agreementEnds = source.endsAt ? startOfDay(source.endsAt) : null;

        const rules = [...source.rules].sort(
            (a, b) =>
                startOfDay(a.effectiveFrom).getTime() -
                startOfDay(b.effectiveFrom).getTime()
        );

        if (rules.length === 0) return [];

        const bucketsByKey = new Map<string, InternalCycleBucket>();

        // 1. Injetar lançamentos reais nos baldes
        for (const rule of rules) {
            const strategy = CycleEngineRegistry.getStrategy(rule.frequency);
            for (const entry of rule.entries) {
                const shiftedRef = strategy.resolveReferenceDate(entry.referenceDate, rule);
                const boundaries = strategy.getCycleBoundaries(shiftedRef, rule);

                if (isBefore(boundaries.dueDate, winFrom) || isAfter(boundaries.dueDate, winTo)) {
                    continue;
                }

                if (!bucketsByKey.has(boundaries.cycleKey)) {
                    bucketsByKey.set(boundaries.cycleKey, {
                        boundaries,
                        rule,
                        source,
                        entries: [],
                    });
                }
                bucketsByKey.get(boundaries.cycleKey)!.entries.push(entry);
            }
        }

        // 2. Se o contrato participa da projeção (e não é CREDIT puro), gerar ciclos na janela até MAX_ADVANCE
        if (source.includeInProjection && source.balanceType !== "CREDIT") {
            for (let rIdx = 0; rIdx < rules.length; rIdx++) {
                const rule = rules[rIdx];
                const nextRule = rules[rIdx + 1];
                const strategy = CycleEngineRegistry.getStrategy(rule.frequency);

                const ruleStart = startOfDay(rule.effectiveFrom);
                const ruleEnd = nextRule ? startOfDay(nextRule.effectiveFrom) : null;
                const currentPeriodStart = this.resolveCurrentPeriodStart(rule.frequency, today);

                // O maior avanço entre maxAdvanceMonths (ex: 3 meses) e maxAdvanceCycles (ex: 3 ciclos)
                const advanceMonthsDate = addMonths(currentPeriodStart, maxAdvanceMonths);
                const advanceCyclesDate = strategy.stepCycle(currentPeriodStart, maxAdvanceMonths, rule.interval);
                const maxAdvanceDate = isAfter(advanceMonthsDate, advanceCyclesDate)
                    ? advanceMonthsDate
                    : advanceCyclesDate;

                if (rule.frequency === "ONCE") {
                    const boundaries = strategy.getCycleBoundaries(rule.effectiveFrom, rule);
                    const dueDateInWindow =
                        !isBefore(boundaries.dueDate, winFrom) &&
                        !isAfter(boundaries.dueDate, winTo);

                    if (dueDateInWindow && !isAfter(boundaries.dueDate, maxAdvanceDate)) {
                        if (!bucketsByKey.has(boundaries.cycleKey)) {
                            bucketsByKey.set(boundaries.cycleKey, {
                                boundaries,
                                rule,
                                source,
                                entries: [],
                            });
                        }
                    }
                    continue;
                }

                // Projeção sintética ocorre exclusivamente do período corrente para a frente
                const projectionStart = isAfter(currentPeriodStart, agreementStarts)
                    ? currentPeriodStart
                    : agreementStarts;
                let cursor = projectionStart;
                const maxCursor = strategy.stepCycle(winTo, 1, rule.interval);

                while (!isAfter(cursor, maxCursor)) {
                    const boundaries = strategy.getCycleBoundaries(cursor, rule);
                    const periodStartsAt = boundaries.beginsAt;

                    const belongsToThisRule =
                        !isBefore(periodStartsAt, ruleStart) &&
                        (!ruleEnd || isBefore(periodStartsAt, ruleEnd));

                    const withinAgreement =
                        !isBefore(boundaries.endsAt, agreementStarts) &&
                        (!agreementEnds || !isAfter(boundaries.beginsAt, agreementEnds));

                    const dueDateInWindow =
                        !isBefore(boundaries.dueDate, winFrom) &&
                        !isAfter(boundaries.dueDate, winTo);

                    const withinMaxAdvance = !isAfter(boundaries.dueDate, maxAdvanceDate);

                    if (belongsToThisRule && withinAgreement && dueDateInWindow && withinMaxAdvance) {
                        if (!bucketsByKey.has(boundaries.cycleKey)) {
                            bucketsByKey.set(boundaries.cycleKey, {
                                boundaries,
                                rule,
                                source,
                                entries: [],
                            });
                        }
                    }

                    cursor = strategy.stepCycle(cursor, 1, rule.interval);
                }
            }
        }

        // 3. Processar cada ciclo
        const result: CycleView[] = [];

        for (const bucket of bucketsByKey.values()) {
            const { boundaries, entries, rule } = bucket;

            const directionThatIncreases: "CREDIT" | "DEBIT" =
                source.balanceType === "RECEIVABLE" ? "CREDIT" : "DEBIT";

            let recognizedAmount = 0;
            let paidAmount = 0;
            let totalEntriesCount = 0;

            for (const entry of entries) {
                totalEntriesCount += entry.count;

                const signed =
                    entry.direction === directionThatIncreases
                        ? entry.amount
                        : -entry.amount;

                const effectiveType =
                    entry.type === "REVERSAL" && entry.reversesEntryType
                        ? entry.reversesEntryType
                        : entry.type;

                const isRecognized =
                    ["ACCRUAL", "CLAIM_OPENING", "ADJUSTMENT"].includes(effectiveType) ||
                    (effectiveType === "DIRECT" && source.balanceType === "CREDIT");

                const isPaid = ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"].includes(
                    effectiveType
                );

                if (isRecognized) {
                    recognizedAmount += signed;
                } else if (isPaid) {
                    paidAmount += -signed;
                }
            }

            paidAmount = Math.max(0, paidAmount);

            // Omissão de ciclos de cartão de crédito vazios
            if (
                source.balanceType === "CREDIT" &&
                recognizedAmount === 0 &&
                paidAmount === 0
            ) {
                continue;
            }

            let expectedAmount: number | null = null;
            if (source.balanceType !== "CREDIT") {
                expectedAmount = this.calculateVigenteAmount(
                    source.amountLog,
                    boundaries.dueDate
                );
            }

            const totalAmount =
                recognizedAmount > 0 ? recognizedAmount : (expectedAmount ?? 0);
            const remainingAmount = Math.max(0, totalAmount - paidAmount);

            const currentPeriodStart = this.resolveCurrentPeriodStart(rule.frequency, today);

            let status: CycleStatus;
            if (totalEntriesCount === 0) {
                if (isBefore(boundaries.dueDate, currentPeriodStart)) {
                    status = "UNRECORDED";
                } else {
                    status = "PROJECTED";
                }
            } else if (totalAmount > 0 && paidAmount >= totalAmount) {
                status = "SETTLED";
            } else if (paidAmount > 0) {
                status = "PARTIAL";
            } else {
                status = "OPEN";
            }

            const isOverdue =
                remainingAmount > 0 && isBefore(startOfDay(boundaries.dueDate), today);

            // Na tela de quitação de obrigações, omitir ciclos já liquidados e projeções vazias do passado
            if (status === "SETTLED" || remainingAmount === 0 || status === "UNRECORDED") {
                continue;
            }

            result.push({
                agreementId: source.agreementId,
                referenceDate: format(boundaries.beginsAt, "yyyy-MM-dd"),
                dueDate: format(boundaries.dueDate, "yyyy-MM-dd"),
                expected: expectedAmount,
                accrued: recognizedAmount,
                settled: paidAmount,
                outstanding: remainingAmount,
                status,
                isOverdue,
                label: boundaries.label,
            });
        }

        result.sort((a, b) => {
            const timeDiff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            if (timeDiff !== 0) return timeDiff;
            return a.referenceDate.localeCompare(b.referenceDate);
        });

        return result;
    }

    /**
     * Aplica filtros de busca textual, tipo de saldo e status sobre os ciclos.
     * Mantém a ordenação por dueDate ASC.
     */
    applyFilters(
        cycles: CommitmentCycleItem[],
        filter?: CommitmentCycleFilters
    ): CommitmentCycleItem[] {
        if (!filter) return [...cycles];

        let filtered = [...cycles];

        if (filter.q && filter.q.trim().length > 0) {
            const searchLower = filter.q.trim().toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.balanceName.toLowerCase().includes(searchLower) ||
                    c.label.toLowerCase().includes(searchLower)
            );
        }

        if (filter.balanceTypes && filter.balanceTypes.length > 0) {
            filtered = filtered.filter((c) =>
                filter.balanceTypes!.includes(c.balanceType)
            );
        }

        if (filter.statuses && filter.statuses.length > 0) {
            filtered = filtered.filter((c) => filter.statuses!.includes(c.status));
        }

        return filtered;
    }

    /**
     * Calcula o resumo de valores e contagens sobre a lista de ciclos.
     */
    summarizeCycles(cycles: CommitmentCycleItem[]): CommitmentsPeriodSummary {
        let totalAmount = 0;
        let paidAmount = 0;
        let overdueAmount = 0;
        let overdueCount = 0;
        let pendingAmount = 0;

        for (const cycle of cycles) {
            totalAmount += cycle.totalAmount;
            paidAmount += cycle.paidAmount;

            if (cycle.status === "OVERDUE") {
                overdueAmount += cycle.remainingAmount;
                overdueCount += 1;
            } else if (
                cycle.status === "PROJECTED" ||
                cycle.status === "OPEN" ||
                cycle.status === "PENDING" ||
                cycle.status === "PARTIAL"
            ) {
                pendingAmount += cycle.remainingAmount;
            }
        }

        return {
            totalAmount,
            paidAmount,
            pendingAmount,
            overdueAmount,
            overdueCount,
        };
    }

    /**
     * Calcula o valor vigente do log append-only na data de referência:
     * valorVigente(data) = max(0, Σ amount das entradas com effectiveAt <= data).
     */
    private calculateVigenteAmount(
        amountLog: { amount: number; effectiveAt: Date }[],
        targetDate: Date
    ): number {
        const targetCivil = startOfDay(targetDate);
        let sum = 0;
        for (const entry of amountLog) {
            if (!isAfter(startOfDay(entry.effectiveAt), targetCivil)) {
                sum += entry.amount;
            }
        }
        return Math.max(0, sum);
    }

    /**
     * Máquina de estados para definição de status do ciclo.
     */
    private calculateStatus(
        totalEntriesCount: number,
        totalAmount: number,
        paidAmount: number,
        remainingAmount: number,
        recognizedAmount: number,
        dueDate: Date,
        endsAt: Date,
        today: Date
    ): CommitmentCycleStatusEnum {
        // 0. Ciclo puramente projetado/estimado sem lançamentos consolidados
        if (totalEntriesCount === 0) {
            return "PROJECTED";
        }

        const cycleDue = startOfDay(dueDate);
        const cycleEnd = startOfDay(endsAt);

        // 1. Quitado integralmente
        if (totalAmount > 0 && paidAmount >= totalAmount) {
            return "PAID";
        }

        // 2. Vencido
        if (remainingAmount > 0 && isBefore(cycleDue, today)) {
            return "OVERDUE";
        }

        // 3. Parcialmente pago
        if (paidAmount > 0 && paidAmount < totalAmount) {
            return "PARTIAL";
        }

        // 4. Fechado / provisionado aguardando pagamento
        if (
            paidAmount === 0 &&
            remainingAmount > 0 &&
            (isAfter(today, cycleEnd) || recognizedAmount > 0)
        ) {
            return "PENDING";
        }

        // 5. Em aberto
        return "OPEN";
    }

    /**
     * Determina o início do período corrente com base na frequência da regra de ciclo.
     */
    private resolveCurrentPeriodStart(
        frequency: "ONCE" | "MONTHLY" | "WEEKLY" | "YEARLY",
        today: Date
    ): Date {
        switch (frequency) {
            case "ONCE":
                return today;
            case "WEEKLY":
                return startOfWeek(today, { weekStartsOn: 1 });
            case "YEARLY":
                return startOfYear(today);
            case "MONTHLY":
            default:
                return startOfMonth(today);
        }
    }
}
