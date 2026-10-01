import { Balance as PrismaBalance } from "@/prisma/generated/prisma/client";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";

export type BalanceWithLatestActivity = PrismaBalance & {
    movements?: {
        entry?: {
            date: Date;
        } | null;
    }[];
};

export class WalletMapper {
    static toSummary(balance: BalanceWithLatestActivity, amount: number): WalletSummary {
        const { balanceType, contextId, removedAt, updatedAt, ...data } = balance;
        const lastActivityAt = balance.movements?.[0]?.entry?.date ?? null;
        const isArchived = removedAt !== null;

        return { ...data, isArchived, amount, lastActivityAt };
    }
}