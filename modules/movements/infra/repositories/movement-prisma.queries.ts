import { prisma } from "@/lib/prisma";
import {
    DateTimeFilter,
    EntryWhereInput,
    MovementInclude,
    MovementWhereInput,
} from "@/prisma/generated/prisma/models";
import { Page, PageRequest } from "@/types/pagination.types";
import {
    MovementCategoryClassification,
    WalletMovement,
    WalletMovementFilters,
} from "@/modules/movements/models/wallet-movement.schema";
import { IMovementQueries, ListBalanceMovementEntriesOptions } from "@/modules/movements/application/interfaces/movement-queries.interface";
import {
    MovementEntry,
    MovementEntryFilters,
    MovementEntryScope,
    MovementEntryType,
} from "@/modules/movements/models/movement-entry.schema";
import { MovementEntryMapper } from "../mappers/movement-entry.mapper";
import { WalletMovementMapper } from "../mappers/wallet-movement.mapper";
import { MovementEntryFilterPrismaRegistry } from "../registries/movement-entry-filter-prisma.registry";

export class MovementPrismaQueries implements IMovementQueries {
    private static readonly includeEntry = {
        entry: {
            select: {
                id: true,
                description: true,
                dueDate: true,
                competanceDate: true,
                type: true,
                reversedBy: {
                    select: { id: true },
                },
            },
        },
    } satisfies MovementInclude;

    async listBalanceMovementEntries(
        balanceId: number,
        scope: MovementEntryScope,
        pageRequest: PageRequest,
        filter?: MovementEntryFilters,
        options?: ListBalanceMovementEntriesOptions
    ): Promise<Page<MovementEntry>> {
        const where = this.buildScopedWhereClause(
            balanceId,
            scope,
            filter,
            options
        );

        const rawPage = Number(pageRequest.page);
        const rawPageSize = Number(pageRequest.pageSize);
        const page =
            !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const pageSize =
            !Number.isNaN(rawPageSize) && rawPageSize > 0
                ? Math.floor(rawPageSize)
                : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [rawItems, total] = await Promise.all([
            prisma.movement.findMany({
                where,
                skip,
                take,
                include: {
                    entry: {
                        select: {
                            id: true,
                            description: true,
                            dueDate: true,
                            competanceDate: true,
                            type: true,
                            reversedBy: {
                                select: { id: true },
                            },
                            movements: {
                                where: { balanceId: { not: balanceId } },
                                select: {
                                    id: true,
                                    balanceId: true,
                                    direction: true,
                                    amount: true,
                                    balance: {
                                        select: {
                                            id: true,
                                            name: true,
                                            balanceType: true,
                                            appearance: {
                                                select: {
                                                    icon: true,
                                                    color: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: [{ entry: { dueDate: "desc" } }, { id: "desc" }],
            }),
            prisma.movement.count({ where }),
        ]);

        const data: MovementEntry[] = rawItems.map((item) =>
            MovementEntryMapper.toDomain(item, scope)
        );

        return {
            data,
            total,
            pageIndex: page - 1,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
        };
    }

    async listWalletMovementEntries(
        walletId: number,
        pageRequest: PageRequest,
        filter?: WalletMovementFilters
    ): Promise<Page<MovementEntry>> {
        return this.listBalanceMovementEntries(
            walletId,
            "WALLET",
            pageRequest,
            filter as MovementEntryFilters
        );
    }

    async listWalletMovements(
        walletId: number,
        pageRequest: PageRequest,
        filter?: WalletMovementFilters
    ): Promise<Page<WalletMovement>> {
        const where = this.buildWhereClause(walletId, filter);
        const include = MovementPrismaQueries.includeEntry;

        const rawPage = Number(pageRequest.page);
        const rawPageSize = Number(pageRequest.pageSize);
        const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const pageSize =
            !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [rawItems, total] = await Promise.all([
            prisma.movement.findMany({
                where,
                skip,
                take,
                include,
                orderBy: [{ entry: { dueDate: "desc" } }, { id: "desc" }],
            }),
            prisma.movement.count({ where }),
        ]);

        if (rawItems.length === 0) {
            return {
                data: [],
                total,
                pageIndex: page - 1,
                pageSize,
                pageCount: Math.ceil(total / pageSize) || 1,
            };
        }

        const entryIds = rawItems.map((item) => item.entryId);

        const balance = await prisma.balance.findUnique({
            where: { id: walletId },
            select: { contextId: true },
        });

        const categoryViews = balance?.contextId
            ? await prisma.entryCategoryView.findMany({
                  where: {
                      entryId: { in: entryIds },
                      contextId: balance.contextId,
                  },
              })
            : [];

        const categoryBalanceIds = categoryViews
            .map((cv) => cv.categoryBalanceId)
            .filter((id): id is number => typeof id === "number");

        const creditBalanceIds = categoryViews
            .map((cv) => cv.creditBalanceId)
            .filter((id): id is number => typeof id === "number");

        const [categories, creditCards] = await Promise.all([
            categoryBalanceIds.length > 0
                ? prisma.balance.findMany({
                      where: { id: { in: categoryBalanceIds } },
                      select: {
                          id: true,
                          name: true,
                          appearance: {
                              select: {
                                  icon: true,
                                  color: true,
                              },
                          },
                      },
                  })
                : [],
            creditBalanceIds.length > 0
                ? prisma.balance.findMany({
                      where: { id: { in: creditBalanceIds } },
                      select: {
                          id: true,
                          name: true,
                      },
                  })
                : [],
        ]);

        const categoryMap = new Map(categories.map((c) => [c.id, c]));
        const creditCardMap = new Map(creditCards.map((c) => [c.id, c]));
        const categoryViewMap = new Map(categoryViews.map((cv) => [cv.entryId, cv]));

        const data = rawItems.map((item) => {
            const classification = this.resolveCategoryClassification(
                item.entryId,
                categoryViewMap,
                categoryMap,
                creditCardMap
            );
            return WalletMovementMapper.toDomain(item, classification);
        });

        return {
            data,
            total,
            pageIndex: page - 1,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
        };
    }

    private resolveCategoryClassification(
        entryId: number,
        categoryViewMap: Map<number, { kind: string; categoryBalanceId: number | null; creditBalanceId: number | null }>,
        categoryMap: Map<number, { id: number; name: string; appearance: { icon: string | null; color: string | null } | null }>,
        creditCardMap: Map<number, { id: number; name: string }>
    ): MovementCategoryClassification {
        const view = categoryViewMap.get(entryId);
        if (!view) return { kind: "none" };

        switch (view.kind) {
            case "category": {
                if (view.categoryBalanceId) {
                    const cat = categoryMap.get(view.categoryBalanceId);
                    if (cat) {
                        return {
                            kind: "category",
                            category: {
                                id: cat.id,
                                name: cat.name,
                                appearance: cat.appearance,
                            },
                        };
                    }
                }
                return { kind: "none" };
            }
            case "multiple":
                return { kind: "multiple" };
            case "pass-through":
                return { kind: "pass-through" };
            case "credit-settlement": {
                if (view.creditBalanceId) {
                    const card = creditCardMap.get(view.creditBalanceId);
                    return {
                        kind: "credit-settlement",
                        creditCard: card ? { id: card.id, name: card.name } : undefined,
                    };
                }
                return { kind: "credit-settlement" };
            }
            default:
                return { kind: "none" };
        }
    }

    private buildScopedWhereClause(
        balanceId: number,
        scope: MovementEntryScope,
        filter?: MovementEntryFilters,
        options?: ListBalanceMovementEntriesOptions
    ): MovementWhereInput {
        const entryWhere: EntryWhereInput = {};

        // Por padrão omite movimentações cujos lançamentos foram estornados ou são estornos
        if (!filter?.includeReversed) {
            entryWhere.reversedBy = null;
            entryWhere.type = { not: "REVERSAL" };
        }

        // Busca textual na descrição do Entry
        if (filter?.q && filter.q.trim().length > 0) {
            entryWhere.description = {
                contains: filter.q.trim(),
                mode: "insensitive",
            };
        }

        // Filtro por período (from / to) considerando competanceDate com fallback para dueDate
        // Ignora datas apenas se options.ignoreDateFilter for explicitamente true (ex: contratos ONCE)
        if (!options?.ignoreDateFilter && (filter?.from || filter?.to)) {
            const dateFilter: DateTimeFilter<"Entry"> = {};
            if (filter.from) {
                dateFilter.gte = new Date(`${filter.from}T00:00:00.000Z`);
            }
            if (filter.to) {
                dateFilter.lte = new Date(`${filter.to}T23:59:59.999Z`);
            }
            entryWhere.OR = [
                { competanceDate: dateFilter },
                { competanceDate: null, dueDate: dateFilter },
            ];
        }

        const where: MovementWhereInput = {
            balanceId,
            entry: entryWhere,
        };

        // Filtro por direção contábil (CREDIT / DEBIT)
        if (filter?.direction) {
            where.direction = filter.direction;
        }

        // Filtro por tipos de movimentação específicos do escopo (via Registry)
        if (filter?.types && filter.types.length > 0) {
            const typeConditions = MovementEntryFilterPrismaRegistry.toWhereConditions(
                balanceId,
                scope,
                filter.types
            );
            if (typeConditions.length > 0) {
                where.AND = [{ OR: typeConditions }];
            }
        }

        return where;
    }

    private buildWhereClause(
        walletId: number,
        filter?: WalletMovementFilters
    ): MovementWhereInput {
        return this.buildScopedWhereClause(
            walletId,
            "WALLET",
            filter as MovementEntryFilters
        );
    }
}