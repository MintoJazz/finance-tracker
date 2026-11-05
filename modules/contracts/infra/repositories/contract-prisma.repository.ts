import { prisma } from "@/lib/prisma";
import {
    IContractRepository,
    CreateContractRepositoryDTO,
    CreatedContractResult,
    ContractAdjustmentData,
    AdjustContractLimitsRepositoryDTO,
    AdjustContractScheduleRepositoryDTO,
} from "@/modules/contracts/application/interfaces/contract-repository.interface";
import { ContractBalanceTypeEnum } from "../../models/contract.schema";

export class ContractPrismaRepository implements IContractRepository {
    async createContract(data: CreateContractRepositoryDTO): Promise<CreatedContractResult> {
        const startsAt = data.validity.from;
        const endsAt = data.validity.to ?? null;

        // Calcular effectiveFrom conforme frequência
        let effectiveFrom = startsAt;
        if (data.frequency === "YEARLY" && data.schedule.dueMonth) {
            const year = startsAt.getFullYear();
            const month = data.schedule.dueMonth - 1;
            const day = Math.min(data.schedule.dueDay, 28);
            effectiveFrom = new Date(year, month, day, 12, 0, 0);
        }

        const closingDay = data.hasCustomClosingDay ? data.schedule.closingDay ?? null : null;

        const balance = await prisma.balance.create({
            data: {
                contextId: data.contextId,
                name: data.name,
                balanceType: data.type,
                agreement: {
                    create: {
                        startsAt,
                        endsAt,
                        includeInProjection: data.includeInProjection,
                        rules: {
                            create: {
                                effectiveFrom,
                                frequency: data.frequency,
                                interval: 1,
                                dueDay: data.schedule.dueDay,
                                closingDay,
                            },
                        },
                        amountEntries: {
                            create: {
                                amount: data.value,
                                effectiveAt: startsAt,
                                reason: "Valor Inicial",
                            },
                        },
                    },
                },
            },
            include: {
                agreement: true,
            },
        });

        return {
            id: balance.id,
            balanceId: balance.id,
            name: balance.name,
        };
    }

    async archiveContract(id: number, contextId: number): Promise<void> {
        const balance = await prisma.balance.findUnique({
            where: { id },
        });

        if (balance?.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.balance.update({
            where: { id },
            data: { removedAt: new Date() }
        });

        await prisma.agreement.update({
            where: { balanceId: id },
            data: { includeInProjection: false }
        });
    }

    async restoreContract(id: number, contextId: number): Promise<void> {
        const balance = await prisma.balance.findUnique({
            where: { id },
        });

        if (balance?.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.balance.update({
            where: { id },
            data: { removedAt: null }
        });
    }

    async updateContractProjection(id: number, contextId: number, includeInProjection: boolean): Promise<void> {
        const agreement = await prisma.agreement.findUnique({
            where: { balanceId: id },
            include: { balance: true }
        });

        if (agreement?.balance.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        if (agreement.balance.removedAt !== null && includeInProjection) {
            throw new Error("ARCHIVED_CONTRACT");
        }

        await prisma.agreement.update({
            where: { balanceId: id },
            data: { includeInProjection }
        });
    }

    async renameContract(id: number, contextId: number, name: string): Promise<void> {
        const balance = await prisma.balance.findUnique({
            where: { id },
        });

        if (balance?.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.balance.update({
            where: { id },
            data: { name: name.trim() }
        });
    }

    async findContractForAdjustment(id: number, contextId: number): Promise<ContractAdjustmentData | null> {
        const agreement = await prisma.agreement.findFirst({
            where: {
                balanceId: id,
                balance: { contextId }
            },
            include: {
                balance: true,
                rules: {
                    orderBy: { effectiveFrom: "asc" }
                },
                amountEntries: {
                    orderBy: { effectiveAt: "asc" }
                }
            }
        });

        if (!agreement) return null;

        return {
            id: agreement.balance.id,
            balanceId: agreement.balance.id,
            name: agreement.balance.name,
            balanceType: agreement.balance.balanceType as ContractBalanceTypeEnum,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
            includeInProjection: agreement.includeInProjection,
            isArchived: agreement.balance.removedAt !== null,
            rules: agreement.rules.map((r) => ({
                id: r.id,
                effectiveFrom: r.effectiveFrom,
                frequency: r.frequency,
                interval: r.interval,
                dueDay: r.dueDay,
                closingDay: r.closingDay,
            })),
            amountEntries: agreement.amountEntries.map((e) => ({
                id: e.id,
                amount: e.amount,
                effectiveAt: e.effectiveAt,
                reason: e.reason,
            })),
        };
    }

    async adjustContractLimits(id: number, contextId: number, data: AdjustContractLimitsRepositoryDTO): Promise<void> {
        const agreement = await prisma.agreement.findUnique({
            where: { balanceId: id },
            include: { balance: true }
        });

        if (agreement?.balance.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.agreementAmountEntry.create({
            data: {
                agreementId: id,
                amount: data.amount,
                effectiveAt: data.effectiveAt,
                reason: data.reason ?? "Ajuste de limite",
            }
        });
    }

    async adjustContractSchedule(id: number, contextId: number, data: AdjustContractScheduleRepositoryDTO): Promise<void> {
        const agreement = await prisma.agreement.findUnique({
            where: { balanceId: id },
            include: { balance: true }
        });

        if (agreement?.balance.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.cycleRule.upsert({
            where: {
                agreementId_effectiveFrom: {
                    agreementId: id,
                    effectiveFrom: data.effectiveFrom,
                }
            },
            create: {
                agreementId: id,
                effectiveFrom: data.effectiveFrom,
                frequency: data.frequency,
                interval: data.interval ?? 1,
                dueDay: data.dueDay,
                closingDay: data.closingDay,
            },
            update: {
                frequency: data.frequency,
                interval: data.interval ?? 1,
                dueDay: data.dueDay,
                closingDay: data.closingDay,
            }
        });
    }
}
