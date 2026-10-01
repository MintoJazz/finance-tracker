import { Balance as PrismaBalance, Recurrence as PrismaRecurrence, CycleRule as PrismaCycleRule, LimitEntry as PrismaLimitEntry } from "@/prisma/generated/prisma/client";
import { CardSummary } from "@/modules/account/core/schemas/card.schema";

export type BalanceWithCreditDetails = PrismaBalance & {
    recurrence?: (PrismaRecurrence & {
        rules: PrismaCycleRule[];
    }) | null;
    limitEntries?: PrismaLimitEntry[];
    movements?: {
        entry?: {
            date: Date;
        } | null;
    }[];
};

export class CardMapper {
    static toSummary(
        balance: BalanceWithCreditDetails,
        usedLimit: number
    ): CardSummary {
        const isArchived = balance.removedAt !== null;
        const lastActivityAt = balance.movements?.[0]?.entry?.date ?? null;

        // Limite efetivo mais recente
        const limit = balance.limitEntries?.[0]?.amount ?? 0;
        const availableLimit = Math.max(0, limit - usedLimit);

        // Regra de ciclo vigente mais recente
        const currentRule = balance.recurrence?.rules?.[0];
        const closingDay = currentRule?.closingDay ?? 1;
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
