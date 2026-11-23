import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@/prisma/generated/prisma/client";
import { CategoryPrismaRepository } from "@/modules/categories/infra/repositories/category-prisma.repository";
import type {
    IInstallmentUnitOfWork,
    InstallmentUnitOfWorkRepositories,
} from "../../application/interfaces/installment-uow.interface";
import { InstallmentPrismaRepository } from "../repositories/installment-prisma.repository";

/** Até 120 parcelas, cada uma com até 2 lançamentos: a transação precisa de mais fôlego que o padrão (5 s). */
const TRANSACTION_OPTIONS = { maxWait: 10_000, timeout: 30_000 } as const;

export class InstallmentPrismaUnitOfWork implements IInstallmentUnitOfWork {
    constructor(private readonly prismaClient: PrismaClient = prisma) {}

    async run<T>(
        work: (repos: InstallmentUnitOfWorkRepositories) => Promise<T>
    ): Promise<T> {
        return this.prismaClient.$transaction(
            async (tx) =>
                work({
                    categoryRepo: new CategoryPrismaRepository(tx),
                    installmentRepo: new InstallmentPrismaRepository(tx),
                }),
            TRANSACTION_OPTIONS
        );
    }
}
