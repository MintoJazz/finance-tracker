import { prisma } from "@/lib/prisma";
import {
    IContractRepository,
    CreateContractRepositoryDTO,
    CreatedContractResult,
} from "../../core/types/contract-repository.interface";

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
            id: balance.agreement!.id,
            balanceId: balance.id,
            name: balance.name,
        };
    }

    async archiveContract(id: number, contextId: number): Promise<void> {
        const agreement = await prisma.agreement.findUnique({
            where: { id },
            include: { balance: true }
        });

        if (agreement?.balance.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.balance.update({
            where: { id: agreement.balanceId },
            data: { removedAt: new Date() }
        });

        await prisma.agreement.update({
            where: { id },
            data: { includeInProjection: false }
        });
    }

    async restoreContract(id: number, contextId: number): Promise<void> {
        const agreement = await prisma.agreement.findUnique({
            where: { id },
            include: { balance: true }
        });

        if (agreement?.balance.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        await prisma.balance.update({
            where: { id: agreement.balanceId },
            data: { removedAt: null }
        });
    }

    async updateContractProjection(id: number, contextId: number, includeInProjection: boolean): Promise<void> {
        const agreement = await prisma.agreement.findUnique({
            where: { id },
            include: { balance: true }
        });

        if (agreement?.balance.contextId !== contextId) {
            throw new Error("Contract not found or access denied.");
        }

        if (agreement.balance.removedAt !== null && includeInProjection) {
            throw new Error("ARCHIVED_CONTRACT");
        }

        await prisma.agreement.update({
            where: { id },
            data: { includeInProjection }
        });
    }
}
