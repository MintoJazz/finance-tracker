import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    getCategorySubtitle,
    getCategoryColorStyle,
    getCategoryTheme,
    CATEGORY_COLOR_PALETTES,
} from "./index";
import { MovementCategoryClassification } from "@/modules/movements/models/wallet-movement.schema";

describe("CategoryBadge Helpers", () => {
    describe("getCategorySubtitle", () => {
        it("should return category name for kind: 'category'", () => {
            const classification: MovementCategoryClassification = {
                kind: "category",
                category: {
                    id: 1,
                    name: "Alimentação",
                    appearance: { icon: "Utensils", color: "orange" },
                },
            };
            assert.equal(getCategorySubtitle(classification), "Alimentação");
        });

        it("should return 'Múltiplas categorias' for kind: 'multiple'", () => {
            const classification: MovementCategoryClassification = {
                kind: "multiple",
            };
            assert.equal(getCategorySubtitle(classification), "Múltiplas categorias");
        });

        it("should return 'Repasse / Transferência' for kind: 'pass-through'", () => {
            const classification: MovementCategoryClassification = {
                kind: "pass-through",
            };
            assert.equal(getCategorySubtitle(classification), "Repasse / Transferência");
        });

        it("should return credit card name for kind: 'credit-settlement' when creditCard is present", () => {
            const classification: MovementCategoryClassification = {
                kind: "credit-settlement",
                creditCard: {
                    id: 5,
                    name: "Nubank Ultravioleta",
                },
            };
            assert.equal(
                getCategorySubtitle(classification),
                "Fatura: Nubank Ultravioleta"
            );
        });

        it("should return fallback for kind: 'credit-settlement' without creditCard", () => {
            const classification: MovementCategoryClassification = {
                kind: "credit-settlement",
            };
            assert.equal(getCategorySubtitle(classification), "Pagamento de fatura");
        });

        it("should return 'Sem categoria' for kind: 'none' or undefined", () => {
            assert.equal(getCategorySubtitle({ kind: "none" }), "Sem categoria");
            assert.equal(getCategorySubtitle(undefined), "Sem categoria");
            assert.equal(getCategorySubtitle(null), "Sem categoria");
        });
    });

    describe("getCategoryTheme", () => {
        it("should resolve named palette colors like orange, sky, amber, emerald", () => {
            const orangeTheme = getCategoryTheme("orange");
            assert.deepEqual(orangeTheme.palette, CATEGORY_COLOR_PALETTES.orange);

            const skyTheme = getCategoryTheme("sky");
            assert.deepEqual(skyTheme.palette, CATEGORY_COLOR_PALETTES.sky);

            const emeraldTheme = getCategoryTheme("emerald");
            assert.deepEqual(emeraldTheme.palette, CATEGORY_COLOR_PALETTES.emerald);
        });

        it("should resolve hex colors via style", () => {
            const hexTheme = getCategoryTheme("#3B82F6");
            assert.equal(hexTheme.palette, undefined);
            assert.equal(hexTheme.style?.color, "#3B82F6");
            assert.equal(hexTheme.style?.backgroundColor, "#3B82F620");
        });

        it("should return empty object for null, undefined or empty string", () => {
            assert.deepEqual(getCategoryTheme(null), {});
            assert.deepEqual(getCategoryTheme(undefined), {});
            assert.deepEqual(getCategoryTheme(""), {});
        });
    });

    describe("getCategoryColorStyle", () => {
        it("should convert hex colors to color and background with opacity", () => {
            const style = getCategoryColorStyle("#3B82F6");
            assert.equal(style.color, "#3B82F6");
            assert.equal(style.backgroundColor, "#3B82F620");
        });

        it("should return empty object for invalid or empty colors", () => {
            assert.deepEqual(getCategoryColorStyle(null), {});
            assert.deepEqual(getCategoryColorStyle(""), {});
            assert.deepEqual(getCategoryColorStyle(undefined), {});
        });
    });
});
