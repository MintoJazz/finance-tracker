import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type {
    CategoryEntity,
    CategoryItem,
} from "@/modules/categories/models/category.schema";
import type { ICategoryRepository } from "@/modules/categories/application/interfaces/category-repository.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import type { CreateRecurrenceFormValues } from "@/modules/recurrences/models/schemas/recurrence-form.schema";
import { failure, success } from "@/types/result.types";
import type {
    CreateRecurrenceRepositoryDTO,
    IRecurrenceRepository,
} from "../interfaces/recurrence-repository.interface";
import type { IRecurrenceUnitOfWork } from "../interfaces/recurrence-uow.interface";
import { CreateRecurrenceUseCase } from "./create-recurrence.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const canManage = { canViewBalances: true, canManageBalances: true };

const draft = (name: string) => ({ name, color: "#06B6D4", icon: "Tag" });

const baseData: CreateRecurrenceFormValues = {
    direction: "DEBIT",
    name: "Aluguel",
    amount: 150000,
    frequency: "MONTHLY",
    startDate: "2026-11-17",
    hasCustomClosingDate: false,
    dueDay: 10,
    closingDay: 5,
    dueMonth: 11,
    closingMonth: 11,
    categoryId: 1,
    newCategory: null,
    subcategoryId: 11,
    newSubcategory: null,
};

const entity = (id: number, parentId: number | null, removedAt: Date | null = null): CategoryEntity => ({
    id,
    name: `cat-${id}`,
    contextId: 100,
    parentId,
    removedAt,
    isArchived: removedAt !== null,
});

function setup(options?: {
    entities?: CategoryEntity[];
    failOnRecurrence?: boolean;
    access?: ISpaceAccessProvider;
}) {
    const calls: string[] = [];
    const createdCategories: { contextId: number; data: Parameters<ICategoryRepository["create"]>[1] }[] = [];
    const recurrences: CreateRecurrenceRepositoryDTO[] = [];
    let nextId = 500;
    let committed = false;

    const categoryRepo = {
        create: async (contextId: number, data: Parameters<ICategoryRepository["create"]>[1]) => {
            calls.push(data.parentId ? "create-subcategory" : "create-category");
            createdCategories.push({ contextId, data });
            return { id: nextId++, name: data.name } as CategoryItem;
        },
        findByIdAndContextId: async (id: number) => {
            calls.push(`find-${id}`);
            return options?.entities?.find((e) => e.id === id) ?? null;
        },
    } as unknown as ICategoryRepository;

    const recurrenceRepo = {
        create: async (data: CreateRecurrenceRepositoryDTO) => {
            calls.push("create-recurrence");
            if (options?.failOnRecurrence) throw new Error("db down");
            recurrences.push(data);
            return { id: 900, name: data.name };
        },
    } as unknown as IRecurrenceRepository;

    // UoW falsa: só registra se o trabalho foi concluído (commit) ou lançou (rollback)
    const uow: IRecurrenceUnitOfWork = {
        run: async (work) => {
            const result = await work({ categoryRepo, recurrenceRepo });
            committed = true;
            return result;
        },
    };

    const access: ISpaceAccessProvider =
        options?.access ?? { execute: async () => success(canManage) };

    return {
        useCase: new CreateRecurrenceUseCase(uow, access),
        calls,
        createdCategories,
        recurrences,
        isCommitted: () => committed,
    };
}

describe("CreateRecurrenceUseCase", () => {
    it("falha quando o acesso ao espaço falha", async () => {
        const { useCase, calls } = setup({
            access: { execute: async () => failure("Contexto inválido") },
        });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.equal(result.error, "Contexto inválido");
        assert.deepEqual(calls, []);
    });

    it("falha sem permissão canManageBalances", async () => {
        const { useCase, calls } = setup({
            access: { execute: async () => success({ canViewBalances: true, canManageBalances: false }) },
        });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("cria a recorrência com categoria e subcategoria existentes", async () => {
        const { useCase, calls, recurrences } = setup({ entities: [entity(1, null), entity(11, 1)] });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find-1", "find-11", "create-recurrence"]);
        assert.equal(recurrences[0].subcategoryId, 11);
        assert.equal(recurrences[0].contextId, 100);
        assert.equal(recurrences[0].amount, 150000);
    });

    it("cria categoria → subcategoria → recorrência, nessa ordem, quando ambas são novas", async () => {
        const { useCase, calls, createdCategories, recurrences } = setup();
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
        assert.deepEqual(calls, ["create-category", "create-subcategory", "create-recurrence"]);
        // categoria raiz criada primeiro (id 500) e a subcategoria aponta para ela
        assert.equal(createdCategories[0].data.parentId, null);
        assert.equal(createdCategories[1].data.parentId, 500);
        assert.equal(recurrences[0].subcategoryId, 501);
        assert.equal(createdCategories[0].contextId, 100);
    });

    it("cria só a subcategoria quando a categoria já existe", async () => {
        const { useCase, calls, createdCategories, recurrences } = setup({ entities: [entity(1, null)] });
        const result = await useCase.execute({
            session,
            data: { ...baseData, subcategoryId: null, newSubcategory: draft("Condomínio") },
        });
        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find-1", "create-subcategory", "create-recurrence"]);
        assert.equal(createdCategories[0].data.parentId, 1);
        assert.equal(recurrences[0].subcategoryId, 500);
    });

    it("rejeita subcategoria que não pertence à categoria informada", async () => {
        const { useCase, recurrences } = setup({ entities: [entity(1, null), entity(11, 2)] });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /não pertence/i);
        assert.equal(recurrences.length, 0);
    });

    it("rejeita categoria ou subcategoria arquivada e inexistente", async () => {
        const archived = setup({ entities: [entity(1, null, new Date()), entity(11, 1)] });
        const r1 = await archived.useCase.execute({ session, data: baseData });
        assert.equal(r1.success, false);
        if (!r1.success) assert.match(r1.error, /arquivada/i);

        const missing = setup({ entities: [entity(1, null)] });
        const r2 = await missing.useCase.execute({ session, data: baseData });
        assert.equal(r2.success, false);
        if (!r2.success) assert.match(r2.error, /não encontrada/i);
    });

    it("exige subcategoria", async () => {
        const { useCase } = setup({ entities: [entity(1, null)] });
        const result = await useCase.execute({
            session,
            data: { ...baseData, subcategoryId: null, newSubcategory: null },
        });
        assert.equal(result.success, false);
        if (!result.success) assert.match(result.error, /subcategoria/i);
    });

    it("converte erro de domínio de categorias em mensagem", async () => {
        const result = await new CreateRecurrenceUseCase(
            {
                run: async () => {
                    throw new CategoryDomainError("Nome inválido", "EMPTY_NAME");
                },
            },
            { execute: async () => success(canManage) }
        ).execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) assert.equal(result.error, "Nome inválido");
    });

    it("erro no passo 3 devolve falha genérica e não confirma a UoW", async () => {
        const { useCase, isCommitted } = setup({
            entities: [entity(1, null), entity(11, 1)],
            failOnRecurrence: true,
        });
        const result = await useCase.execute({ session, data: baseData });
        assert.equal(result.success, false);
        if (!result.success) {
            assert.match(result.error, /erro interno/i);
            assert.doesNotMatch(result.error, /db down/);
        }
        assert.equal(isCommitted(), false);
    });
});
