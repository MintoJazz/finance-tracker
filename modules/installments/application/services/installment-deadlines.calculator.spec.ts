import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InstallmentDomainError } from "../policies/installment.policy";
import {
    applyDueDayToCivilDate,
    planMonthlyDueDayAdjustment,
} from "./installment-deadlines.calculator";

describe("installment-deadlines.calculator", () => {
    it("aplica clamp ao último dia do mês (ex.: dia 31 em fevereiro -> 28/fev)", () => {
        assert.equal(applyDueDayToCivilDate("2027-02-10", 31), "2027-02-28");
        assert.equal(applyDueDayToCivilDate("2028-02-10", 31), "2028-02-29");
        assert.equal(applyDueDayToCivilDate("2027-04-10", 31), "2027-04-30");
    });

    it("planMonthlyDueDayAdjustment ajusta apenas datas das parcelas em aberto", () => {
        const preview = planMonthlyDueDayAdjustment({
            nextDueDate: "2027-02-15",
            endsAt: "2027-05-15",
            openCount: 4,
            newDueDay: 31,
        });

        assert.equal(preview.affectedCount, 4);
        assert.equal(preview.previousNextDueDate, "2027-02-15");
        assert.equal(preview.newNextDueDate, "2027-02-28");
        assert.equal(preview.previousEndsAt, "2027-05-15");
        assert.equal(preview.newEndsAt, "2027-05-31");
    });

    it("rejeita dia de vencimento inválido", () => {
        assert.throws(
            () =>
                planMonthlyDueDayAdjustment({
                    nextDueDate: "2026-12-10",
                    endsAt: "2027-05-10",
                    openCount: 3,
                    newDueDay: 32,
                }),
            (err: unknown) =>
                err instanceof InstallmentDomainError && err.code === "INVALID_DUE_DAY"
        );
    });
});
