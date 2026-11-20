import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { InstallmentPrismaQueries } from "./installment-prisma.queries";

describe("InstallmentPrismaQueries - Integração com Banco", () => {
    const queries = new InstallmentPrismaQueries();

    it("lista e mapeia os parcelamentos de um contexto com parcelas", async () => {
        const row = await prisma.installmentSummaryView.findFirst();
        if (!row) return;

        const items = await queries.listInstallmentsByContextId(row.contextId);
        assert.ok(items.length > 0);

        const item = items.find((i) => i.id === row.balanceId);
        assert.ok(item);
        assert.equal(item.type, row.cardBalanceId != null ? "INVOICE" : "MONTHLY");
        assert.equal(item.totalInstallments, row.totalInstallments);
        assert.equal(item.paidInstallments, row.paidInstallments);
        assert.equal(item.isOverdue, row.isOverdue);
        assert.ok(item.paidInstallments <= item.totalInstallments);
    });

    it("filtra por tipo e devolve null para balance de outro contexto", async () => {
        const row = await prisma.installmentSummaryView.findFirst();
        if (!row) return;

        const wrongType = row.cardBalanceId != null ? "MONTHLY" : "INVOICE";
        const filtered = await queries.listInstallmentsByContextId(row.contextId, {
            status: "ALL",
            type: wrongType,
        });
        assert.ok(!filtered.some((i) => i.id === row.balanceId));

        const other = await queries.findInstallmentById(row.balanceId, -1);
        assert.equal(other, null);
    });
});
