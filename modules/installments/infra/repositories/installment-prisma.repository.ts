import { prisma } from "@/lib/prisma";
import type { PrismaClientLike } from "@/lib/prisma-client";
import type {
    CreateInstallmentRepositoryDTO,
    IInstallmentRepository,
} from "../../application/interfaces/installment-repository.interface";
import type { InstallmentCardRecord } from "../../application/policies/installment.policy";
import {
    buildInstallmentAgreementCreate,
    buildInstallmentEntries,
} from "../mappers/installment-write.mapper";

export class InstallmentPrismaRepository implements IInstallmentRepository {
    constructor(private readonly prismaClient: PrismaClientLike = prisma) {}

    async create(
        data: CreateInstallmentRepositoryDTO
    ): Promise<{ id: number; name: string }> {
        const name = data.name.trim();

        const balance = await this.prismaClient.balance.create({
            data: {
                contextId: data.contextId,
                name,
                balanceType: "INSTALLMENT",
                parentId: data.subcategoryId,
                agreement: { create: buildInstallmentAgreementCreate(data.schedule) },
            },
            select: { id: true, name: true },
        });

        const entries = buildInstallmentEntries({
            name,
            installmentId: balance.id,
            subcategoryId: data.subcategoryId,
            cardId: data.type === "INVOICE" ? data.cardId : null,
            schedule: data.schedule,
        });

        // Um Entry por vez (cada um com seus Movements aninhados), na ordem das parcelas.
        for (const entry of entries) {
            await this.prismaClient.entry.create({
                data: {
                    description: entry.description,
                    type: entry.type,
                    dueDate: entry.dueDate,
                    competanceDate: entry.competanceDate,
                    movements: { create: entry.movements },
                },
                select: { id: true },
            });
        }

        return balance;
    }

    async findCardById(
        contextId: number,
        cardId: number
    ): Promise<InstallmentCardRecord | null> {
        const balance = await this.prismaClient.balance.findFirst({
            where: { id: cardId, contextId },
            select: { id: true, balanceType: true, removedAt: true },
        });
        if (!balance) return null;

        return {
            id: balance.id,
            balanceType: balance.balanceType,
            isArchived: balance.removedAt !== null,
        };
    }
}
