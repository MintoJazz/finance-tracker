import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { AmountAdjustmentSchema } from "./amount-adjustment.schema";
import { EffectiveFromSchema } from "./effective-from.schema";

describe("EffectiveFromSchema", () => {
    it("aceita NOW e NEXT_CYCLE sem data", () => {
        assert.ok(EffectiveFromSchema.safeParse({ effectiveMode: "NOW" }).success);
        assert.ok(
            EffectiveFromSchema.safeParse({ effectiveMode: "NEXT_CYCLE", effectiveFrom: null }).success
        );
    });

    it("exige data quando DATE", () => {
        const r = EffectiveFromSchema.safeParse({ effectiveMode: "DATE", effectiveFrom: null });
        assert.equal(r.success, false);
        assert.ok(
            EffectiveFromSchema.safeParse({ effectiveMode: "DATE", effectiveFrom: "2026-12-01" }).success
        );
    });

    it("rejeita data fora do formato ISO", () => {
        assert.equal(
            EffectiveFromSchema.safeParse({ effectiveMode: "DATE", effectiveFrom: "01/12/2026" }).success,
            false
        );
    });
});

describe("AmountAdjustmentSchema", () => {
    const ok = { amount: 14990, effectiveMode: "NEXT_CYCLE" as const };

    it("aceita valor em centavos", () => {
        assert.ok(AmountAdjustmentSchema.safeParse(ok).success);
    });

    it("rejeita valor negativo ou fracionado", () => {
        assert.equal(AmountAdjustmentSchema.safeParse({ ...ok, amount: -1 }).success, false);
        assert.equal(AmountAdjustmentSchema.safeParse({ ...ok, amount: 10.5 }).success, false);
    });

    it("propaga a regra de vigência", () => {
        assert.equal(
            AmountAdjustmentSchema.safeParse({ ...ok, effectiveMode: "DATE" }).success,
            false
        );
    });
});
