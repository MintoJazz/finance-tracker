import { prisma } from "@/lib/prisma";
import type { PrismaClientLike } from "@/lib/prisma-client";
import type {
    CreateRecurrenceRepositoryDTO,
    IRecurrenceRepository,
    RecurrenceStatusRecord,
} from "../../application/interfaces/recurrence-repository.interface";
import { buildAgreementCreate, toBalanceType } from "../mappers/recurrence-write.mapper";

export class RecurrencePrismaRepository implements IRecurrenceRepository {
    /** Aceita o cliente de uma transação (UoW); sem argumento usa o `prisma` global. */
    constructor(private readonly prismaClient: PrismaClientLike = prisma) {}

    async create(
        data: CreateRecurrenceRepositoryDTO
    ): Promise<{ id: number; name: string }> {
        // Create aninhado: Balance + Agreement + CycleRule + valor inicial de forma atômica
        return this.prismaClient.balance.create({
            data: {
                contextId: data.contextId,
                name: data.name.trim(),
                balanceType: toBalanceType(data.direction),
                parentId: data.subcategoryId,
                agreement: { create: buildAgreementCreate(data) },
            },
            select: { id: true, name: true },
        });
    }

    async findByIdAndContextId(
        id: number,
        contextId: number
    ): Promise<RecurrenceStatusRecord | null> {
        const balance = await this.prismaClient.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: { in: ["PAYABLE", "RECEIVABLE"] },
                agreement: { is: { frequency: { not: "ONCE" } } },
            },
            select: {
                id: true,
                name: true,
                removedAt: true,
                agreement: { select: { isActive: true } },
            },
        });
        if (!balance || !balance.agreement) return null;

        return {
            id: balance.id,
            name: balance.name,
            isArchived: balance.removedAt !== null,
            isActive: balance.agreement.isActive,
        };
    }

    async update(
        id: number,
        contextId: number,
        data: { name: string; subcategoryId: number }
    ): Promise<{ id: number; name: string }> {
        const found = await this.requireRecurrence(id, contextId);
        return this.prismaClient.balance.update({
            where: {
                id_contextId_balanceType: {
                    id,
                    contextId,
                    balanceType: found.balanceType,
                },
            },
            data: { name: data.name.trim(), parentId: data.subcategoryId },
            select: { id: true, name: true },
        });
    }

    async archive(
        id: number,
        contextId: number
    ): Promise<{ id: number; name: string }> {
        const found = await this.requireRecurrence(id, contextId);
        return this.prismaClient.balance.update({
            where: {
                id_contextId_balanceType: {
                    id,
                    contextId,
                    balanceType: found.balanceType,
                },
            },
            data: { removedAt: new Date() },
            select: { id: true, name: true },
        });
    }

    async setActive(
        id: number,
        contextId: number,
        isActive: boolean
    ): Promise<{ id: number; name: string; isActive: boolean }> {
        const found = await this.requireRecurrence(id, contextId);
        await this.prismaClient.agreement.update({
            where: { balanceId: id },
            data: { isActive },
        });
        return { id, name: found.name, isActive };
    }

    /** Garante que o Balance é uma recorrência do contexto (escopo de segurança). */
    private async requireRecurrence(id: number, contextId: number) {
        const found = await this.prismaClient.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: { in: ["PAYABLE", "RECEIVABLE"] },
                agreement: { is: { frequency: { not: "ONCE" } } },
            },
            select: { name: true, balanceType: true },
        });
        if (!found) {
            throw new Error(`Recorrência id=${id} não encontrada no contexto.`);
        }
        return found as { name: string; balanceType: "PAYABLE" | "RECEIVABLE" };
    }
}
