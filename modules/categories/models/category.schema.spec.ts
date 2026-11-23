import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
    ArchiveCategorySchema,
    ArchiveSubcategorySchema,
    CategoryFormSchema,
    CategoryItemSchema,
    RestoreCategorySchema,
    UpdateCategorySchema,
    findCategoryInTree,
    type CategoryItem,
} from "./category.schema";

describe("CategoryFormSchema", () => {
    const parse = (v: unknown) => CategoryFormSchema.safeParse(v);

    it("aceita nome válido e campos opcionais ausentes ou nulos", () => {
        assert.equal(parse({ name: "Moradia" }).success, true);
        assert.equal(parse({ name: "Moradia", color: null, icon: null, parentId: null }).success, true);
        assert.equal(parse({ name: "Aluguel", parentId: 3, color: "#fff", icon: "Home" }).success, true);
    });
    it("remove espaços do nome", () => {
        assert.equal(parse({ name: "  Moradia  " }).data?.name, "Moradia");
    });
    it("limites do nome: 1 e 50 aceitos; vazio e 51 rejeitados", () => {
        assert.equal(parse({ name: "a" }).success, true);
        assert.equal(parse({ name: "a".repeat(50) }).success, true);
        assert.equal(parse({ name: "" }).success, false);
        assert.equal(parse({ name: "   " }).success, false);
        assert.equal(parse({ name: "a".repeat(51) }).success, false);
    });
    it("parentId deve ser inteiro positivo", () => {
        for (const parentId of [0, -1, 1.5, "2"]) {
            assert.equal(parse({ name: "X", parentId }).success, false, String(parentId));
        }
    });
});

describe("Schemas de id (update / archive / restore)", () => {
    it("UpdateCategorySchema exige id positivo", () => {
        assert.equal(UpdateCategorySchema.safeParse({ id: 1, name: "X" }).success, true);
        assert.equal(UpdateCategorySchema.safeParse({ id: 0, name: "X" }).success, false);
        assert.equal(UpdateCategorySchema.safeParse({ name: "X" }).success, false);
    });
    for (const [label, schema] of [
        ["ArchiveCategorySchema", ArchiveCategorySchema],
        ["ArchiveSubcategorySchema", ArchiveSubcategorySchema],
        ["RestoreCategorySchema", RestoreCategorySchema],
    ] as const) {
        it(`${label}: aceita id positivo e rejeita 0, negativo, decimal e ausente`, () => {
            assert.equal(schema.safeParse({ id: 1 }).success, true);
            for (const id of [0, -2, 1.5]) assert.equal(schema.safeParse({ id }).success, false);
            assert.equal(schema.safeParse({}).success, false);
        });
    }
});

describe("CategoryItemSchema", () => {
    it("aplica defaults de childrenCount e children e valida recursivamente", () => {
        const parsed = CategoryItemSchema.parse({
            id: 1,
            name: "Moradia",
            amount: 1000,
            children: [{ id: 2, name: "Aluguel", amount: 500, parentId: 1 }],
        });
        assert.equal(parsed.childrenCount, 0);
        assert.equal(parsed.children[0].childrenCount, 0);
        assert.deepEqual(parsed.children[0].children, []);
    });
    it("rejeita filho inválido e amount decimal", () => {
        assert.equal(
            CategoryItemSchema.safeParse({ id: 1, name: "A", amount: 1, children: [{ id: 0, name: "B", amount: 1 }] }).success,
            false
        );
        assert.equal(CategoryItemSchema.safeParse({ id: 1, name: "A", amount: 1.5 }).success, false);
    });
});

describe("findCategoryInTree", () => {
    const item = (id: number, children: CategoryItem[] = []): CategoryItem => ({
        id,
        name: `c${id}`,
        amount: 0,
        childrenCount: children.length,
        children,
    });
    const tree = [item(1, [item(11), item(12, [item(121)])]), item(2)];

    it("encontra itens na raiz e em qualquer profundidade", () => {
        assert.equal(findCategoryInTree(tree, 2)?.id, 2);
        assert.equal(findCategoryInTree(tree, 11)?.id, 11);
        assert.equal(findCategoryInTree(tree, 121)?.id, 121);
    });
    it("retorna null quando não existe ou a lista é vazia", () => {
        assert.equal(findCategoryInTree(tree, 999), null);
        assert.equal(findCategoryInTree([], 1), null);
    });
});
