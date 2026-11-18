import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { CategoryEntity, CategoryItem } from "@/modules/categories/models/category.schema";
import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import type { EditRecurrenceInput } from "@/modules/recurrences/models/schemas/recurrence-edit.schema";
import { success } from "@/types/result.types";
import type {
    IRecurrenceRepository,
    RecurrenceStatusRecord,
} from "../interfaces/recurrence-repository.interface";
import type { IRecurrenceUnitOfWork } from "../interfaces/recurrence-uow.interface";
import { UpdateRecurrenceUseCase } from "./update-recurrence.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const canManage = { canViewBalances: true, canManageBalances: true };
const draft = (name: string) => ({ name, color: "#06B6D4", icon: "Tag" });

const baseData: EditRecurrenceInput = {
    id: 900,
    name: "  Aluguel novo ",
    categoryId: 1,
    newCategory: null,
    subcategoryId: 11,
    newSubcategory: null,
};

const entity = (id: number, parentId: number | null): CategoryEntity => ({
    id,
    name: `cat-${id}`,
    contextId: 100,
    parentId,
    removedAt: null,
    isArchived: false,
});

function setup(options?: {
    entities?: CategoryEntity[];
    existing?: RecurrenceStatusRecord | null;
    access?: ISpaceAccessProvider;
}) {
    const calls: string[] = [];
    const updates: { id: number; contextId: number; name: string; subcategoryId: number }[] = [];
    let nextId = 500;
    const existing =
        options && "existing" in options
            ? options.existing
            : { id: 900, name: "Aluguel", isArchived: false, isActive: true };

    const categoryRepo = {
        create: async (_ctx: number, data: Parameters<ICategoryRepository["create"]>[1]) => {
            calls.push(data.parentId ? "create-subcategory" : "create-category");
            return { id: nextId++, name: data.name } as CategoryItem;
        },
        findByIdAndContextId: async (id: number) => {
            calls.push(`find-${id}`);
            return options?.entities?.find((e) => e.id === id) ?? null;
        },
    } as unknown as ICategoryRepository;

    const recurrenceRepo = {
        findByIdAndContextId: async () => existing ?? null,
        update: async (
            id: number,
            contextId: number,
            data: { name: string; subcategoryId: number }
        ) => {
            calls.push("update-recurrence");
            updates.push({ id, contextId, ...data });
            return { id, name: data.name.trim() };
        },
    } as unknown as IRecurrenceRepository;

    const uow: IRecurrenceUnitOfWork = {
        run: (work) => work({ categoryRepo, recurrenceRepo }),
    };
    const access: ISpaceAccessProvider =
        options?.access ?? { execute: async () => success(canManage) };

    return { useCase: new UpdateRecurrenceUseCase(uow, access), calls, updates };
}

describe("UpdateRecurrenceUseCase", () => {
    it("falha sem permissão canManageBalances", async () => {
        const { useCase, calls } = setup({
            access: {
                execute: async () =>
                    success({ canViewBalances: true, canManageBalances: false }),
            },
        });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a recorrência não existe", async () => {
        const { useCase, calls } = setup({ existing: null });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /não encontrada/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a recorrência está arquivada", async () => {
        const { useCase, calls } = setup({
            existing: { id: 900, name: "x", isArchived: true, isActive: true },
        });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /arquivada/i);
        assert.deepEqual(calls, []);
    });

    it("renomeia e troca para uma subcategoria existente", async () => {
        const { useCase, calls, updates } = setup({ entities: [entity(1, null), entity(11, 1)] });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find-1", "find-11", "update-recurrence"]);
        assert.deepEqual(updates[0], {
            id: 900,
            contextId: 100,
            name: "  Aluguel novo ",
            subcategoryId: 11,
        });
    });

    it("cria categoria → subcategoria → atualiza, nessa ordem, quando ambas são novas", async () => {
        const { useCase, calls, updates } = setup();
        const result = await useCase.execute({
            session,
            data: {
                ...baseData,
                categoryId: null,
                newCategory: draft("Moradia"),
                subcategoryId: null,
                newSubcategory: draft("Aluguel"),
            },
        });
        assert.equal(result.success, true);
        assert.deepEqual(calls, ["create-category", "create-subcategory", "update-recurrence"]);
        assert.equal(updates[0].subcategoryId, 501);
    });

    it("rejeita subcategoria que não pertence à categoria informada", async () => {
        const { useCase, calls } = setup({
            entities: [entity(1, null), entity(2, null), entity(11, 2)],
        });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        assert.ok(!calls.includes("update-recurrence"));
    });
});
