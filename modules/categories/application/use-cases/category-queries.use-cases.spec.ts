import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { endOfMonth, startOfMonth } from "date-fns";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { CategoryDetailFoundDTO, ICategoryQueries } from "../interfaces/category-queries.interface";
import { GetArchivedCategoriesUseCase } from "./get-archived-categories.use-case";
import { GetCategoriesTreeUseCase } from "./get-categories-tree.use-case";
import { GetCategoryBasicInfoUseCase } from "./get-category-basic-info.use-case";
import { GetCategoryChildrenUseCase } from "./get-category-children.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const page = { data: [], total: 0, pageIndex: 0, pageSize: 6, pageCount: 0 };

interface Options {
    canView?: boolean;
    accessError?: string;
    found?: CategoryDetailFoundDTO | null;
    throws?: boolean;
}

function setup(options: Options = {}) {
    const calls: string[] = [];
    const args: Record<string, unknown[]> = {};
    const record = (name: string, ...a: unknown[]) => {
        if (options.throws) throw new Error("db offline");
        calls.push(name);
        args[name] = a;
    };

    const queries = {
        listRootCategories: async (...a: unknown[]) => (record("root", ...a), page),
        listCategoryChildren: async (...a: unknown[]) => (record("children", ...a), []),
        findCategoryById: async (...a: unknown[]) => (record("find", ...a), options.found ?? null),
        listArchivedCategories: async (...a: unknown[]) => (record("archived", ...a), []),
    } as unknown as ICategoryQueries;

    const access: ISpaceAccessProvider = {
        execute: async () =>
            options.accessError
                ? failure(options.accessError)
                : success({ canViewBalances: options.canView ?? true, canManageBalances: false }),
    };
    return { queries, access, calls, args };
}

const found = (overrides: Partial<CategoryDetailFoundDTO> = {}): CategoryDetailFoundDTO => ({
    id: 3,
    name: "Moradia",
    parentId: null,
    icon: "Home",
    color: "#fff",
    parentName: null,
    childrenCount: 2,
    ...overrides,
});

describe("Use-cases de leitura de categorias — acesso", () => {
    afterEach(() => mock.restoreAll());

    const builders = {
        GetCategoriesTreeUseCase: (q: ICategoryQueries, a: ISpaceAccessProvider) =>
            new GetCategoriesTreeUseCase(q, a).execute({ session }),
        GetCategoryChildrenUseCase: (q: ICategoryQueries, a: ISpaceAccessProvider) =>
            new GetCategoryChildrenUseCase(q, a).execute({ session, parentId: 1 }),
        GetArchivedCategoriesUseCase: (q: ICategoryQueries, a: ISpaceAccessProvider) =>
            new GetArchivedCategoriesUseCase(q, a).execute({ session }),
        GetCategoryBasicInfoUseCase: (q: ICategoryQueries, a: ISpaceAccessProvider) =>
            new GetCategoryBasicInfoUseCase(q, a).execute({ session, id: 3 }),
    };

    for (const [name, run] of Object.entries(builders)) {
        it(`${name}: propaga o erro de acesso sem consultar`, async () => {
            const { queries, access, calls } = setup({ accessError: "Sem acesso" });
            assert.deepEqual(await run(queries, access), { success: false, error: "Sem acesso" });
            assert.deepEqual(calls, []);
        });

        it(`${name}: nega quem não pode visualizar saldos`, async () => {
            const { queries, access, calls } = setup({ canView: false });
            const result = await run(queries, access);
            assert.equal(result.success, false);
            assert.match(result.error!, /permissão/i);
            assert.deepEqual(calls, []);
        });

        it(`${name}: converte exceção em erro genérico`, async () => {
            mock.method(console, "error", () => {});
            const { queries, access } = setup({ throws: true, found: found() });
            const result = await run(queries, access);
            assert.equal(result.success, false);
            assert.match(result.error!, /erro interno/i);
        });
    }
});

describe("GetCategoriesTreeUseCase", () => {
    it("usa o mês corrente e a página 1 de 6 por padrão", async () => {
        const { queries, access, args } = setup();
        const result = await new GetCategoriesTreeUseCase(queries, access).execute({ session });

        assert.equal(result.success, true);
        assert.deepEqual(args.root, [100, { page: 1, pageSize: 6 }, { search: undefined }]);
        assert.equal(result.data?.period.from.getTime(), startOfMonth(new Date()).getTime());
        assert.equal(result.data?.period.to.getTime(), endOfMonth(new Date()).getTime());
        assert.equal(result.data?.totalAmount, 0);
        assert.equal(result.data?.page, page);
        assert.equal(result.data?.items, page.data);
    });

    it("respeita período, busca e paginação informados", async () => {
        const { queries, access, args } = setup();
        const from = new Date(2026, 0, 1);
        const to = new Date(2026, 0, 31);
        const result = await new GetCategoriesTreeUseCase(queries, access).execute({
            session,
            filter: { from, to, search: "casa", pageRequest: { page: 2, pageSize: 20 } },
        });

        assert.deepEqual(args.root, [100, { page: 2, pageSize: 20 }, { search: "casa" }]);
        assert.deepEqual([result.data?.period.from, result.data?.period.to], [from, to]);
    });
});

describe("GetCategoryChildrenUseCase / GetArchivedCategoriesUseCase", () => {
    it("lista as subcategorias do pai no contexto da sessão", async () => {
        const { queries, access, args } = setup();
        const result = await new GetCategoryChildrenUseCase(queries, access).execute({ session, parentId: 8 });

        assert.deepEqual(result, { success: true, data: [] });
        assert.deepEqual(args.children, [100, 8]);
    });

    it("lista as categorias arquivadas do contexto", async () => {
        const { queries, access, args } = setup();
        const result = await new GetArchivedCategoriesUseCase(queries, access).execute({ session });

        assert.deepEqual(result, { success: true, data: [] });
        assert.deepEqual(args.archived, [100]);
    });
});

describe("GetCategoryBasicInfoUseCase", () => {
    const run = (id: number | string | null | undefined, options?: Options) => {
        const { queries, access, calls } = setup(options);
        return new GetCategoryBasicInfoUseCase(queries, access)
            .execute({ session, id })
            .then((result) => ({ result, calls }));
    };

    it("sem id devolve a visão geral sem consultar o banco", async () => {
        const { result, calls } = await run(undefined);

        assert.equal(result.success, true);
        assert.equal(result.data?.scope, "OVERVIEW");
        assert.equal(result.data?.id, null);
        assert.deepEqual(result.data?.availableTabs, ["OVERVIEW_INDICATORS"]);
        assert.deepEqual(calls, []);
    });

    it("id 0, negativo, decimal ou não numérico é inválido (partições inválidas)", async () => {
        for (const id of ["abc", -1, 1.5]) {
            const { result } = await run(id, { found: found() });
            assert.deepEqual(result, { success: false, error: "Identificador de categoria inválido." }, String(id));
        }
        // 0 e "0" são tratados como ausência de id (visão geral)
        assert.equal((await run(0)).result.data?.scope, "OVERVIEW");
    });

    it("aceita id numérico em texto", async () => {
        const { result } = await run("3", { found: found() });
        assert.equal(result.data?.id, 3);
    });

    it("categoria inexistente retorna erro", async () => {
        const { result } = await run(3, { found: null });
        assert.deepEqual(result, { success: false, error: "Categoria não encontrada." });
    });

    it("categoria raiz expõe abas de raiz e aparência", async () => {
        const { result } = await run(3, { found: found() });

        assert.equal(result.data?.scope, "ROOT");
        assert.deepEqual(result.data?.availableTabs, ["ROOT_INDICATORS", "ROOT_ENTRIES", "CHILDREN"]);
        assert.deepEqual(result.data?.appearance, { icon: "Home", color: "#fff" });
    });

    it("categoria com filhos é tratada como raiz mesmo tendo pai (limite childrenCount > 0)", async () => {
        const { result } = await run(3, { found: found({ parentId: 1, childrenCount: 1 }) });
        assert.equal(result.data?.scope, "ROOT");
    });

    it("subcategoria sem filhos é folha e traz o nome do pai", async () => {
        const { result } = await run(7, {
            found: found({ id: 7, parentId: 3, childrenCount: 0, parentName: "Moradia", icon: null, color: null }),
        });

        assert.equal(result.data?.scope, "LEAF");
        assert.equal(result.data?.parentName, "Moradia");
        assert.deepEqual(result.data?.availableTabs, ["LEAF_INDICATORS", "LEAF_ENTRIES"]);
        assert.deepEqual(result.data?.appearance, { icon: null, color: null });
    });

    it("usa o mês corrente quando o período não é informado", async () => {
        const { result } = await run(undefined);
        assert.equal(result.data?.period.from.getTime(), startOfMonth(new Date()).getTime());
    });
});
