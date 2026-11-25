import { prisma } from "@/lib/prisma";
import { BaseFilter } from "@/types/filters.types";
import { IWalletQueries } from "@/modules/wallets/application/interfaces/wallet-queries.interface";
import { BalanceInclude, BalanceWhereInput, StringFilter } from "@/prisma/generated/prisma/models";
import { PageRequest, Page } from "@/types/pagination.types";
import { WalletMapper } from "../mappers/wallet.mapper";
import { WalletSummary } from "@/modules/wallets/models/wallet.schema";
import { WalletProfile } from "@/modules/wallets/models/wallet-profile.schema";

export class WalletPrismaQueries implements IWalletQueries {
    private static readonly includeLastActivity = {
        movements: {
            take: 1,
            orderBy: {
                entry: { dueDate: "desc" },
            },
            where: {
                entry: { reversedBy: null, reversesEntryId: null },
            },
            include: {
                entry: {
                    select: { dueDate: true },
                },
            },
        },
    } satisfies BalanceInclude;

    async listWalletsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: BaseFilter
    ): Promise<Page<WalletSummary>> {
        const { search, archivedOnly } = filter ?? {};
        const include = WalletPrismaQueries.includeLastActivity;
        const where: BalanceWhereInput = {
            contextId,
            balanceType: "WALLET",
            removedAt: archivedOnly ? { not: null } : null,
        };

        if (search) {
            const name: StringFilter<"Balance"> = { contains: search, mode: "insensitive" };
            where.OR = [{ name }];
        }

        const rawPage = Number(pageRequest.page);
        const rawPageSize = Number(pageRequest.pageSize);
        const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const pageSize = !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;
        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [rawItems, total] = await Promise.all([
            prisma.balance.findMany({ where, skip, take, include }),
            prisma.balance.count({ where }),
        ]);

        const amountByBalanceId = await this.sumAmountsByBalance(rawItems.map((b) => b.id));

        const items: WalletSummary[] = rawItems.map((balance) =>
            WalletMapper.toSummary(balance, amountByBalanceId.get(balance.id) ?? 0)
        );

        return {
            data: items,
            total,
            pageIndex: page - 1,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    }

    async findWalletById(id: number, contextId: number): Promise<{ id: number; name: string } | null> {
        const wallet = await prisma.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: "WALLET",
                removedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
        });
        return wallet;
    }

    async findCardById(id: number, contextId: number): Promise<{ id: number; name: string } | null> {
        const card = await prisma.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: "CREDIT",
                removedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
        });
        return card;
    }

    async findWalletProfileById(id: number, contextId: number): Promise<WalletProfile | null> {
        const wallet = await prisma.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: "WALLET",
            },
        });

        if (!wallet) return null;

        const amountByBalanceId = await this.sumAmountsByBalance([wallet.id]);
        const currentBalance = amountByBalanceId.get(wallet.id) ?? 0;

        return WalletMapper.toProfile(wallet, currentBalance);
    }

    async sumAmountsByBalance(balanceIds: number[]): Promise<Map<number, number>> {
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
        for (const id of balanceIds) {
            resultMap.set(id, 0);
        }

        for (const item of grouped) {
            resultMap.set(item.balanceId, item._sum.amount ?? 0);
        }

        return resultMap;
    }
}