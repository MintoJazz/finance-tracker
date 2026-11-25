import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { planInstallmentArchive } from "./installment-archive.calculator";

describe("planInstallmentArchive", () => {
    it("com 0 consolidadas: cancela todas e zera newEndsAt", () => {
        const plan = planInstallmentArchive({
            totalInstallments: 12,
            consolidatedInstallments: 0,
            purchaseDate: "2026-11-10",
        });

        assert.equal(plan.keptCount, 0);
        assert.equal(plan.cancelledCount, 12);
        assert.equal(plan.newEndsAt, null);
    });

    it("parcialmente consolidado: mantém consolidadas e cancela cauda em aberto", () => {
        const plan = planInstallmentArchive({
            totalInstallments: 12,
            consolidatedInstallments: 5,
            purchaseDate: "2026-06-12",
        });

        assert.equal(plan.keptCount, 5);
        assert.equal(plan.cancelledCount, 7);
        assert.equal(plan.newEndsAt, "2026-10-12");
    });

    it("100% consolidado: mantém todas e cancela 0", () => {
        const plan = planInstallmentArchive({
            totalInstallments: 10,
            consolidatedInstallments: 10,
            purchaseDate: "2026-01-15",
        });

        assert.equal(plan.keptCount, 10);
        assert.equal(plan.cancelledCount, 0);
        assert.equal(plan.newEndsAt, "2026-10-15");
    });
});
