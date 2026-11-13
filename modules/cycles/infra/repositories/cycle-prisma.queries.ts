import { prisma } from "@/lib/prisma";
import { addMonths, endOfDay, startOfDay } from "date-fns";
import { toCivilDate } from "@/lib/formatters";
import {
    CycleAggregatedAmounts,
    CycleRuleItem,
    CycleRulesWindowData,
    ICycleQueries,
} from "../../application/interfaces/cycle-queries.interface";

export class CyclePrismaQueries implements ICycleQueries {
    async findAdjacentCycleRules(
        contextId: number,
        balanceId: number,
        from: Date,
        to: Date
    ): Promise<CycleRulesWindowData | null> {
        const balance = await prisma.balance.findFirst({
            where: {
                id: balanceId,
                contextId,
                removedAt: null,
            },
            include: {
                agreement: {
                    include: {
                        amountEntries: {
                            orderBy: { effectiveAt: "asc" },
                        },
                    },
                },
            },
        });

        if (!balance?.agreement) {
            return null;
        }

        const civilFrom = startOfDay(from);
        const civilTo = endOfDay(to);

        // 1. Regra âncora: última regra com effectiveFrom <= civilFrom
        const anchorRule = await prisma.cycleRule.findFirst({
            where: {
                agreementId: balanceId,
                effectiveFrom: { lte: civilFrom },
            },
            orderBy: { effectiveFrom: "desc" },
        });

        // 2. Regras no horizonte: da âncora até 3 meses após to
        const horizonStart = anchorRule ? anchorRule.effectiveFrom : civilFrom;
        const horizonEnd = addMonths(civilTo, 3);

        const rawRules = await prisma.cycleRule.findMany({
            where: {
                agreementId: balanceId,
                effectiveFrom: {
                    gte: horizonStart,
                    lte: horizonEnd,
                },
            },
            orderBy: { effectiveFrom: "asc" },
        });

        // Se rawRules estiver vazio (ex: todas as regras começam depois do horizonte), pega a primeira regra existente
        if (rawRules.length === 0) {
            const earliestRule = await prisma.cycleRule.findFirst({
                where: { agreementId: balanceId },
                orderBy: { effectiveFrom: "asc" },
            });
            if (earliestRule) {
                rawRules.push(earliestRule);
            }
        }

        // 3. Regra posterior ao horizonte para saber o effectiveTo da última regra
        const lastRule = rawRules[rawRules.length - 1];
        const trailingRule = lastRule
            ? await prisma.cycleRule.findFirst({
                  where: {
                      agreementId: balanceId,
                      effectiveFrom: { gt: lastRule.effectiveFrom },
                  },
                  orderBy: { effectiveFrom: "asc" },
              })
            : null;

        const rules: CycleRuleItem[] = rawRules.map((r, idx) => {
            const nextInArray = rawRules[idx + 1] ?? trailingRule;
            return {
                id: r.id,
                agreementId: r.agreementId,
                effectiveFrom: toCivilDate(r.effectiveFrom),
                effectiveTo: nextInArray ? toCivilDate(nextInArray.effectiveFrom) : null,
                frequency: r.frequency as "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY",
                interval: r.interval,
                closingDay: r.closingDay,
                dueDay: r.dueDay,
            };
        });

        const amountLog = balance.agreement.amountEntries.map((e) => ({
            amount: e.amount,
            effectiveAt: toCivilDate(e.effectiveAt),
        }));

        return {
            balance: {
                id: balance.id,
                name: balance.name,
                balanceType: balance.balanceType,
                contextId: balance.contextId,
            },
            agreement: {
                startsAt: toCivilDate(balance.agreement.startsAt),
                endsAt: balance.agreement.endsAt
                    ? toCivilDate(balance.agreement.endsAt)
                    : null,
                includeInProjection: balance.agreement.includeInProjection,
            },
            rules,
            amountLog,
        };
    }

    async aggregateCycleAmounts(
        balanceId: number,
        from: Date,
        to: Date,
        isOnce: boolean = false,
        balanceType: CycleRulesWindowData["balance"]["balanceType"] = "PAYABLE"
    ): Promise<CycleAggregatedAmounts> {
        const start = startOfDay(from);
        const end = endOfDay(to);

        const isReceivable = balanceType === "RECEIVABLE";
        const increaseDirection = isReceivable ? "CREDIT" : "DEBIT";
        const decreaseDirection = isReceivable ? "DEBIT" : "CREDIT";

        const dateCondition = isOnce
            ? {}
            : {
                  OR: [
                      { competanceDate: { not: null, gte: start, lte: end } },
                      { competanceDate: null, dueDate: { gte: start, lte: end } },
                  ],
              };

        const activeEntryCondition = {
            reversesEntryId: null,
            reversedBy: null,
            ...dateCondition,
        };

        const [recognizedAgg, settledAgg, transferredAgg, lastSettlementEntry] =
            await Promise.all([
                // 1. Total reconhecido (ACCRUAL, CLAIM_OPENING que aumenta, ADJUSTMENT, DIRECT)
                prisma.movement.aggregate({
                    where: {
                        balanceId,
                        OR: [
                            {
                                entry: {
                                    ...activeEntryCondition,
                                    type: { in: ["ACCRUAL", "ADJUSTMENT", "DIRECT"] },
                                },
                            },
                            {
                                direction: increaseDirection,
                                entry: {
                                    ...activeEntryCondition,
                                    type: "CLAIM_OPENING",
                                },
                            },
                        ],
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                }),

                // 2. Total liquidado (SETTLEMENT, CLAIM_PAYMENT, CLAIM_RECEIPT)
                prisma.movement.aggregate({
                    where: {
                        balanceId,
                        entry: {
                            ...activeEntryCondition,
                            type: { in: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] },
                        },
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                }),

                // 3. Transferências / Cessões (TRANSFER e CLAIM_OPENING na direção de redução/cessão)
                prisma.movement.aggregate({
                    where: {
                        balanceId,
                        OR: [
                            {
                                entry: {
                                    ...activeEntryCondition,
                                    type: "TRANSFER",
                                },
                            },
                            {
                                direction: decreaseDirection,
                                entry: {
                                    ...activeEntryCondition,
                                    type: "CLAIM_OPENING",
                                },
                            },
                        ],
                    },
                    _sum: { amount: true },
                    _count: { id: true },
                }),

                // 4. Última liquidação para capturar settlementDate e comprovante
                prisma.entry.findFirst({
                    where: {
                        reversesEntryId: null,
                        reversedBy: null,
                        type: { in: ["SETTLEMENT", "CLAIM_PAYMENT", "CLAIM_RECEIPT"] },
                        movements: { some: { balanceId } },
                        ...dateCondition,
                    },
                    orderBy: [
                        { competanceDate: "desc" },
                        { dueDate: "desc" },
                        { createdAt: "desc" },
                    ],
                    select: {
                        competanceDate: true,
                        dueDate: true,
                        movements: {
                            where: { balanceId },
                            select: { direction: true },
                        },
                    },
                }),
            ]);

        const movementsCount =
            (recognizedAgg._count.id ?? 0) +
            (settledAgg._count.id ?? 0) +
            (transferredAgg._count.id ?? 0);

        const hasSettlementReceipt =
            lastSettlementEntry?.movements.some((m) => m.direction === decreaseDirection) ?? false;

        const latestSettlementDate =
            lastSettlementEntry?.competanceDate ?? lastSettlementEntry?.dueDate ?? null;

        return {
            movementsCount,
            recognizedSignedAmount: recognizedAgg._sum.amount ?? 0,
            settledSignedAmount: settledAgg._sum.amount ?? 0,
            transferredSignedAmount: transferredAgg._sum.amount ?? 0,
            netSignedAmount:
                (recognizedAgg._sum.amount ?? 0) +
                (settledAgg._sum.amount ?? 0) +
                (transferredAgg._sum.amount ?? 0),
            hasSettlementReceipt,
            latestSettlementDate,
        };
    }
}
