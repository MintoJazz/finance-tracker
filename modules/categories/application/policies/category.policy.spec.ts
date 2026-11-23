import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CategoryEntity } from "@/modules/categories/models/category.schema";
import {
    CategoryDomainError,
    CategoryPolicy,
    CategoryStateConflictError,
    InvalidHierarchyLevelError,
    ParentCategoryArchivedError,
} from "./category.policy";

const cat = (overrides: Partial<CategoryEntity> = {}): CategoryEntity => ({
    id: 1,
    name: "Moradia",
    contextId: 100,
    parentId: null,
    removedAt: null,
    isArchived: false,
    ...overrides,
});
const sub = (overrides: Partial<CategoryEntity> = {}) =>
    cat({ id: 11, name: "Aluguel", parentId: 1, ...overrides });
const archived = { removedAt: new Date("2026-01-01"), isArchived: true };

const codeOf = (fn: () => unknown) => {
    try {
        fn();
    } catch (e) {
        assert.ok(e instanceof CategoryDomainError, "esperava CategoryDomainError");
        return e.code;
    }
    return null;
};

describe("CategoryPolicy — erros de domínio", () => {
    it("cada erro especializado carrega código e é um CategoryDomainError", () => {
        const parent = new ParentCategoryArchivedError();
        const level = new InvalidHierarchyLevelError();
        const conflict = new CategoryStateConflictError();

        assert.equal(parent.code, "PARENT_ARCHIVED");
        assert.equal(level.code, "INVALID_HIERARCHY_LEVEL");
        assert.equal(conflict.code, "STATE_CONFLICT");
        for (const e of [parent, level, conflict]) {
            assert.ok(e instanceof CategoryDomainError);
            assert.ok(e instanceof Error);
            assert.equal(e.name, "CategoryDomainError");
            assert.ok(e.message.length > 0);
        }
    });
});

describe("CategoryPolicy.validateExistingCategory", () => {
    it("retorna a categoria raiz ativa", () => {
        const c = cat();
        assert.equal(CategoryPolicy.validateExistingCategory(c), c);
    });
    it("rejeita inexistente, subcategoria e arquivada", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateExistingCategory(null)), "CATEGORY_NOT_FOUND");
        assert.equal(codeOf(() => CategoryPolicy.validateExistingCategory(sub())), "CATEGORY_IS_SUBCATEGORY");
        assert.equal(codeOf(() => CategoryPolicy.validateExistingCategory(cat(archived))), "CATEGORY_ARCHIVED");
    });
    it("trata isArchived isolado como arquivada", () => {
        assert.equal(
            codeOf(() => CategoryPolicy.validateExistingCategory(cat({ isArchived: true }))),
            "CATEGORY_ARCHIVED"
        );
    });
});

describe("CategoryPolicy.validateExistingSubcategory", () => {
    it("retorna a subcategoria ativa, com ou sem categoria esperada", () => {
        const s = sub();
        assert.equal(CategoryPolicy.validateExistingSubcategory(s), s);
        assert.equal(CategoryPolicy.validateExistingSubcategory(s, 1), s);
        assert.equal(CategoryPolicy.validateExistingSubcategory(s, null), s);
    });
    it("rejeita inexistente, raiz e arquivada", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateExistingSubcategory(null)), "SUBCATEGORY_NOT_FOUND");
        assert.equal(codeOf(() => CategoryPolicy.validateExistingSubcategory(cat())), "SUBCATEGORY_IS_ROOT");
        assert.equal(codeOf(() => CategoryPolicy.validateExistingSubcategory(sub(archived))), "SUBCATEGORY_ARCHIVED");
    });
    it("rejeita subcategoria de outra categoria", () => {
        assert.equal(
            codeOf(() => CategoryPolicy.validateExistingSubcategory(sub(), 2)),
            "SUBCATEGORY_PARENT_MISMATCH"
        );
    });
});

describe("CategoryPolicy.validateCanArchiveCategory (regra 1)", () => {
    it("permite arquivar raiz ativa", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveCategory(cat())), null);
    });
    it("rejeita subcategoria (nível inválido) e categoria já arquivada", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveCategory(sub())), "INVALID_HIERARCHY_LEVEL");
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveCategory(cat(archived))), "ALREADY_ARCHIVED");
    });
});

describe("CategoryPolicy.validateCanArchiveSubcategory (regras 2 e 5)", () => {
    it("permite arquivar subcategoria ativa com pai ativo ou ausente", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveSubcategory(sub(), cat())), null);
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveSubcategory(sub(), null)), null);
    });
    it("rejeita raiz, já arquivada e pai arquivado (inconsistência)", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveSubcategory(cat(), null)), "INVALID_HIERARCHY_LEVEL");
        assert.equal(codeOf(() => CategoryPolicy.validateCanArchiveSubcategory(sub(archived), cat())), "ALREADY_ARCHIVED");
        assert.equal(
            codeOf(() => CategoryPolicy.validateCanArchiveSubcategory(sub(), cat(archived))),
            "DATA_INCONSISTENCY"
        );
    });
});

describe("CategoryPolicy.validateCanRestoreCategory (regra 3)", () => {
    it("permite restaurar raiz arquivada", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreCategory(cat(archived))), null);
    });
    it("rejeita subcategoria e categoria ativa", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreCategory(sub(archived))), "INVALID_HIERARCHY_LEVEL");
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreCategory(cat())), "NOT_ARCHIVED");
    });
});

describe("CategoryPolicy.validateCanRestoreSubcategory (regra 4)", () => {
    it("permite restaurar com pai raiz ativo", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreSubcategory(sub(archived), cat())), null);
    });
    it("rejeita raiz, subcategoria ativa, pai ausente ou arquivado", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreSubcategory(cat(archived), null)), "INVALID_HIERARCHY_LEVEL");
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreSubcategory(sub(), cat())), "NOT_ARCHIVED");
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreSubcategory(sub(archived), null)), "PARENT_ARCHIVED");
        assert.equal(codeOf(() => CategoryPolicy.validateCanRestoreSubcategory(sub(archived), cat(archived))), "PARENT_ARCHIVED");
    });
    it("rejeita pai que seja subcategoria", () => {
        assert.equal(
            codeOf(() => CategoryPolicy.validateCanRestoreSubcategory(sub(archived), cat({ parentId: 9 }))),
            "INVALID_HIERARCHY_LEVEL"
        );
    });
});

describe("CategoryPolicy.validateCanCreateCategory (regra 6)", () => {
    it("permite criar categoria raiz e subcategoria sob pai raiz ativo", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "Lazer" })), null);
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "Cinema", parentId: 1 }, cat())), null);
    });
    it("rejeita nome vazio ou só espaços", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "" })), "EMPTY_NAME");
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "   " })), "EMPTY_NAME");
    });
    it("rejeita pai inexistente, pai que é subcategoria e pai arquivado", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "X", parentId: 1 }, null)), "PARENT_NOT_FOUND");
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "X", parentId: 11 }, sub())), "INVALID_HIERARCHY_LEVEL");
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "X", parentId: 1 }, cat(archived))), "PARENT_ARCHIVED");
    });
    it("ignora o pai quando parentId é nulo", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanCreateCategory({ name: "X", parentId: null }, sub())), null);
    });
});

describe("CategoryPolicy.validateCanUpdateCategory", () => {
    it("permite editar categoria ativa com nome válido", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanUpdateCategory(cat(), { name: "Novo" })), null);
    });
    it("rejeita categoria arquivada e nome em branco", () => {
        assert.equal(codeOf(() => CategoryPolicy.validateCanUpdateCategory(cat(archived), { name: "Novo" })), "ALREADY_ARCHIVED");
        assert.equal(codeOf(() => CategoryPolicy.validateCanUpdateCategory(cat(), { name: "  " })), "EMPTY_NAME");
    });
});
