import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    computeInstallmentAmount,
    computeLastInstallmentAmount,
    computeLastInstallmentDate,
} from "./installment-form.utils";

describe("installment-form.utils", () => {
    it("valor da parcela é o floor e a última absorve o resto", () => {
        assert.equal(computeInstallmentAmount(10000, 3), 3333);
        assert.equal(computeLastInstallmentAmount(10000, 3), 3334);
        assert.equal(computeInstallmentAmount(30000, 3), 10000);
        assert.equal(computeLastInstallmentAmount(30000, 3), 10000);
    });

    it("entradas incompletas ou fracionadas devolvem 0 sem lançar", () => {
        for (const [total, count] of [
            [undefined, 3],
            [0, 3],
            [10000, undefined],
            [10000, 0],
            [10000, 2.5],
            [100.5, 3],
        ] as const) {
            assert.equal(computeInstallmentAmount(total, count), 0);
            assert.equal(computeLastInstallmentAmount(total, count), 0);
        }
    });

    it("data da última parcela contando mês a mês", () => {
        assert.equal(computeLastInstallmentDate("2030-11-15", 3), "2031-01-15");
        assert.equal(computeLastInstallmentDate("2031-01-31", 2), "2031-02-28");
        assert.equal(computeLastInstallmentDate(undefined, 3), null);
    });
});
