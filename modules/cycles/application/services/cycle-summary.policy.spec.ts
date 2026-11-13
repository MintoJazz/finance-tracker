import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    CycleSummaryCalculator,
    COMMITMENT_STATUS_FINANCIAL_ROLE,
} from "./cycle-summary.policy";
import { CommitmentCycleItem } from "../../models/commitment-cycle.schema";

describe("CycleSummaryPolicy & CycleSummaryCalculator", () => {
    it("mapeia todos os status de ciclo para seus respectivos papéis financeiros", () => {
        assert.strictEqual(COMMITMENT_STATUS_FINANCIAL_ROLE.OVERDUE, "OVERDUE");
        assert.strictEqual(COMMITMENT_STATUS_FINANCIAL_ROLE.PAID, "SETTLED");
        assert.strictEqual(COMMITMENT_STATUS_FINANCIAL_ROLE.OPEN, "PENDING");
        assert.strictEqual(COMMITMENT_STATUS_FINANCIAL_ROLE.PENDING, "PENDING");
        assert.strictEqual(COMMITMENT_STATUS_FINANCIAL_ROLE.PARTIAL, "PENDING");
        assert.strictEqual(COMMITMENT_STATUS_FINANCIAL_ROLE.PROJECTED, "PENDING");
    });

    it("acumula total, pago, vencido e pendente corretamente", () => {
        const createMockItem = (
            status: CommitmentCycleItem["status"],
            totalAmount: number,
            paidAmount: number,
            remainingAmount: number
        ): CommitmentCycleItem => ({
            cycleKey: "test",
            agreementId: 1,
            balanceId: 1,
            balanceName: "Test",
            balanceType: "COMMITMENT",
            label: "Test",
            from: "2026-05-01",
            to: "2026-05-31",
            closingDate: new Date(),
            dueDate: new Date(),
            totalAmount,
            paidAmount,
            remainingAmount,
            status,
        });

        const cycles: CommitmentCycleItem[] = [
            createMockItem("PAID", 10000, 10000, 0),
            createMockItem("OVERDUE", 15000, 5000, 10000),
            createMockItem("OPEN", 20000, 0, 20000),
            createMockItem("PARTIAL", 30000, 10000, 20000),
            createMockItem("PROJECTED", 50000, 0, 50000),
        ];

        const summary = CycleSummaryCalculator.summarize(cycles);

        assert.strictEqual(summary.totalAmount, 125000);
        assert.strictEqual(summary.paidAmount, 25000);
        assert.strictEqual(summary.overdueAmount, 10000);
        assert.strictEqual(summary.overdueCount, 1);
        assert.strictEqual(summary.pendingAmount, 90000); // 20000 (OPEN) + 20000 (PARTIAL) + 50000 (PROJECTED)
    });
});

