import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { CategoryEntity, CategoryItem } from "@/modules/categories/models/category.schema";
import { failure, success } from "@/types/result.types";
import type { ICategoryRepository } from "../interfaces/category-repository.interface";
import { UpdateCategoryUseCase } from "./update-category.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const data = { id: 1, name: "Moradia nova" };

const entity = (overrides: Partial<CategoryEntity> = {}): CategoryEntity => ({
    id: 1,
    name: "Moradia",
    contextId: 100,
    parentId: null,
    removedAt: null,
    isArchived: false,
    ...overrides,
});

function setup(options: {
    existing?: CategoryEntity | null;
    canManage?: boolean;
    accessError?: string;
    updateThrows?: Error;
} = {}) {
    const calls: string[] = [];
    const existing = "existing" in options ? options.existing : entity();
    const repo = {
        findByIdAndContextId: async (id: number, ctx: number) => {
            calls.push(`find:${id}:${ctx}`);
            return existing ?? null;
        },
        update: async (ctx: number, input: { id: number; name: string }) => {
            if (options.updateThrows) throw options.updateThrows;
            calls.push(`update:${ctx}:${input.id}`);
            return { id: input.id, name: input.name } as CategoryItem;
        },
    } as unknown as ICategoryRepository;
    const access: ISpaceAccessProvider = {
        execute: async () =>
            options.accessError
                ? failure(options.accessError)
                : success({ canViewBalances: true, canManageBalances: options.canManage ?? true }),
    };
    return { useCase: new UpdateCategoryUseCase(repo, access), calls };
}

describe("UpdateCategoryUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("atualiza a categoria ativa do contexto", async () => {
        const { useCase, calls } = setup();
        const result = await useCase.execute({ session, data });

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:1:100", "update:100:1"]);
    });

    it("propaga o erro de acesso", async () => {
        const { useCase, calls } = setup({ accessError: "Sem acesso" });
        const result = await useCase.execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem não pode gerenciar saldos", async () => {
        const { useCase, calls } = setup({ canManage: false });
        const result = await useCase.execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a categoria não existe", async () => {
        const { useCase } = setup({ existing: null });
        const result = await useCase.execute({ session, data });

        assert.deepEqual(result, { success: false, error: "Categoria não encontrada." });
    });

    it("não edita categoria arquivada", async () => {
        const { useCase, calls } = setup({ existing: entity({ isArchived: true }) });
        const result = await useCase.execute({ session, data });

        assert.deepEqual(result, {
            success: false,
            error: "Não é possível editar uma categoria arquivada.",
        });
        assert.ok(!calls.some((c) => c.startsWith("update")));
    });

    it("converte erro de domínio da policy em falha com a mensagem original", async () => {
        const { useCase, calls } = setup();
        const result = await useCase.execute({ session, data: { id: 1, name: "   " } });

        assert.deepEqual(result, { success: false, error: "O nome da categoria é obrigatório." });
        assert.ok(!calls.some((c) => c.startsWith("update")));
    });

    it("converte erro inesperado em mensagem genérica", async () => {
        mock.method(console, "error", () => {});
        const { useCase } = setup({ updateThrows: new Error("db offline") });
        const result = await useCase.execute({ session, data });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
