import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";
import {
    IContractCycleProfileQueries,
    RawCycleEntry,
} from "../../core/types/contract-cycle-profile-queries.interface";
import {
    ContractRawData,
    IContractProfileQueries,
} from "../../core/types/contract-profile-queries.interface";
import { CycleWindow } from "../../core/types/commitment-cycle-engine.interface";
import { ContractProfilePrismaQueries } from "./contract-profile-prisma.queries";

export class ContractCycleProfilePrismaQueries
    implements IContractCycleProfileQueries
{
    constructor(
        private readonly contractProfileQueries: IContractProfileQueries = new ContractProfilePrismaQueries()
    ) {}

    async findContractProfileData(
        contextId: number,
        identifier: { agreementId?: number; balanceId?: number },
        window: CycleWindow
    ): Promise<ContractRawData | null> {
        return this.contractProfileQueries.findContractProfileData(
            contextId,
            identifier,
            window
        );
    }

    async findCycleEntries(
        contextId: number,
        agreementBalanceId: number,
        from: Date,
        to: Date
    ): Promise<RawCycleEntry[]> {
        const start = startOfDay(from);
        const end = endOfDay(to);

        const entries = await prisma.entry.findMany({
            where: {
                movements: {
                    some: {
                        balanceId: agreementBalanceId,
                        balance: { contextId },
                    },
                },
                OR: [
                    {
                        competanceDate: {
                            not: null,
                            gte: start,
                            lte: end,
                        },
                    },
                    {
                        competanceDate: null,
                        dueDate: {
                            gte: start,
                            lte: end,
                        },
                    },
                ],
            },
            include: {
                reversedBy: {
                    select: { id: true },
                },
                movements: {
                    include: {
                        balance: {
                            select: {
                                id: true,
                                name: true,
                                balanceType: true,
                                agreement: {
                                    select: {
                                        id: true,
                                        balance: {
                                            select: {
                                                name: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: [
                { competanceDate: "asc" },
                { dueDate: "asc" },
                { createdAt: "asc" },
            ],
        });

        return entries.map((entry) => ({
            id: entry.id,
            description: entry.description,
            type: entry.type,
            competanceDate: entry.competanceDate,
            dueDate: entry.dueDate,
            createdAt: entry.createdAt,
            reversesEntryId: entry.reversesEntryId,
            reversedBy: entry.reversedBy ? { id: entry.reversedBy.id } : null,
            movements: entry.movements.map((m) => ({
                id: m.id,
                balanceId: m.balanceId,
                amount: m.amount,
                direction: m.direction,
                balance: {
                    id: m.balance.id,
                    name: m.balance.name,
                    balanceType: m.balance.balanceType,
                    agreement: m.balance.agreement
                        ? {
                              id: m.balance.agreement.id,
                              balance: {
                                  name: m.balance.agreement.balance.name,
                              },
                          }
                        : null,
                },
            })),
        }));
    }
}
