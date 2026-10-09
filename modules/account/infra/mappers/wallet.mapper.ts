import { Balance as PrismaBalance } from "@/prisma/generated/prisma/client";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { WalletProfile } from "@/modules/account/core/schemas/wallet-profile.schema";

export type BalanceWithLatestActivity = PrismaBalance & {
    movements?: {
        entry?: {
            dueDate: Date;
        } | null;
    }[];
};

export class WalletMapper {
    static toSummary(balance: BalanceWithLatestActivity, amount: number): WalletSummary {
        const { id, name, removedAt, movements } = balance;
        const lastActivityAt = movements?.[0]?.entry?.dueDate ?? null;
        const isArchived = removedAt !== null;

        return { id, name, isArchived, amount, lastActivityAt };
    }

    static toProfile(balance: PrismaBalance, currentBalance: number): WalletProfile {
        const { id, name, removedAt, createdAt } = balance;
        const isArchived = removedAt !== null;

        return { id, name, currentBalance, isArchived, createdAt };
    }
}