import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InstallmentDomainError } from "../policies/installment.policy";
import { planInstallmentValuesReconciliation } from "./installment-values-reconciliation.calculator";

describe("planInstallmentValuesReconciliation", () => {
    it("edita pelo valor total com dízima e joga a diferença na última parcela em aberto", () => {
        // 2 consolidadas (R$ 200 total), 3 abertas restantes; novo total = R$ 300 -> restante = R$ 100 em 3x (33, 33, 34)
        const plan = planInstallmentValuesReconciliation({
            totalInstallments: 5,
            consolidatedInstallments: 2,
            consolidatedAmount: 20000,
            endsAt: "2027-05-10",
            newTotalInstallments: 5,
            editMode: "TOTAL_AMOUNT",
            targetAmount: 30000,
        });

        assert.equal(plan.consolidatedCount, 2);
        assert.equal(plan.targetOpenCount, 3);
        assert.equal(plan.baseOpenAmount, 3333);
        assert.equal(plan.lastOpenAmount, 3334);
        assert.equal(plan.hasRemainder, true);
        assert.equal(plan.remainingTotalAmount, 10000);
        assert.equal(plan.newTotalAmount, 30000);
        assert.equal(plan.addedCount, 0);
        assert.equal(plan.cancelledCount, 0);
        assert.equal(plan.newEndsAt, "2027-05-10");
    });

    it("expande a quantidade de parcelas em aberto mantendo as datas das mantidas e estendendo endsAt", () => {
        const plan = planInstallmentValuesReconciliation({
            totalInstallments: 6,
            consolidatedInstallments: 2,
            consolidatedAmount: 20000,
            endsAt: "2027-03-15",
            newTotalInstallments: 8,
            editMode: "INSTALLMENT_AMOUNT",
            targetAmount: 12000,
        });

        assert.equal(plan.currentOpenCount, 4);
        assert.equal(plan.targetOpenCount, 6);
        assert.equal(plan.keptOpenCount, 4);
        assert.equal(plan.addedCount, 2);
        assert.equal(plan.cancelledCount, 0);
        assert.equal(plan.baseOpenAmount, 12000);
        assert.equal(plan.lastOpenAmount, 12000);
        assert.equal(plan.hasRemainder, false);
        assert.equal(plan.newTotalAmount, 20000 + 6 * 12000);
        assert.equal(plan.newEndsAt, "2027-05-15");
    });

    it("reduz a quantidade de parcelas cancelando as últimas em aberto e recuando endsAt", () => {
        const plan = planInstallmentValuesReconciliation({
            totalInstallments: 10,
            consolidatedInstallments: 4,
            consolidatedAmount: 40000,
            endsAt: "2027-08-20",
            newTotalInstallments: 7,
            editMode: "INSTALLMENT_AMOUNT",
            targetAmount: 15000,
        });

        assert.equal(plan.currentOpenCount, 6);
        assert.equal(plan.targetOpenCount, 3);
        assert.equal(plan.keptOpenCount, 3);
        assert.equal(plan.addedCount, 0);
        assert.equal(plan.cancelledCount, 3);
        assert.equal(plan.newTotalAmount, 40000 + 3 * 15000);
        assert.equal(plan.newEndsAt, "2027-05-20");
    });

    it("bloqueia quando todas as parcelas já estão consolidadas", () => {
        assert.throws(
            () =>
                planInstallmentValuesReconciliation({
                    totalInstallments: 12,
                    consolidatedInstallments: 12,
                    consolidatedAmount: 120000,
                    endsAt: "2026-10-05",
                    newTotalInstallments: 12,
                    editMode: "INSTALLMENT_AMOUNT",
                    targetAmount: 10000,
                }),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "INSTALLMENT_FULLY_CONSOLIDATED"
        );
    });
});
