import { prisma } from "@/lib/prisma";
import { addMonths, subMonths } from "date-fns";
import {
    AgreementAmountHistoryItem,
    AgreementDetailRule,
} from "@/modules/contracts/models/agreement-detail.schema";
import {
    AgreementEntityData,
    IAgreementDetailQueries,
} from "@/modules/contracts/application/interfaces/agreement-detail-queries.interface";
import {
    AgreementCycleSourceData,
    AmountLogEntryData,
    CycleAggregatedEntryData,
    CycleRuleWithEntriesData,
    CycleWindow,
    EntryTypeData,
} from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";

interface AggregatedRow {
    cycleRuleId: number;
    referenceDate: Date;
    type: string;
    reversesEntryType: string | null;
    direction: "CREDIT" | "DEBIT";
    amount: number;
    count: number;
}

export class AgreementDetailPrismaQueries implements IAgreementDetailQueries {
    async findAgreementDetail(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number }
    ): Promise<AgreementEntityData | null> {
        const agreement = await prisma.agreement.findFirst({
            where: identifier.agreementId
                ? { id: identifier.agreementId, balance: { contextId } }
                : { balanceId: identifier.balanceId, balance: { contextId } },
            include: {
                balance: true,
                rules: {
                    orderBy: { effectiveFrom: "desc" },
                    take: 1,
                },
                amountEntries: {
                    orderBy: { effectiveAt: "asc" },
                },
            },
        });

        if (!agreement) return null;

        const activeRule = agreement.rules[0];
        const rule: AgreementDetailRule | null = activeRule
            ? {
                  id: activeRule.id,
                  frequency: activeRule.frequency as "WEEKLY" | "MONTHLY" | "YEARLY",
                  interval: activeRule.interval,
                  closingDay: activeRule.closingDay,
                  dueDay: activeRule.dueDay,
                  effectiveFrom: activeRule.effectiveFrom,
              }
            : null;

        const amountHistory: AgreementAmountHistoryItem[] =
            agreement.amountEntries.map((e) => ({
                id: e.id,
                amount: e.amount,
                effectiveAt: e.effectiveAt,
                reason: e.reason,
                createdAt: e.createdAt,
            }));

        return {
            id: agreement.id,
            balanceId: agreement.balance.id,
            balanceName: agreement.balance.name,
            balanceType: agreement.balance.balanceType as
                | "COMMITMENT"
                | "PAYABLE"
                | "RECEIVABLE"
                | "CREDIT",
            includeInProjection: agreement.includeInProjection,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
            isArchived: agreement.balance.removedAt !== null,
            rule,
            amountHistory,
        };
    }

    async findAgreementCycleSource(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number },
        window: CycleWindow
    ): Promise<AgreementCycleSourceData | null> {
        const agreement = await prisma.agreement.findFirst({
            where: identifier.agreementId
                ? { id: identifier.agreementId, balance: { contextId } }
                : { balanceId: identifier.balanceId, balance: { contextId } },
            include: {
                balance: true,
                rules: {
                    orderBy: { effectiveFrom: "asc" },
                },
                amountEntries: {
                    orderBy: { effectiveAt: "asc" },
                },
            },
        });

        if (!agreement) return null;

        // Janela com folga de 2 meses antes e 2 meses depois para captura de ciclos deslocados por fechamento
        const bufferFrom = subMonths(window.from, 2);
        const bufferTo = addMonths(window.to, 2);

        // Agregação bruta via SQL da view vw_entry_cycle_rule
        const rows = await prisma.$queryRaw<AggregatedRow[]>`
            SELECT 
                v."cycleRuleId",
                v."referenceDate",
                e."type"::text AS "type",
                rev."type"::text AS "reversesEntryType",
                m."direction"::text AS "direction",
                COALESCE(SUM(ABS(m."amount")), 0)::int AS "amount",
                COUNT(*)::int AS "count"
            FROM "vw_entry_cycle_rule" v
            JOIN "Entry" e ON e.id = v."entryId"
            JOIN "Movement" m ON m."entryId" = e.id AND m."balanceId" = v."balanceId"
            LEFT JOIN "Entry" rev ON rev.id = e."reversesEntryId"
            WHERE v."agreementId" = ${agreement.id}
              AND v."referenceDate" >= ${bufferFrom}
              AND v."referenceDate" <= ${bufferTo}
            GROUP BY v."cycleRuleId", v."referenceDate", e."type", rev."type", m."direction"
            ORDER BY v."referenceDate" ASC
        `;

        // Agrupar entradas pré-agregadas por cycleRuleId
        const entriesByRuleId = new Map<number, CycleAggregatedEntryData[]>();
        for (const row of rows) {
            const list = entriesByRuleId.get(row.cycleRuleId) ?? [];
            list.push({
                referenceDate: new Date(row.referenceDate),
                type: row.type as EntryTypeData,
                reversesEntryType: (row.reversesEntryType as EntryTypeData) ?? null,
                direction: row.direction,
                amount: row.amount,
                count: row.count,
            });
            entriesByRuleId.set(row.cycleRuleId, list);
        }

        const rules: CycleRuleWithEntriesData[] = agreement.rules.map((r) => ({
            id: r.id,
            agreementId: r.agreementId,
            effectiveFrom: r.effectiveFrom,
            frequency: r.frequency as "WEEKLY" | "MONTHLY" | "YEARLY",
            interval: r.interval,
            closingDay: r.closingDay,
            dueDay: r.dueDay,
            entries: entriesByRuleId.get(r.id) ?? [],
        }));

        const amountLog: AmountLogEntryData[] = agreement.amountEntries.map((e) => ({
            amount: e.amount,
            effectiveAt: e.effectiveAt,
        }));

        return {
            agreementId: agreement.id,
            balanceId: agreement.balance.id,
            balanceName: agreement.balance.name,
            balanceType: agreement.balance.balanceType as
                | "COMMITMENT"
                | "PAYABLE"
                | "RECEIVABLE"
                | "CREDIT",
            includeInProjection: agreement.includeInProjection,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
            amountLog,
            rules,
        };
    }
}
