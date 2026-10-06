import { prisma } from "@/lib/prisma";
import {
    CreateCardRepositoryDTO,
    ICardRepository,
} from "../../core/types/card-repository.interface";
import { CardEntity } from "../../core/schemas/card.schema";

export class CardPrismaRepository implements ICardRepository {
    async create(
        data: CreateCardRepositoryDTO
    ): Promise<{ id: number; name: string }> {
        const now = new Date();

        const card = await prisma.balance.create({
            data: {
                contextId: data.contextId,
                name: data.name,
                balanceType: "CREDIT",
                recurrence: {
                    create: {
                        includeInProjection: true,
                        startsAt: now,
                        rules: {
                            create: {
                                effectiveFrom: now,
                                frequency: "MONTHLY",
                                interval: 1,
                                closingDay: data.closingDay,
                                dueDay: data.dueDay,
                            },
                        },
                    },
                },
                limitEntries: {
                    create: {
                        amount: data.limit,
                        effectiveAt: now,
                        reason: "Limite inicial",
                    },
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        return card;
    }

    async findByIdAndContextId(
        id: number,
        contextId: number
    ): Promise<CardEntity | null> {
        const card = await prisma.balance.findFirst({
            where: {
                id,
                contextId,
                balanceType: "CREDIT",
            },
            select: {
                id: true,
                name: true,
                contextId: true,
                removedAt: true,
            },
        });

        if (!card) return null;

        return {
            id: card.id,
            name: card.name,
            contextId: card.contextId,
            isArchived: card.removedAt !== null,
        };
    }

    async archive(id: number): Promise<{ id: number; name: string }> {
        const archived = await prisma.balance.update({
            where: { id },
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

    async restore(id: number): Promise<{ id: number; name: string }> {
        const restored = await prisma.balance.update({
            where: { id },
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