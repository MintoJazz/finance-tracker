import { prisma } from "@/lib/prisma";
import { EntryWhereInput } from "@/prisma/generated/prisma/models";
import { Page } from "@/types/pagination.types";
import {
    CycleEntryItem,
    EntryTypeEnum,
} from "../../core/schemas/cycle-entries.schema";
import {
    ICycleEntriesQueries,
    ListCycleEntriesParams,
} from "../../core/types/cycle-entries-queries.interface";

export class CycleEntriesPrismaQueries implements ICycleEntriesQueries {
    async listCycleEntries(
        params: ListCycleEntriesParams
    ): Promise<Page<CycleEntryItem>> {
        const { contextId, identifier, from, to, pageRequest, q } = params;

        // 1. Localizar o acordo e garantir que pertence ao contexto
        const agreement = await prisma.agreement.findFirst({
            where: identifier.agreementId
                ? { id: identifier.agreementId, balance: { contextId } }
                : { balanceId: identifier.balanceId, balance: { contextId } },
            select: { id: true, balanceId: true },
        });

        if (!agreement) {
            return {
                data: [],
                total: 0,
                pageIndex: 0,
                pageSize: pageRequest.pageSize ?? 10,
                pageCount: 0,
            };
        }

        const balanceId = agreement.balanceId;

        // 2. Construir cláusula WHERE
        // Uma transação pertence ao ciclo se possui movimento no balance do compromisso
        // e sua data de referência (COALESCE(competanceDate, dueDate)) cai na janela [from, to]
        const where: EntryWhereInput = {
            movements: {
                some: { balanceId },
            },
            OR: [
                {
                    competanceDate: {
                        gte: from,
                        lte: to,
                    },
                },
                {
                    competanceDate: null,
                    dueDate: {
                        gte: from,
                        lte: to,
                    },
                },
            ],
        };

        if (q && q.trim().length > 0) {
            where.description = {
                contains: q.trim(),
                mode: "insensitive",
            };
        }

        const rawPage = Number(pageRequest.page);
        const rawPageSize = Number(pageRequest.pageSize);
        const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const pageSize =
            !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        // 3. Executar consulta paginada e contagem
        const [entries, total] = await Promise.all([
            prisma.entry.findMany({
                where,
                skip,
                take,
                orderBy: [
                    { competanceDate: "desc" },
                    { dueDate: "desc" },
                    { id: "desc" },
                ],
                include: {
                    reversedBy: { select: { id: true } },
                    movements: {
                        include: {
                            balance: {
                                select: { id: true, name: true },
                            },
                        },
                    },
                },
            }),
            prisma.entry.count({ where }),
        ]);

        // 4. Mapear para o schema do domínio
        const data: CycleEntryItem[] = entries.map((entry) => {
            const movementOnTarget = entry.movements.find(
                (m) => m.balanceId === balanceId
            );
            const amount = movementOnTarget
                ? Math.abs(movementOnTarget.amount)
                : 0;

            return {
                entryId: entry.id,
                description: entry.description,
                type: entry.type as EntryTypeEnum,
                referenceDate: entry.competanceDate ?? entry.dueDate,
                dueDate: entry.dueDate,
                competanceDate: entry.competanceDate,
                amount,
                isReversed: entry.reversedBy !== null,
                movements: entry.movements.map((m) => ({
                    movementId: m.id,
                    balanceId: m.balance.id,
                    balanceName: m.balance.name,
                    amount: m.amount,
                    direction: m.direction,
                })),
            };
        });

        return {
            data,
            total,
            pageIndex: page - 1,
            pageSize,
            pageCount: Math.ceil(total / pageSize) || 1,
        };
    }
}
