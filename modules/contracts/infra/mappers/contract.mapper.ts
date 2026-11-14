import { ContractSummaryItem } from "@/modules/contracts/models/contract.schema";
import { toCivilDate } from "@/lib/formatters";

// Type based on what Prisma will return with include
type RawContractBalance = {
    id: number;
    name: string;
    balanceType: string;
    removedAt: Date | null;
    agreement?: {
        balanceId: number;
        frequency: string;
        interval: number;
        startsAt: Date;
        endsAt: Date | null;
        includeInProjection: boolean;
        rules: {
            dueDay: number;
            effectiveFrom?: Date;
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

        const startsAt = toCivilDate(agreement.startsAt);
        const endsAt = agreement.endsAt ? toCivilDate(agreement.endsAt) : null;
        const effectiveDate = currentRule?.effectiveFrom ? toCivilDate(currentRule.effectiveFrom) : startsAt;
        const dueMonth = effectiveDate ? effectiveDate.getMonth() + 1 : null;

        return {
            id: balance.id,
            balanceId: balance.id,
            name: balance.name,
            type: balance.balanceType as "PAYABLE" | "RECEIVABLE",
            value,
            frequency: (agreement.frequency as "ONCE" | "WEEKLY" | "MONTHLY" | "YEARLY") ?? "MONTHLY",
            dueDay: currentRule?.dueDay ?? 1,
            dueMonth,
            startsAt,
            endsAt,
            includeInProjection: agreement.includeInProjection,
            isArchived: balance.removedAt !== null,
        };
    }
}
