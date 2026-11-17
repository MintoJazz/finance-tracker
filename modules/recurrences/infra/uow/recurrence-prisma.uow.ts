import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { CategoryPrismaRepository } from "@/modules/categories/infra/repositories/category-prisma.repository";
import type {
    IRecurrenceUnitOfWork,
    RecurrenceUnitOfWorkRepositories,
} from "../../application/interfaces/recurrence-uow.interface";
import { RecurrencePrismaRepository } from "../repositories/recurrence-prisma.repository";

export class RecurrencePrismaUnitOfWork implements IRecurrenceUnitOfWork {
    constructor(private readonly prismaClient: PrismaClient = prisma) {}

    async run<T>(
        work: (repos: RecurrenceUnitOfWorkRepositories) => Promise<T>
    ): Promise<T> {
        return this.prismaClient.$transaction(async (tx) =>
            work({
                categoryRepo: new CategoryPrismaRepository(tx),
                recurrenceRepo: new RecurrencePrismaRepository(tx),
            })
        );
    }
}
