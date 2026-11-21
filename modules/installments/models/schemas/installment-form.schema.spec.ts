import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    InstallmentFormSchema,
    InstallmentMainStepSchema,
    type InstallmentFormValues,
} from "./installment-form.schema";

const base: InstallmentFormValues = {
    type: "INVOICE",
    name: "iPhone",
    totalAmount: 960000,
    totalInstallments: 12,
    purchaseDate: "2026-11-20",
    cardId: 1,
    categoryId: 1,
    newCategory: null,
    subcategoryId: 11,
    newSubcategory: null,
};

const firstMessage = (data: unknown) => {
    const r = InstallmentFormSchema.safeParse(data);
    return r.success ? null : r.error.issues[0].message;
};

describe("InstallmentFormSchema", () => {
    it("aceita parcelamento na fatura com cartão", () => {
        assert.equal(InstallmentFormSchema.safeParse(base).success, true);
    });

    it("exige cartão quando o tipo é INVOICE", () => {
        assert.equal(
            firstMessage({ ...base, cardId: null }),
            "Selecione o cartão da fatura"
        );
    });

    it("não exige cartão quando o tipo é MONTHLY", () => {
        assert.equal(
            InstallmentFormSchema.safeParse({ ...base, type: "MONTHLY", cardId: null })
                .success,
            true
        );
    });

    it("rejeita número de parcelas fora de 2..120", () => {
        assert.notEqual(firstMessage({ ...base, totalInstallments: 1 }), null);
        assert.notEqual(firstMessage({ ...base, totalInstallments: 121 }), null);
    });

    it("rejeita valor total zerado", () => {
        assert.notEqual(firstMessage({ ...base, totalAmount: 0 }), null);
    });

    it("exige exatamente uma subcategoria (existente ou nova)", () => {
        assert.equal(
            firstMessage({ ...base, subcategoryId: null }),
            "Selecione ou crie uma subcategoria"
        );
        assert.equal(
            InstallmentFormSchema.safeParse({
                ...base,
                categoryId: null,
                subcategoryId: null,
                newCategory: { name: "Eletrônicos", color: "#06B6D4", icon: "Tag" },
                newSubcategory: { name: "Celulares", color: "#06B6D4", icon: "Tag" },
            }).success,
            true
        );
    });
});

describe("InstallmentMainStepSchema", () => {
    it("aceita rascunho de categoria nova ainda sem nome", () => {
        const r = InstallmentMainStepSchema.safeParse({
            ...base,
            categoryId: null,
            subcategoryId: null,
            newCategory: { name: "", color: "#06B6D4", icon: "Tag" },
            newSubcategory: { name: "", color: "#06B6D4", icon: "Tag" },
        });
        assert.equal(r.success, true);
    });
});
