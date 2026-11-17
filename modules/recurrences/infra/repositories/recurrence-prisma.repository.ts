import { prisma } from "@/lib/prisma";
import type { PrismaClientLike } from "@/lib/prisma-client";
import type {
    CreateRecurrenceRepositoryDTO,
    IRecurrenceRepository,
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
}
