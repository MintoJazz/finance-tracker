import { prisma } from "@/lib/prisma";
import { BaseFilter } from "@/types/filters.types";
import { IWalletQueries } from "@/modules/account/core/types/wallet-queries.interface";
import { BalanceInclude, BalanceWhereInput, StringFilter } from "@/prisma/generated/prisma/models";
import { PageRequest, Page } from "@/types/pagination.types";
import { WalletMapper } from "../mappers/wallet.mapper";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { WalletProfile } from "@/modules/account/core/schemas/wallet-profile.schema";

export class WalletPrismaQueries implements IWalletQueries {
    private static readonly includeLastActivity = {
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

    async listWalletsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: BaseFilter
    ): Promise<Page<WalletSummary>> {
        const { search, showArchived } = filter ?? {};
        const include = WalletPrismaQueries.includeLastActivity;
        const where: BalanceWhereInput = {
            contextId,
            balanceType: "WALLET",
            removedAt: showArchived ? undefined : null,
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
            },
            select: {
                id: true,
                name: true,
            },
        });
        return wallet;
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

    private async sumAmountsByBalance(balanceIds: number[]): Promise<Map<number, number>> {
        if (balanceIds.length === 0) return new Map();

        const sums = await prisma.movement.groupBy({
            by: ["balanceId"],
            where: { balanceId: { in: balanceIds } },
            _sum: { amount: true },
        });

        return new Map(sums.map((s) => [s.balanceId as number, s._sum.amount ?? 0]));
    }
}