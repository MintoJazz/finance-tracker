import { prisma } from "@/lib/prisma";
import { PageRequest, Page } from "@/types/pagination.types";
import { ContractSummaryItem, ContractTypeCounts } from "../../core/schemas/contract.schema";
import { IContractQueries, ContractFilter } from "../../core/types/contract-queries.interface";
import { BalanceWhereInput, StringFilter } from "@/prisma/generated/prisma/models";
import { ContractMapper } from "../mappers/contract.mapper";

export class ContractPrismaQueries implements IContractQueries {
    async listContractsByContextId(
        contextId: number,
        pageRequest: PageRequest,
        filter?: ContractFilter
    ): Promise<{ page: Page<ContractSummaryItem>; counts: ContractTypeCounts }> {
        const { search, type, showArchived } = filter ?? {};

        const where: BalanceWhereInput = {
            contextId,
            balanceType: { in: ["PAYABLE", "RECEIVABLE"] },
            removedAt: showArchived ? undefined : null,
            agreement: { isNot: null },
        };

        if (type && type !== "ALL") {
            where.balanceType = type;
        }

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
        const pageSize = !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

        const skip = (page - 1) * pageSize;
        const take = pageSize;

        const [rawItems, total, totalPayable, totalReceivable] = await Promise.all([
            prisma.balance.findMany({
                where,
                skip,
                take,
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
                orderBy: { name: "asc" }
            }),
            prisma.balance.count({ where }),
            prisma.balance.count({ where: { ...where, balanceType: "PAYABLE" } }),
            prisma.balance.count({ where: { ...where, balanceType: "RECEIVABLE" } })
        ]);

        // Filter out balances that might not have an agreement attached just in case
        const validItems = rawItems.filter(b => b.agreement);

        const items: ContractSummaryItem[] = validItems.map((balance) =>
            ContractMapper.toSummary(balance)
        );

        return {
            page: {
                data: items,
                total,
                pageIndex: page - 1,
                pageSize,
                pageCount: Math.ceil(total / pageSize),
            },
            counts: {
                total,
                payable: totalPayable,
                receivable: totalReceivable
            }
        };
    }
}
