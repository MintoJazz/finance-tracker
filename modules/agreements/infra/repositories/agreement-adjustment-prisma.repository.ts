import { prisma } from "@/lib/prisma";
import type { PrismaClientLike } from "@/lib/prisma-client";
import type {
    AddAmountEntryRepositoryDTO,
    AdjustableBalanceType,
    AgreementAdjustmentContext,
    IAgreementAdjustmentRepository,
    UpsertCycleRuleRepositoryDTO,
} from "../../application/interfaces/agreement-adjustment-repository.interface";

export class AgreementAdjustmentPrismaRepository
    implements IAgreementAdjustmentRepository
{
    /** Aceita o cliente de uma transação; sem argumento usa o `prisma` global. */
    constructor(private readonly prismaClient: PrismaClientLike = prisma) {}

    async findAgreementContext(
        balanceId: number,
        contextId: number,
        balanceTypes: AdjustableBalanceType[]
    ): Promise<AgreementAdjustmentContext | null> {
        const balance = await this.prismaClient.balance.findFirst({
            where: { id: balanceId, contextId, balanceType: { in: balanceTypes } },
            select: {
                id: true,
                name: true,
                balanceType: true,
                removedAt: true,
                agreement: {
                    select: {
                        frequency: true,
                        interval: true,
                        startsAt: true,
                        endsAt: true,
                        rules: { orderBy: { effectiveFrom: "asc" } },
                        amountEntries: { orderBy: { effectiveAt: "asc" } },
                    },
                },
            },
        });

        if (!balance?.agreement) return null;

        const { agreement } = balance;
        return {
            balanceId: balance.id,
            name: balance.name,
            balanceType: balance.balanceType as AdjustableBalanceType,
            removedAt: balance.removedAt,
            frequency: agreement.frequency,
            interval: agreement.interval,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
            rules: agreement.rules,
            amountEntries: agreement.amountEntries.map((entry) => ({
                amount: entry.amount,
                effectiveAt: entry.effectiveAt,
            })),
        };
    }

    async addAmountEntry(data: AddAmountEntryRepositoryDTO): Promise<{ id: number }> {
        return this.prismaClient.agreementAmountEntry.create({
            data: {
                agreementId: data.agreementId,
                amount: data.delta,
                effectiveAt: data.effectiveAt,
                reason: data.reason,
            },
            select: { id: true },
        });
    }

    async upsertCycleRule(data: UpsertCycleRuleRepositoryDTO): Promise<{ id: number }> {
        const values = {
            dueDay: data.dueDay,
            dueMonth: data.dueMonth,
            closingDay: data.closingDay,
            closingMonth: data.closingMonth,
        };

        return this.prismaClient.cycleRule.upsert({
            where: {
                agreementId_effectiveFrom: {
                    agreementId: data.agreementId,
                    effectiveFrom: data.effectiveFrom,
                },
            },
            create: {
                agreementId: data.agreementId,
                effectiveFrom: data.effectiveFrom,
                ...values,
            },
            update: values,
            select: { id: true },
        });
    }

    async withTransaction<T>(
        work: (repo: IAgreementAdjustmentRepository) => Promise<T>
    ): Promise<T> {
        // Com o cliente global abre uma transação; com o de uma UoW participa da dela.
        return this.prismaClient.$transaction(async (tx) =>
            work(new AgreementAdjustmentPrismaRepository(tx))
        );
    }
}
