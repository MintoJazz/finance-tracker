import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import type { CategoryEntity } from "@/modules/categories/models/category.schema";
import { resolveSubcategoryId } from "./category-classification.resolver";

const entity = (
  id: number,
  parentId: number | null,
  overrides: Partial<CategoryEntity> = {}
): CategoryEntity =>
  ({
    id,
    parentId,
    contextId: 100,
    name: `cat-${id}`,
    removedAt: null,
    isArchived: false,
    ...overrides,
  }) as CategoryEntity;

function setup(existing: CategoryEntity[] = []) {
  const calls: string[] = [];
  const created: { contextId: number; data: { parentId?: number | null } }[] = [];
  let nextId = 500;

  const repo = {
    findByIdAndContextId: async (id: number) => {
      calls.push(`find-${id}`);
      return existing.find((c) => c.id === id) ?? null;
    },
    create: async (
      contextId: number,
      data: { parentId?: number | null; name: string }
    ) => {
      calls.push(data.parentId == null ? "create-category" : "create-subcategory");
      created.push({ contextId, data });
      return { id: nextId++ };
    },
  } as unknown as ICategoryRepository;

  return { repo, calls, created };
}

const draft = (name: string) => ({ name, color: "#06B6D4", icon: "Tag" });

const rejectsWith = async (promise: Promise<unknown>, pattern: RegExp, code: string) => {
  await assert.rejects(promise, (err: unknown) => {
    assert.ok(err instanceof CategoryDomainError);
    assert.match(err.message, pattern);
    assert.equal(err.code, code);
    return true;
  });
};

describe("resolveSubcategoryId", () => {
  it("categoria e subcategoria existentes: valida e devolve o id da subcategoria", async () => {
    const { repo, calls } = setup([entity(1, null), entity(11, 1)]);
    const id = await resolveSubcategoryId(repo, 100, {
      categoryId: 1,
      subcategoryId: 11,
    });
    assert.equal(id, 11);
    assert.deepEqual(calls, ["find-1", "find-11"]);
  });

  it("ambas novas: cria a categoria e depois a subcategoria filha dela", async () => {
    const { repo, calls, created } = setup();
    const id = await resolveSubcategoryId(repo, 100, {
      newCategory: draft("Moradia"),
      newSubcategory: draft("Aluguel"),
    });
    assert.equal(id, 501);
    assert.deepEqual(calls, ["create-category", "create-subcategory"]);
    assert.equal(created[0].data.parentId, null);
    assert.equal(created[1].data.parentId, 500);
    assert.equal(created[0].contextId, 100);
  });

  it("só a subcategoria nova: cria sob a categoria existente", async () => {
    const { repo, calls, created } = setup([entity(1, null)]);
    const id = await resolveSubcategoryId(repo, 100, {
      categoryId: 1,
      newSubcategory: draft("Aluguel"),
    });
    assert.equal(id, 500);
    assert.deepEqual(calls, ["find-1", "create-subcategory"]);
    assert.equal(created[0].data.parentId, 1);
  });

  it("subcategoria de outra categoria => SUBCATEGORY_PARENT_MISMATCH", async () => {
    const { repo } = setup([entity(1, null), entity(11, 2)]);
    await rejectsWith(
      resolveSubcategoryId(repo, 100, { categoryId: 1, subcategoryId: 11 }),
      /não pertence/i,
      "SUBCATEGORY_PARENT_MISMATCH"
    );
  });

  it("categoria arquivada => CATEGORY_ARCHIVED", async () => {
    const { repo } = setup([entity(1, null, { removedAt: new Date(), isArchived: true })]);
    await rejectsWith(
      resolveSubcategoryId(repo, 100, { categoryId: 1, subcategoryId: 11 }),
      /arquivada/i,
      "CATEGORY_ARCHIVED"
    );
  });

  it("categoria inexistente e categoria que é subcategoria", async () => {
    await rejectsWith(
      resolveSubcategoryId(setup().repo, 100, { categoryId: 1, subcategoryId: 11 }),
      /não encontrada/i,
      "CATEGORY_NOT_FOUND"
    );
    await rejectsWith(
      resolveSubcategoryId(setup([entity(1, 7)]).repo, 100, {
        categoryId: 1,
        subcategoryId: 11,
      }),
      /é uma subcategoria/i,
      "CATEGORY_IS_SUBCATEGORY"
    );
  });

  it("subcategoria inexistente, raiz ou arquivada", async () => {
    await rejectsWith(
      resolveSubcategoryId(setup([entity(1, null)]).repo, 100, {
        categoryId: 1,
        subcategoryId: 11,
      }),
      /não encontrada/i,
      "SUBCATEGORY_NOT_FOUND"
    );
    await rejectsWith(
      resolveSubcategoryId(setup([entity(1, null), entity(11, null)]).repo, 100, {
        categoryId: 1,
        subcategoryId: 11,
      }),
      /categoria raiz/i,
      "SUBCATEGORY_IS_ROOT"
    );
    await rejectsWith(
      resolveSubcategoryId(
        setup([entity(1, null), entity(11, 1, { removedAt: new Date(), isArchived: true })])
          .repo,
        100,
        { categoryId: 1, subcategoryId: 11 }
      ),
      /arquivada/i,
      "SUBCATEGORY_ARCHIVED"
    );
  });

  it("subcategoria nova sem categoria => CATEGORY_REQUIRED", async () => {
    await rejectsWith(
      resolveSubcategoryId(setup().repo, 100, { newSubcategory: draft("Aluguel") }),
      /informe a categoria/i,
      "CATEGORY_REQUIRED"
    );
  });

  it("sem subcategoria => SUBCATEGORY_REQUIRED", async () => {
    await rejectsWith(
      resolveSubcategoryId(setup([entity(1, null)]).repo, 100, { categoryId: 1 }),
      /subcategoria/i,
      "SUBCATEGORY_REQUIRED"
    );
  });
});
