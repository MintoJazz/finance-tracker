import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ChangeInstallmentCardSchema } from "./installment-card.schema";
import { ChangeInstallmentCategorySchema } from "./installment-category.schema";
import { AdjustMonthlyDueDaySchema } from "./installment-deadlines.schema";
import { UpdateInstallmentNameSchema } from "./installment-edit.schema";
import { AdjustInstallmentValuesSchema } from "./installment-values.schema";

describe("Installment mutation schemas", () => {
    it("UpdateInstallmentNameSchema valida apenas nome e syncEntryDescriptions (sem aparência)", () => {
        const parsed = UpdateInstallmentNameSchema.parse({ name: "  iPhone 16 Pro  " });
        assert.deepEqual(parsed, {
            name: "iPhone 16 Pro",
            syncEntryDescriptions: true,
        });

        assert.equal(UpdateInstallmentNameSchema.safeParse({ name: "   " }).success, false);
        assert.equal(
            UpdateInstallmentNameSchema.safeParse({ name: "a".repeat(101) }).success,
            false
        );
    });

    it("ChangeInstallmentCategorySchema exige classificação válida e aplica scope padrão OPEN_ONLY", () => {
        const valid = ChangeInstallmentCategorySchema.parse({
            categoryId: 10,
            newCategory: null,
            subcategoryId: 20,
            newSubcategory: null,
        });
        assert.equal(valid.scope, "OPEN_ONLY");

        const all = ChangeInstallmentCategorySchema.parse({
            categoryId: 10,
            newCategory: null,
            subcategoryId: 20,
            newSubcategory: null,
            scope: "ALL",
        });
        assert.equal(all.scope, "ALL");

        const invalid = ChangeInstallmentCategorySchema.safeParse({
            categoryId: null,
            newCategory: null,
            subcategoryId: null,
            newSubcategory: null,
            scope: "OPEN_ONLY",
        });
        assert.equal(invalid.success, false);
    });

    it("AdjustInstallmentValuesSchema valida valores positivos e limites de parcelas", () => {
        assert.equal(
            AdjustInstallmentValuesSchema.safeParse({
                totalInstallments: 12,
                editMode: "INSTALLMENT_AMOUNT",
                installmentAmount: 10000,
                totalAmount: 120000,
            }).success,
            true
        );

        assert.equal(
            AdjustInstallmentValuesSchema.safeParse({
                totalInstallments: 0,
                editMode: "TOTAL_AMOUNT",
                installmentAmount: 10000,
                totalAmount: 10000,
            }).success,
            false
        );

        assert.equal(
            AdjustInstallmentValuesSchema.safeParse({
                totalInstallments: 121,
                editMode: "TOTAL_AMOUNT",
                installmentAmount: 10000,
                totalAmount: 1210000,
            }).success,
            false
        );
    });

    it("AdjustMonthlyDueDaySchema valida limites do dia de vencimento", () => {
        assert.equal(AdjustMonthlyDueDaySchema.safeParse({ dueDay: 1 }).success, true);
        assert.equal(AdjustMonthlyDueDaySchema.safeParse({ dueDay: 31 }).success, true);
        assert.equal(AdjustMonthlyDueDaySchema.safeParse({ dueDay: 0 }).success, false);
        assert.equal(AdjustMonthlyDueDaySchema.safeParse({ dueDay: 32 }).success, false);
    });

    it("ChangeInstallmentCardSchema exige cardId inteiro positivo", () => {
        assert.equal(ChangeInstallmentCardSchema.safeParse({ cardId: 3 }).success, true);
        assert.equal(ChangeInstallmentCardSchema.safeParse({ cardId: 0 }).success, false);
        assert.equal(ChangeInstallmentCardSchema.safeParse({ cardId: -1 }).success, false);
    });
});
