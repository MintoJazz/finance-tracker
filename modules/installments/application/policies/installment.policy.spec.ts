import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InstallmentDomainError, InstallmentPolicy } from "./installment.policy";

describe("InstallmentPolicy", () => {
    it("bloqueia mutações quando o parcelamento está arquivado", () => {
        assert.doesNotThrow(() => InstallmentPolicy.assertNotArchived(false));
        assert.throws(
            () => InstallmentPolicy.assertNotArchived(true),
            (err: unknown) =>
                err instanceof InstallmentDomainError && err.code === "INSTALLMENT_ARCHIVED"
        );
    });

    it("bloqueia mutações financeiras quando 100% das parcelas estão consolidadas", () => {
        assert.doesNotThrow(() => InstallmentPolicy.assertHasOpenParcels(5, 12));
        assert.throws(
            () => InstallmentPolicy.assertHasOpenParcels(12, 12),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "INSTALLMENT_FULLY_CONSOLIDATED"
        );
    });

    it("separa ações exclusivas de MONTHLY e INVOICE", () => {
        assert.doesNotThrow(() => InstallmentPolicy.assertCanAdjustDueDay("MONTHLY"));
        assert.throws(
            () => InstallmentPolicy.assertCanAdjustDueDay("INVOICE"),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "INVALID_TYPE_FOR_DUE_DAY"
        );

        assert.doesNotThrow(() => InstallmentPolicy.assertCanChangeCard("INVOICE"));
        assert.throws(
            () => InstallmentPolicy.assertCanChangeCard("MONTHLY"),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "INVALID_TYPE_FOR_CARD_CHANGE"
        );
    });

    it("valida limites e fronteira de consolidação na reconciliação de valores", () => {
        assert.doesNotThrow(() =>
            InstallmentPolicy.assertValidValuesReconciliation({
                consolidatedInstallments: 4,
                newTotalInstallments: 10,
                remainingTotalAmount: 60000,
            })
        );

        // Reduzir abaixo do que já está consolidado -> erro
        assert.throws(
            () =>
                InstallmentPolicy.assertValidValuesReconciliation({
                    consolidatedInstallments: 4,
                    newTotalInstallments: 3,
                    remainingTotalAmount: 0,
                }),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "TOTAL_BELOW_CONSOLIDATED"
        );

        // 0 consolidadas com menos de 2 parcelas -> erro
        assert.throws(
            () =>
                InstallmentPolicy.assertValidValuesReconciliation({
                    consolidatedInstallments: 0,
                    newTotalInstallments: 1,
                    remainingTotalAmount: 10000,
                }),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "MIN_INSTALLMENTS_REQUIRED"
        );

        // Valor restante <= 0 quando ainda há parcelas em aberto -> erro
        assert.throws(
            () =>
                InstallmentPolicy.assertValidValuesReconciliation({
                    consolidatedInstallments: 4,
                    newTotalInstallments: 6,
                    remainingTotalAmount: 0,
                }),
            (err: unknown) =>
                err instanceof InstallmentDomainError &&
                err.code === "INVALID_REMAINING_AMOUNT"
        );
    });
});
