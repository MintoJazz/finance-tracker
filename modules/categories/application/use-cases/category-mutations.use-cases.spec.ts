import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success, type Result } from "@/types/result.types";
import type { ICategoryRepository } from "../interfaces/category-repository.interface";
import { CategoryDomainError, ParentCategoryArchivedError } from "../policies/category.policy";
import { ArchiveCategoryUseCase } from "./archive-category.use-case";
import { ArchiveSubcategoryUseCase } from "./archive-subcategory.use-case";
import { CreateCategoryUseCase } from "./create-category.use-case";
import { RestoreCategoryUseCase } from "./restore-category.use-case";
import { RestoreSubcategoryUseCase } from "./restore-subcategory.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };

type Repo = Pick<
    ICategoryRepository,
    "create" | "archiveCategory" | "archiveSubcategory" | "restoreCategory" | "restoreSubcategory"
>;

interface Case {
    name: string;
    method: keyof Repo;
    permissionMessage: RegExp;
    errorMessage: RegExp;
    build: (repo: ICategoryRepository, access: ISpaceAccessProvider) => {
        execute: (args: { session: SessionPayload; data: never }) => Promise<Result<unknown>>;
    };
    data: unknown;
    expectedArgs: unknown[];
}

const cases: Case[] = [
    {
        name: "CreateCategoryUseCase",
        method: "create",
        permissionMessage: /criar categorias/i,
        errorMessage: /criar a categoria/i,
        build: (r, a) => new CreateCategoryUseCase(r, a) as never,
        data: { name: "Lazer", parentId: null },
        expectedArgs: [100, { name: "Lazer", parentId: null }],
    },
    {
        name: "ArchiveCategoryUseCase",
        method: "archiveCategory",
        permissionMessage: /gerenciar as categorias/i,
        errorMessage: /arquivar a categoria/i,
        build: (r, a) => new ArchiveCategoryUseCase(r, a) as never,
        data: { id: 4 },
        expectedArgs: [4, 100],
    },
    {
        name: "ArchiveSubcategoryUseCase",
        method: "archiveSubcategory",
        permissionMessage: /gerenciar as categorias/i,
        errorMessage: /arquivar a subcategoria/i,
        build: (r, a) => new ArchiveSubcategoryUseCase(r, a) as never,
        data: { id: 5 },
        expectedArgs: [5, 100],
    },
    {
        name: "RestoreCategoryUseCase",
        method: "restoreCategory",
        permissionMessage: /gerenciar as categorias/i,
        errorMessage: /restaurar a categoria/i,
        build: (r, a) => new RestoreCategoryUseCase(r, a) as never,
        data: { id: 4 },
        expectedArgs: [4, 100],
    },
    {
        name: "RestoreSubcategoryUseCase",
        method: "restoreSubcategory",
        permissionMessage: /gerenciar as categorias/i,
        errorMessage: /restaurar a subcategoria/i,
        build: (r, a) => new RestoreSubcategoryUseCase(r, a) as never,
        data: { id: 5 },
        expectedArgs: [5, 100],
    },
];

function setup(method: keyof Repo, options: { canManage?: boolean; accessError?: string; throws?: Error } = {}) {
    const received: unknown[][] = [];
    const repo = {
        [method]: async (...args: unknown[]) => {
            received.push(args);
            if (options.throws) throw options.throws;
            return { id: 1, name: "ok" };
        },
    } as unknown as ICategoryRepository;
    const access: ISpaceAccessProvider = {
        execute: async () =>
            options.accessError
                ? failure(options.accessError)
                : success({ canViewBalances: true, canManageBalances: options.canManage ?? true }),
    };
    return { repo, access, received };
}

for (const c of cases) {
    describe(c.name, () => {
        afterEach(() => mock.restoreAll());

        const run = (options?: Parameters<typeof setup>[1]) => {
            const { repo, access, received } = setup(c.method, options);
            const useCase = c.build(repo, access);
            return { received, execute: () => useCase.execute({ session, data: c.data as never }) };
        };

        it("delega ao repositório com o contexto da sessão e devolve o resultado", async () => {
            const { execute, received } = run();
            const result = await execute();

            assert.equal(result.success, true);
            assert.deepEqual(result.data, { id: 1, name: "ok" });
            assert.deepEqual(received, [c.expectedArgs]);
        });

        it("propaga o erro do provider de acesso sem chamar o repositório", async () => {
            const { execute, received } = run({ accessError: "Sem acesso" });
            const result = await execute();

            assert.deepEqual(result, { success: false, error: "Sem acesso" });
            assert.deepEqual(received, []);
        });

        it("nega quem não pode gerenciar saldos", async () => {
            const { execute, received } = run({ canManage: false });
            const result = await execute();

            assert.equal(result.success, false);
            assert.match(result.error!, c.permissionMessage);
            assert.deepEqual(received, []);
        });

        it("converte erro de domínio na mensagem original", async () => {
            const { execute } = run({ throws: new CategoryDomainError("Regra violada", "X") });
            assert.deepEqual(await execute(), { success: false, error: "Regra violada" });
        });

        it("converte subclasses de erro de domínio (ex.: pai arquivado)", async () => {
            const { execute } = run({ throws: new ParentCategoryArchivedError() });
            const result = await execute();
            assert.equal(result.success, false);
            assert.match(result.error!, /restaure a categoria/i);
        });

        it("converte erro inesperado em mensagem genérica", async () => {
            mock.method(console, "error", () => {});
            const { execute } = run({ throws: new Error("db offline") });
            const result = await execute();

            assert.equal(result.success, false);
            assert.match(result.error!, /erro interno/i);
            assert.match(result.error!, c.errorMessage);
        });
    });
}
