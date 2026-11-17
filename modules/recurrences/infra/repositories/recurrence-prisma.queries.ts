import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/prisma/client";
import type { BalanceWhereInput } from "@/prisma/generated/prisma/models";
import type {
    RecurrenceFilters,
    RecurrenceListItem,
} from "../../models/schemas/recurrence-item.schema";
import type { IRecurrenceQueries } from "../../application/interfaces/recurrence-queries.interface";
import {
    PrismaRecurrenceRecord,
    RecurrenceMapper,
} from "../mappers/recurrence.mapper";

export class RecurrencePrismaQueries implements IRecurrenceQueries {
    private static readonly defaultInclude = {
        appearance: true,
        parent: {
            include: {
                appearance: true,
            },
        },
        agreement: {
            include: {
                rules: {
                    orderBy: { effectiveFrom: "desc" as const },
                },
                amountEntries: {
                    orderBy: { effectiveAt: "asc" as const },
                },
            },
        },
    };

    async listRecurrencesByContextId(
        contextId: number,
        filter?: RecurrenceFilters
    ): Promise<RecurrenceListItem[]> {
        const today = new Date();
        const where = this.buildWhereClause(contextId, filter, today);

        const rawBalances = (await prisma.balance.findMany({
            where,
            include: RecurrencePrismaQueries.defaultInclude,
            orderBy: { name: "asc" },
        })) as PrismaRecurrenceRecord[];

        const balanceIds = rawBalances.map((b) => b.id);
        const overdueBalanceIds = await this.findOverdueBalanceIds(
            balanceIds,
            today
        );

        let items = rawBalances.map((balance) =>
            RecurrenceMapper.toListItem(
                balance,
                overdueBalanceIds.has(balance.id),
                today
            )
        );

        if (filter?.active === "OVERDUE") {
            items = items.filter((item) => item.isOverdue);
        } else if (filter?.active === "ACTIVE") {
            items = items.filter((item) => item.isActive && !item.isOverdue);
        }

        return items;
    }

    async findRecurrenceById(
        balanceId: number,
        contextId: number
    ): Promise<RecurrenceListItem | null> {
        const today = new Date();
        const rawBalance = (await prisma.balance.findFirst({
            where: {
                id: balanceId,
                contextId,
                balanceType: { in: ["PAYABLE", "RECEIVABLE"] },
                agreement: {
                    isNot: null,
                    is: {
                        frequency: { not: "ONCE" },
                    },
                },
            },
            include: RecurrencePrismaQueries.defaultInclude,
        })) as PrismaRecurrenceRecord | null;

        if (!rawBalance) {
            return null;
        }

        const overdueBalanceIds = await this.findOverdueBalanceIds(
            [balanceId],
            today
        );

        return RecurrenceMapper.toListItem(
            rawBalance,
            overdueBalanceIds.has(balanceId),
            today
        );
    }

    private buildWhereClause(
        contextId: number,
        filter?: RecurrenceFilters,
        today: Date = new Date()
    ): BalanceWhereInput {
        const frequencyCondition = filter?.frequency ?? { not: "ONCE" as const };

        const where: BalanceWhereInput = {
            contextId,
            balanceType: { in: ["PAYABLE", "RECEIVABLE"] },
            agreement: {
                isNot: null,
                is: {
                    frequency: frequencyCondition,
                },
            },
        };

        if (filter?.direction === "CREDIT") {
            where.balanceType = "RECEIVABLE";
        } else if (filter?.direction === "DEBIT") {
            where.balanceType = "PAYABLE";
        }

        const agreementConditions: Prisma.AgreementWhereInput = {
            frequency: frequencyCondition,
        };

        if (filter?.active === "ACTIVE" || filter?.active === "OVERDUE") {
            where.removedAt = null;
            agreementConditions.startsAt = { lte: today };
            agreementConditions.OR = [{ endsAt: null }, { endsAt: { gte: today } }];
        } else if (filter?.active === "INACTIVE") {
            where.OR = [
                { removedAt: { not: null } },
                {
                    agreement: {
                        is: {
                            endsAt: { lt: today },
                        },
                    },
                },
                {
                    agreement: {
                        is: {
                            startsAt: { gt: today },
                        },
                    },
                },
            ];
        }

        where.agreement = {
            isNot: null,
            is: agreementConditions,
        };

        if (filter?.q?.trim()) {
            const term = filter.q.trim();
            const searchCondition: BalanceWhereInput[] = [
                { name: { contains: term, mode: "insensitive" } },
                {
                    parent: {
                        name: { contains: term, mode: "insensitive" },
                    },
                },
            ];

            if (where.OR) {
                where.AND = [{ OR: where.OR }, { OR: searchCondition }];
                delete where.OR;
            } else {
                where.OR = searchCondition;
            }
        }

        return where;
    }

    private async findOverdueBalanceIds(
        balanceIds: number[],
        today: Date
    ): Promise<Set<number>> {
        if (balanceIds.length === 0) {
            return new Set();
        }

        const overdueRows = await prisma.$queryRaw<Array<{ balanceId: number }>>`
            SELECT m."balanceId"
            FROM "Movement" m
            INNER JOIN "Entry" e ON e.id = m."entryId"
            WHERE m."balanceId" IN (${Prisma.join(balanceIds)})
              AND e."reversesEntryId" IS NULL
              AND NOT EXISTS (
                  SELECT 1 FROM "Entry" rev WHERE rev."reversesEntryId" = e.id
              )
              AND e."dueDate"::date < ${today}::date
            GROUP BY m."balanceId"
            HAVING SUM(m.amount) < 0
        `;

        return new Set(overdueRows.map((r) => r.balanceId));
    }
}
