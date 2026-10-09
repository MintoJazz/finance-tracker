import { ContractSummaryItem } from "../../core/schemas/contract.schema";

// Type based on what Prisma will return with include
type RawContractBalance = {
    id: number;
    name: string;
    balanceType: string;
    removedAt: Date | null;
    agreement?: {
        id: number;
        startsAt: Date;
        endsAt: Date | null;
        includeInProjection: boolean;
        rules: {
            frequency: string;
            dueDay: number;
        }[];
        amountEntries?: {
            amount: number;
        }[];
    } | null;
};

export class ContractMapper {
    static toSummary(balance: RawContractBalance): ContractSummaryItem {
        const agreement = balance.agreement;
        if (!agreement) {
            throw new Error(`Balance ${balance.id} does not have an agreement`);
        }

        const currentRule = agreement.rules?.[0];
        const value = Math.max(
            0,
            agreement.amountEntries?.reduce((sum, e) => sum + e.amount, 0) ?? 0
        );

        return {
            id: agreement.id,
            balanceId: balance.id,
            name: balance.name,
            type: balance.balanceType as "PAYABLE" | "RECEIVABLE",
            value,
            frequency: (currentRule?.frequency as "WEEKLY" | "MONTHLY" | "YEARLY") ?? "MONTHLY",
            dueDay: currentRule?.dueDay ?? 1,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
            includeInProjection: agreement.includeInProjection,
            isArchived: balance.removedAt !== null,
        };
    }
}
