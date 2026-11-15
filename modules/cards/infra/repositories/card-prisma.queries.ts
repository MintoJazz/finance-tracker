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
import { CardProfile } from "@/modules/cards/models/card-profile.schema";

export class CardPrismaQueries implements ICardQueries {
    private static readonly includeAgreement = {
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
    } satisfies BalanceInclude;

    private static readonly includeDetails = {
        ...CardPrismaQueries.includeAgreement,
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
            include: CardPrismaQueries.includeAgreement,
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

    async findCardProfileById(
        id: number,
        contextId: number
    ): Promise<CardProfile | null> {
        const [card, usedLimitByBalanceId] = await Promise.all([
            prisma.balance.findFirst({
                where: {
                    id,
                    contextId,
                    balanceType: "CREDIT",
                },
                include: CardPrismaQueries.includeAgreement,
            }),
            this.sumAmountsByBalance([id]),
        ]);

        if (!card) return null;

        const usedLimit = usedLimitByBalanceId.get(card.id) ?? 0;
        return CardMapper.toProfile(card, usedLimit);
    }

    async sumAmountsByBalance(
        balanceIds: number[]
    ): Promise<Map<number, number>> {
        if (balanceIds.length === 0) return new Map();

        const grouped = await prisma.movement.groupBy({
            by: ["balanceId"],
            where: {
                balanceId: { in: balanceIds },
                entry: {
                    reversedBy: null,
                    reversesEntryId: null,
                },
            },
            _sum: {
                amount: true,
            },
        });

        const resultMap = new Map<number, number>();
        for (const id of balanceIds) resultMap.set(id, 0);

        for (const item of grouped) {
            const netSum = item._sum.amount ?? 0;
            // Para contas do tipo CREDIT com amount assinado:
            // Despesas possuem sinal negativo (DEBIT < 0) e pagamentos positivo (CREDIT > 0).
            // O limite usado representa o saldo líquido devedor: max(0, -netSum).
            resultMap.set(item.balanceId, Math.max(0, -netSum));
        }

        return resultMap;
    }
}