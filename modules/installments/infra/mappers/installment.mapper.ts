import { format } from "date-fns";
import type {
    Balance as PrismaBalance,
    BalanceAppearance as PrismaBalanceAppearance,
    InstallmentSummaryView as PrismaInstallmentSummary,
} from "@/prisma/generated/prisma/client";
import {
    resolveInstallmentType,
    type InstallmentListItem,
} from "@/modules/installments/models/schemas/installment-item.schema";

export type InstallmentBalanceRecord = PrismaBalance & {
    appearance: PrismaBalanceAppearance | null;
};

export interface InstallmentMapperInput {
    summary: PrismaInstallmentSummary;
    /** Balance `INSTALLMENT` (nome e aparência). */
    balance: InstallmentBalanceRecord;
    card: PrismaBalance | null;
    category: InstallmentBalanceRecord | null;
}

const toDay = (date: Date) => format(date, "yyyy-MM-dd");

export class InstallmentMapper {
    static toListItem({
        summary,
        balance,
        card,
        category,
    }: InstallmentMapperInput): InstallmentListItem {
        return {
            id: summary.balanceId,
            description: balance.name,
            type: resolveInstallmentType(summary.cardBalanceId),
            totalAmount: summary.totalAmount,
            installmentAmount: summary.installmentAmount,
            totalInstallments: summary.totalInstallments,
            paidInstallments: summary.paidInstallments,
            purchaseDate: toDay(summary.firstDueDate),
            nextDueDate: summary.nextDueDate ? toDay(summary.nextDueDate) : null,
            endsAt: toDay(summary.endsAt),
            isOverdue: summary.isOverdue,
            card: card ? { id: card.id, name: card.name } : null,
            category: category
                ? {
                      balanceId: category.id,
                      name: category.name,
                      color: category.appearance?.color ?? null,
                  }
                : null,
            icon: balance.appearance?.icon ?? category?.appearance?.icon ?? null,
            color:
                balance.appearance?.color ?? category?.appearance?.color ?? null,
        };
    }
}
