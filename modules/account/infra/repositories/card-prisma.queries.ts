import { prisma } from "@/lib/prisma";
import { BaseFilter } from "@/types/filters.types";
import {
    CardEditData,
    ICardQueries,
} from "@/modules/account/core/types/card-queries.interface";
import {
    BalanceInclude,
    BalanceWhereInput,
    StringFilter,
} from "@/prisma/generated/prisma/models";
import { PageRequest, Page } from "@/types/pagination.types";
import { CardMapper } from "../mappers/card.mapper";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";

export class CardPrismaQueries implements ICardQueries {
    private static readonly includeDetails = {
        recurrence: {
            include: {
                rules: {
                    orderBy: { effectiveFrom: "desc" },
                    take: 1,
                },
            },
        },
        limitEntries: {
            orderBy: [{ effectiveAt: "desc" }, { id: "desc" }],
            take: 1,
        },
        movements: {
            take: 1,
            orderBy: {
                entry: { date: "desc" },
            },
            where: {
                entry: { reversedBy: null },
            },
            include: {
                entry: {
                    select: { date: true },
                },
            },
        },
    } satisfies BalanceInclude;

    async listCardsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: BaseFilter
    ): Promise<Page<CardSummary>> {
        const { search, showArchived } = filter ?? {};
        const include = CardPrismaQueries.includeDetails;

        const where: BalanceWhereInput = {
            contextId,
            balanceType: "CREDIT",
            removedAt: showArchived ? undefined : null,
        };

        if (search) {
            const name: StringFilter<"Balance"> = {
                contains: search,
                mode: "insensitive",
            };
            where.OR = [{ name }];
        }

        const rawPage = Number(pageRequest.page);
        const rawPageSize = Number(pageRequest.pageSize);
        const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const pageSize =
            !Number.isNaN(rawPageSize) && rawPageSize > 0
                ? Math.floor(rawPageSize)
                : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [rawItems, total] = await Promise.all([
            prisma.balance.findMany({ where, skip, take, include }),
            prisma.balance.count({ where }),
        ]);

        const usedLimitByBalanceId = await this.sumAmountsByBalance(
            rawItems.map((b) => b.id)
        );

        const items: CardSummary[] = rawItems.map((balance) =>
            CardMapper.toSummary(balance, usedLimitByBalanceId.get(balance.id) ?? 0)
        );

        return {
            data: items,
            total,
            pageIndex: page - 1,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    }

    async findCardById(
        id: number,
        contextId: number
    ): Promise<CardEditData | null> {
        const card = await prisma.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: "CREDIT",
            },
            include: {
                recurrence: {
                    include: {
                        rules: {
                            orderBy: { effectiveFrom: "desc" },
                            take: 1,
                        },
                    },
                },
                limitEntries: {
                    orderBy: [{ effectiveAt: "desc" }, { id: "desc" }],
                    take: 1,
                },
            },
        });

        if (!card) return null;

        const currentRule = card.recurrence?.rules?.[0];
        const limit = card.limitEntries?.[0]?.amount ?? 0;

        return {
            id: card.id,
            name: card.name,
            limit,
            closingDay: currentRule?.closingDay ?? 1,
            dueDay: currentRule?.dueDay ?? 10,
        };
    }

    private async sumAmountsByBalance(
        balanceIds: number[]
    ): Promise<Map<number, number>> {
        if (balanceIds.length === 0) return new Map();

        const sums = await prisma.movement.groupBy({
            by: ["balanceId"],
            where: { balanceId: { in: balanceIds } },
            _sum: { amount: true },
        });

        return new Map(
            sums.map((s) => [s.balanceId as number, s._sum.amount ?? 0])
        );
    }
}