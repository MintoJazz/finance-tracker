import { prisma } from "@/lib/prisma";
import { BaseFilter } from "@/types/filters.types";
import {
    CardEditData,
    ICardQueries,
} from "@/modules/cards/application/interfaces/card-queries.interface";
import {
    BalanceInclude,
    BalanceWhereInput,
    StringFilter,
} from "@/prisma/generated/prisma/models";
import { PageRequest, Page } from "@/types/pagination.types";
import { CardMapper } from "../mappers/card.mapper";
import { CardSummary } from "@/modules/cards/models/card.schema";

export class CardPrismaQueries implements ICardQueries {
    private static readonly includeDetails = {
        agreement: {
            include: {
                rules: {
                    orderBy: { effectiveFrom: "desc" },
                    take: 1,
                },
                amountEntries: {
                    orderBy: { effectiveAt: "asc" },
                },
            },
        },
        movements: {
            take: 1,
            orderBy: {
                entry: { dueDate: "desc" },
            },
            where: {
                entry: { reversedBy: null },
            },
            include: {
                entry: {
                    select: { dueDate: true },
                },
            },
        },
    } satisfies BalanceInclude;

    async listCardsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: BaseFilter
    ): Promise<Page<CardSummary>> {
        const { search, archivedOnly } = filter ?? {};
        const include = CardPrismaQueries.includeDetails;

        const where: BalanceWhereInput = {
            contextId,
            balanceType: "CREDIT",
            removedAt: archivedOnly ? { not: null } : null,
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
                agreement: {
                    include: {
                        rules: {
                            orderBy: { effectiveFrom: "desc" },
                            take: 1,
                        },
                        amountEntries: {
                            orderBy: { effectiveAt: "asc" },
                        },
                    },
                },
            },
        });

        if (!card) return null;

        const currentRule = card.agreement?.rules?.[0];
        const limit = Math.max(
            0,
            card.agreement?.amountEntries?.reduce((sum, entry) => sum + entry.amount, 0) ?? 0
        );

        return {
            id: card.id,
            name: card.name,
            limit,
            closingDay: currentRule?.closingDay ?? currentRule?.dueDay ?? 1,
            dueDay: currentRule?.dueDay ?? 10,
        };
    }

    private async sumAmountsByBalance(
        balanceIds: number[]
    ): Promise<Map<number, number>> {
        if (balanceIds.length === 0) return new Map();

        const movements = await prisma.movement.findMany({
            where: {
                balanceId: { in: balanceIds },
                entry: {
                    reversedBy: null,
                    reversesEntryId: null,
                },
            },
            select: {
                balanceId: true,
                amount: true,
                direction: true,
            },
        });

        const resultMap = new Map<number, number>();
        for (const id of balanceIds) {
            resultMap.set(id, 0);
        }

        for (const m of movements) {
            const current = resultMap.get(m.balanceId) ?? 0;
            const magnitude = Math.abs(m.amount);
            // No cartão, DEBIT aumenta o limite utilizado e CREDIT diminui (pagamento/estorno)
            const delta = m.direction === "DEBIT" ? magnitude : -magnitude;
            resultMap.set(m.balanceId, current + delta);
        }

        for (const [id, used] of resultMap.entries()) {
            resultMap.set(id, Math.max(0, used));
        }

        return resultMap;
    }
}