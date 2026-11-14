import { prisma } from "@/lib/prisma";
import { addMonths, subMonths } from "date-fns";
import { toCivilDate } from "@/lib/formatters";
import {
    ContractRawData,
    IContractProfileQueries,
    RawContractAgreement,
} from "@/modules/contracts/application/interfaces/contract-profile-queries.interface";
import {
    AgreementCycleSourceData,
    AmountLogEntryData,
    CycleAggregatedEntryData,
    CycleRuleWithEntriesData,
    CycleWindow,
    EntryTypeData,
} from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface";

interface AggregatedCycleRow {
    cycleRuleId: number;
    referenceDate: Date;
    type: string;
    reversesEntryType: string | null;
    direction: "CREDIT" | "DEBIT";
    amount: number;
    count: number;
}

export class ContractProfilePrismaQueries implements IContractProfileQueries {
    async findContractProfileData(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number },
        window: CycleWindow
    ): Promise<ContractRawData | null> {
        const includeConfig = {
            balance: true,
            rules: {
                orderBy: { effectiveFrom: "asc" as const },
            },
            amountEntries: {
                orderBy: { effectiveAt: "asc" as const },
            },
        };

        const targetBalanceId = identifier.balanceId ?? identifier.agreementId;
        if (!targetBalanceId) return null;

        const agreement = await prisma.agreement.findFirst({
            where: {
                balanceId: targetBalanceId,
                balance: { contextId },
            },
            include: includeConfig,
        });

        if (!agreement) return null;

        // Janela com buffer de 2 meses antes e 2 meses depois para cobertura de ciclos com fechamento customizado
        const bufferFrom = subMonths(window.from, 2);
        const bufferTo = addMonths(window.to, 2);

        // Agregação bruta via SQL a partir da view vw_entry_cycle_rule
        const rows = await prisma.$queryRaw<AggregatedCycleRow[]>`
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
            WHERE v."balanceId" = ${agreement.balanceId}
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
            effectiveFrom: toCivilDate(r.effectiveFrom),
            frequency: agreement.frequency as "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY",
            interval: agreement.interval,
            closingDay: r.closingDay,
            dueDay: r.dueDay,
            entries: entriesByRuleId.get(r.id) ?? [],
        }));

        const amountLog: AmountLogEntryData[] = agreement.amountEntries.map((e) => ({
            amount: e.amount,
            effectiveAt: e.effectiveAt,
        }));

        const cycleSource: AgreementCycleSourceData = {
            agreementId: agreement.balanceId,
            balanceId: agreement.balance.id,
            balanceName: agreement.balance.name,
            balanceType: agreement.balance.balanceType as
                | "PAYABLE"
                | "RECEIVABLE"
                | "CREDIT",
            includeInProjection: agreement.includeInProjection,
            startsAt: toCivilDate(agreement.startsAt),
            endsAt: agreement.endsAt ? toCivilDate(agreement.endsAt) : null,
            amountLog,
            rules,
        };

        const rawAgreement: RawContractAgreement = {
            id: agreement.balance.id,
            balanceId: agreement.balance.id,
            frequency: agreement.frequency,
            interval: agreement.interval,
            includeInProjection: agreement.includeInProjection,
            startsAt: toCivilDate(agreement.startsAt),
            endsAt: agreement.endsAt ? toCivilDate(agreement.endsAt) : null,
            createdAt: agreement.createdAt,
            balance: {
                id: agreement.balance.id,
                name: agreement.balance.name,
                balanceType: agreement.balance.balanceType,
                removedAt: agreement.balance.removedAt,
            },
            rules: agreement.rules.map((r) => ({
                id: r.id,
                agreementId: r.agreementId,
                effectiveFrom: toCivilDate(r.effectiveFrom),
                closingDay: r.closingDay,
                dueDay: r.dueDay,
            })),
            amountEntries: agreement.amountEntries.map((e) => ({
                id: e.id,
                amount: e.amount,
                effectiveAt: e.effectiveAt,
                reason: e.reason,
                createdAt: e.createdAt,
            })),
        };

        return {
            agreement: rawAgreement,
            cycleSource,
        };
    }
}
