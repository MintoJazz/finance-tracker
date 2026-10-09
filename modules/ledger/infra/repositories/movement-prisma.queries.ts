import { prisma } from "@/lib/prisma";
import {
    DateTimeFilter,
    EntryWhereInput,
    MovementInclude,
    MovementWhereInput,
} from "@/prisma/generated/prisma/models";
import { Page, PageRequest } from "@/types/pagination.types";
import {
    WalletMovement,
    WalletMovementFilters,
    WalletMovementType,
} from "../../core/schemas/wallet-movement.schema";
import { IMovementQueries } from "../../core/types/movement-queries.interface";
import { WalletMovementMapper } from "../mappers/wallet-movement.mapper";
import { WalletMovementTypeResolver } from "../../core/policies/wallet-movement-type.registry";

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

        const data = rawItems.map((item) => WalletMovementMapper.toDomain(item));

        return {
            data,
            total,
            pageIndex: page - 1,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
        };
    }

    private buildWhereClause(
        walletId: number,
        filter?: WalletMovementFilters
    ): MovementWhereInput {
        const entryWhere: EntryWhereInput = {};

        // Por padrão omite movimentações cujos lançamentos foram estornados
        if (!filter?.includeReversed) {
            entryWhere.reversedBy = null;
        }

        // Busca textual na descrição do Entry
        if (filter?.q && filter.q.trim().length > 0) {
            entryWhere.description = {
                contains: filter.q.trim(),
                mode: "insensitive",
            };
        }

        // Filtro por período (from / to)
        if (filter?.from || filter?.to) {
            const dateFilter: DateTimeFilter<"Entry"> = {};
            if (filter.from) {
                dateFilter.gte = new Date(`${filter.from}T00:00:00.000Z`);
            }
            if (filter.to) {
                dateFilter.lte = new Date(`${filter.to}T23:59:59.999Z`);
            }
            entryWhere.dueDate = dateFilter;
        }

        const where: MovementWhereInput = {
            balanceId: walletId,
            entry: entryWhere,
        };

        // Filtro por direção contábil (CREDIT / DEBIT)
        if (filter?.direction) {
            where.direction = filter.direction;
        }

        // Filtro por tipos de movimentação na visão da carteira
        if (filter?.types && filter.types.length > 0) {
            const typeConditions = filter.types.map((t) =>
                this.mapWalletMovementTypeToWhere(t)
            );
            where.AND = [{ OR: typeConditions }];
        }

        return where;
    }

    private mapWalletMovementTypeToWhere(
        type: WalletMovementType
    ): MovementWhereInput {
        const rule = WalletMovementTypeResolver.getRule(type);

        return {
            ...(rule.direction ? { direction: rule.direction } : {}),
            entry: {
                type:
                    rule.entryTypes.length === 1
                        ? rule.entryTypes[0]
                        : { in: [...rule.entryTypes] },
            },
        };
    }
}