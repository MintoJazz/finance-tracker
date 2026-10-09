import { prisma } from "@/lib/prisma";
import { IContractRepository } from "../../core/types/contract-repository.interface";

export class ContractPrismaRepository implements IContractRepository {
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
