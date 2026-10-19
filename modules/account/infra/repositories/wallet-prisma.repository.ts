import { prisma } from "@/lib/prisma";
import {
    CreateWalletRepositoryDTO,
    IWalletRepository,
    UpdateWalletRepositoryDTO,
} from "../../core/types/wallet-repository.interface";
import { WalletEntity } from "../../core/schemas/wallet.schema";

export class WalletPrismaRepository implements IWalletRepository {
    async create(data: CreateWalletRepositoryDTO): Promise<{ id: number; name: string }> {
        const wallet = await prisma.balance.create({
            data: {
                contextId: data.contextId,
                name: data.name,
                balanceType: "WALLET",
            },
            select: {
                id: true,
                name: true,
            },
        });

        return wallet;
    }

    async findByIdAndContextId(id: number, contextId: number): Promise<WalletEntity | null> {
        const wallet = await prisma.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: "WALLET",
            },
            select: {
                id: true,
                name: true,
                contextId: true,
                removedAt: true,
            },
        });

        if (!wallet) return null;

        return {
            id: wallet.id,
            name: wallet.name,
            contextId: wallet.contextId,
            isArchived: wallet.removedAt !== null,
        };
    }

    async update(id: number, contextId: number, data: UpdateWalletRepositoryDTO): Promise<{ id: number; name: string }> {
        const updated = await prisma.balance.update({
            where: {
                id_contextId_balanceType: {
                    id,
                    contextId,
                    balanceType: "WALLET",
                },
            },
            data: {
                name: data.name,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return updated;
    }

    async archive(id: number, contextId: number): Promise<{ id: number; name: string }> {
        const archived = await prisma.balance.update({
            where: {
                id_contextId_balanceType: {
                    id,
                    contextId,
                    balanceType: "WALLET",
                },
            },
            data: {
                removedAt: new Date(),
            },
            select: {
                id: true,
                name: true,
            },
        });

        return archived;
    }

    async restore(id: number, contextId: number): Promise<{ id: number; name: string }> {
        const restored = await prisma.balance.update({
            where: {
                id_contextId_balanceType: {
                    id,
                    contextId,
                    balanceType: "WALLET",
                },
            },
            data: {
                removedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
        });

        return restored;
    }
}

