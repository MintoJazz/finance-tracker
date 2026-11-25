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
    /** Balance `INSTALLMENT` (nome). Parcelamentos não possuem BalanceAppearance próprio. */
    balance: PrismaBalance;
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
        const categoryIcon = category?.appearance?.icon ?? null;
        const categoryColor = category?.appearance?.color ?? null;

        return {
            id: summary.balanceId,
            description: balance.name,
            type: resolveInstallmentType(summary.cardBalanceId),
            totalAmount: summary.totalAmount,
            installmentAmount: summary.installmentAmount,
            totalInstallments: summary.totalInstallments,
            paidInstallments: summary.paidInstallments,
            paidAmount: summary.paidAmount,
            consolidatedInstallments: summary.consolidatedInstallments,
            consolidatedAmount: summary.consolidatedAmount,
            purchaseDate: summary.firstDueDate ? toDay(summary.firstDueDate) : null,
            nextDueDate: summary.nextDueDate ? toDay(summary.nextDueDate) : null,
            endsAt: summary.endsAt ? toDay(summary.endsAt) : null,
            isOverdue: summary.isOverdue,
            isArchived: summary.removedAt != null,
            card: card ? { id: card.id, name: card.name } : null,
            category: category
                ? {
                      balanceId: category.id,
                      name: category.name,
                      color: categoryColor,
                      icon: categoryIcon,
                  }
                : null,
            icon: categoryIcon,
            color: categoryColor,
        };
    }
}
