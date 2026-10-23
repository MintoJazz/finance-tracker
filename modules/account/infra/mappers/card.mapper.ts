import { Balance as PrismaBalance, Agreement as PrismaAgreement, CycleRule as PrismaCycleRule, AgreementAmountEntry as PrismaAgreementAmountEntry } from "@/prisma/generated/prisma/client";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";

export type BalanceWithCreditDetails = PrismaBalance & {
    agreement?: (PrismaAgreement & {
        rules: PrismaCycleRule[];
        amountEntries?: PrismaAgreementAmountEntry[];
    }) | null;
    movements?: {
        entry?: {
            dueDate: Date;
        } | null;
    }[];
};

export class CardMapper {
    static toSummary(
        balance: BalanceWithCreditDetails,
        usedLimit: number
    ): CardSummary {
        const isArchived = balance.removedAt !== null;
        const lastActivityAt = balance.movements?.[0]?.entry?.dueDate ?? null;

        // Limite efetivo acumulado (soma dos deltas do Agreement)
        const limit = Math.max(
            0,
            balance.agreement?.amountEntries?.reduce((sum, entry) => sum + entry.amount, 0) ?? 0
        );
        const availableLimit = Math.max(0, limit - usedLimit);

        // Regra de ciclo vigente mais recente
        const currentRule = balance.agreement?.rules?.[0];
        const closingDay = currentRule?.closingDay ?? currentRule?.dueDay ?? 1;
        const dueDay = currentRule?.dueDay ?? 10;

        return {
            id: balance.id,
            name: balance.name,
            limit,
            usedLimit,
            availableLimit,
            closingDay,
            dueDay,
            lastActivityAt,
            isArchived,
        };
    }
}
