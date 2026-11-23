import { prisma } from "@/lib/prisma";
import type { IInstallmentQueries } from "../../application/interfaces/installment-queries.interface";
import {
    getInstallmentStatus,
    type InstallmentCard,
    type InstallmentFilters,
    type InstallmentListItem,
} from "../../models/schemas/installment-item.schema";
import {
    InstallmentMapper,
    type InstallmentBalanceRecord,
} from "../mappers/installment.mapper";

export class InstallmentPrismaQueries implements IInstallmentQueries {
    async listInstallmentsByContextId(
        contextId: number,
        filter?: InstallmentFilters
    ): Promise<InstallmentListItem[]> {
        const summaries = await prisma.installmentSummaryView.findMany({
            where: {
                contextId,
                ...(filter?.cardId ? { cardBalanceId: filter.cardId } : {}),
            },
        });

        const items = await this.hydrate(summaries);

        const term = filter?.q?.trim().toLowerCase();
        return items
            .filter((item) => !filter?.type || item.type === filter.type)
            .filter(
                (item) =>
                    !filter?.status ||
                    filter.status === "ALL" ||
                    getInstallmentStatus(item) === filter.status
            )
            .filter(
                (item) =>
                    !term ||
                    item.description.toLowerCase().includes(term) ||
                    item.category?.name.toLowerCase().includes(term)
            )
            .sort(
                (a, b) =>
                    (a.nextDueDate ?? "9999-12-31").localeCompare(
                        b.nextDueDate ?? "9999-12-31"
                    ) || a.description.localeCompare(b.description)
            );
    }

    async findInstallmentById(
        balanceId: number,
        contextId: number
    ): Promise<InstallmentListItem | null> {
        const summary = await prisma.installmentSummaryView.findFirst({
            where: { balanceId, contextId },
        });
        if (!summary) return null;

        const [item] = await this.hydrate([summary]);
        return item ?? null;
    }

    async listCardOptions(contextId: number): Promise<InstallmentCard[]> {
        return prisma.balance.findMany({
            where: { contextId, balanceType: "CREDIT", removedAt: null },
            select: { id: true, name: true },
            orderBy: { name: "asc" },
        });
    }

    /** Junta nome/aparência do parcelamento, cartão e categoria (uma consulta para todos). */
    private async hydrate(
        summaries: Awaited<
            ReturnType<typeof prisma.installmentSummaryView.findMany>
        >
    ): Promise<InstallmentListItem[]> {
        if (summaries.length === 0) return [];

        const ids = new Set<number>();
        for (const s of summaries) {
            ids.add(s.balanceId);
            if (s.cardBalanceId != null) ids.add(s.cardBalanceId);
            if (s.categoryBalanceId != null) ids.add(s.categoryBalanceId);
        }

        const balances = await prisma.balance.findMany({
            where: { id: { in: [...ids] } },
            include: { appearance: true },
        });
        const byId = new Map<number, InstallmentBalanceRecord>(
            balances.map((b) => [b.id, b])
        );

        return summaries.flatMap((summary) => {
            const balance = byId.get(summary.balanceId);
            if (!balance) return [];
            return [
                InstallmentMapper.toListItem({
                    summary,
                    balance,
                    card:
                        summary.cardBalanceId != null
                            ? (byId.get(summary.cardBalanceId) ?? null)
                            : null,
                    category:
                        summary.categoryBalanceId != null
                            ? (byId.get(summary.categoryBalanceId) ?? null)
                            : null,
                }),
            ];
        });
    }
}

