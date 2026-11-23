import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ICategoryQueries } from "@/modules/categories/application/interfaces/category-queries.interface";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type {
    IRecurrenceRepository,
    RecurrenceStatusRecord,
} from "../interfaces/recurrence-repository.interface";
import { ArchiveRecurrenceUseCase } from "./archive-recurrence.use-case";
import { GetRecurrenceFormOptionsUseCase } from "./get-recurrence-form-options.use-case";
import { RestoreRecurrenceUseCase } from "./restore-recurrence.use-case";
import { SetRecurrenceActiveUseCase } from "./set-recurrence-active.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const active: RecurrenceStatusRecord = { id: 9, name: "Aluguel", isArchived: false, isActive: true };

interface Options {
    existing?: RecurrenceStatusRecord | null;
    canManage?: boolean;
    canView?: boolean;
    accessError?: string;
    throws?: boolean;
}

function setup(options: Options = {}) {
    const calls: string[] = [];
    const existing = "existing" in options ? options.existing : active;
    const repo = {
        findByIdAndContextId: async (id: number, ctx: number) => {
            if (options.throws) throw new Error("db offline");
            calls.push(`find:${id}:${ctx}`);
            return existing ?? null;
        },
        archive: async (id: number) => (calls.push(`archive:${id}`), { id, name: "Aluguel" }),
        restore: async (id: number) => (calls.push(`restore:${id}`), { id, name: "Aluguel" }),
        setActive: async (id: number, _ctx: number, isActive: boolean) => (
            calls.push(`setActive:${id}:${isActive}`),
            { id, name: "Aluguel", isActive }
        ),
    } as unknown as IRecurrenceRepository;
    const access: ISpaceAccessProvider = {
        execute: async () =>
            options.accessError
                ? failure(options.accessError)
                : success({
                      canViewBalances: options.canView ?? true,
                      canManageBalances: options.canManage ?? true,
                  }),
    };
    return { repo, access, calls };
}

describe("ArchiveRecurrenceUseCase", () => {
    afterEach(() => mock.restoreAll());
    const run = (o?: Options) => {
        const { repo, access, calls } = setup(o);
        return { calls, execute: () => new ArchiveRecurrenceUseCase(repo, access).execute({ session, data: { id: 9 } }) };
    };

    it("arquiva uma recorrência ativa", async () => {
        const { execute, calls } = run();
        const result = await execute();
        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:9:100", "archive:9"]);
    });
    it("propaga erro de acesso e nega sem permissão", async () => {
        assert.deepEqual(await run({ accessError: "Sem acesso" }).execute(), { success: false, error: "Sem acesso" });
        const denied = await run({ canManage: false }).execute();
        assert.equal(denied.success, false);
        assert.match(denied.error!, /permissão/i);
    });
    it("falha quando não existe ou já está arquivada", async () => {
        assert.deepEqual(await run({ existing: null }).execute(), { success: false, error: "Recorrência não encontrada." });
        const { execute, calls } = run({ existing: { ...active, isArchived: true } });
        assert.deepEqual(await execute(), { success: false, error: "Esta recorrência já está arquivada." });
        assert.ok(!calls.some((c) => c.startsWith("archive")));
    });
    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await run({ throws: true }).execute();
        assert.match(result.error!, /erro interno/i);
    });
});

describe("RestoreRecurrenceUseCase", () => {
    afterEach(() => mock.restoreAll());
    const run = (o?: Options) => {
        const { repo, access, calls } = setup(o);
        return { calls, execute: () => new RestoreRecurrenceUseCase(repo, access).execute({ session, data: { id: 9 } }) };
    };

    it("restaura uma recorrência arquivada", async () => {
        const { execute, calls } = run({ existing: { ...active, isArchived: true } });
        const result = await execute();
        assert.equal(result.success, true);
        assert.deepEqual(calls, ["find:9:100", "restore:9"]);
    });
    it("propaga erro de acesso e nega sem permissão", async () => {
        assert.deepEqual(await run({ accessError: "Sem acesso" }).execute(), { success: false, error: "Sem acesso" });
        assert.match((await run({ canManage: false }).execute()).error!, /permissão/i);
    });
    it("falha quando não existe ou não está arquivada", async () => {
        assert.deepEqual(await run({ existing: null }).execute(), { success: false, error: "Recorrência não encontrada." });
        const { execute, calls } = run();
        assert.deepEqual(await execute(), { success: false, error: "Esta recorrência não está arquivada." });
        assert.ok(!calls.some((c) => c.startsWith("restore")));
    });
    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        assert.match((await run({ throws: true }).execute()).error!, /erro interno/i);
    });
});

describe("SetRecurrenceActiveUseCase", () => {
    afterEach(() => mock.restoreAll());
    const run = (isActive: boolean, o?: Options) => {
        const { repo, access, calls } = setup(o);
        return {
            calls,
            execute: () => new SetRecurrenceActiveUseCase(repo, access).execute({ session, data: { id: 9, isActive } }),
        };
    };

    it("desativa uma recorrência ativa e ativa uma desativada", async () => {
        const off = run(false);
        assert.deepEqual((await off.execute()).data, { id: 9, name: "Aluguel", isActive: false });
        assert.deepEqual(off.calls, ["find:9:100", "setActive:9:false"]);

        const on = run(true, { existing: { ...active, isActive: false } });
        assert.deepEqual((await on.execute()).data, { id: 9, name: "Aluguel", isActive: true });
    });
    it("rejeita quando o estado já é o solicitado", async () => {
        assert.deepEqual(await run(true).execute(), { success: false, error: "Esta recorrência já está ativa." });
        assert.deepEqual(await run(false, { existing: { ...active, isActive: false } }).execute(), {
            success: false,
            error: "Esta recorrência já está desativada.",
        });
    });
    it("não altera recorrência arquivada nem inexistente", async () => {
        const archived = run(false, { existing: { ...active, isArchived: true } });
        assert.deepEqual(await archived.execute(), {
            success: false,
            error: "Não é possível alterar uma recorrência arquivada.",
        });
        assert.ok(!archived.calls.some((c) => c.startsWith("setActive")));
        assert.deepEqual(await run(false, { existing: null }).execute(), {
            success: false,
            error: "Recorrência não encontrada.",
        });
    });
    it("propaga erro de acesso, nega sem permissão e converte exceção", async () => {
        mock.method(console, "error", () => {});
        assert.deepEqual(await run(false, { accessError: "Sem acesso" }).execute(), { success: false, error: "Sem acesso" });
        assert.match((await run(false, { canManage: false }).execute()).error!, /permissão/i);
        assert.match((await run(false, { throws: true }).execute()).error!, /erro interno/i);
    });
});

describe("GetRecurrenceFormOptionsUseCase", () => {
    afterEach(() => mock.restoreAll());

    const queries = (throws = false) =>
        ({
            listActiveCategoryOptions: async (ctx: number) => {
                if (throws) throw new Error("db offline");
                return [{ id: 1, name: `cat-${ctx}` }];
            },
            listActiveSubcategoryOptions: async (ctx: number) => [
                { id: 11, parentId: 1, parentName: `cat-${ctx}`, name: "Aluguel" },
            ],
        }) as unknown as ICategoryQueries;
    const access = (o: Options = {}): ISpaceAccessProvider => ({
        execute: async () =>
            o.accessError
                ? failure(o.accessError)
                : success({ canViewBalances: o.canView ?? true, canManageBalances: false }),
    });

    it("devolve categorias e subcategorias ativas do contexto", async () => {
        const result = await new GetRecurrenceFormOptionsUseCase(queries(), access()).execute({ session });
        assert.equal(result.success, true);
        assert.deepEqual(result.data?.categories, [{ id: 1, name: "cat-100" }]);
        assert.equal(result.data?.subcategories[0].parentName, "cat-100");
    });
    it("propaga erro de acesso e nega sem permissão de visualização", async () => {
        assert.deepEqual(
            await new GetRecurrenceFormOptionsUseCase(queries(), access({ accessError: "Sem acesso" })).execute({ session }),
            { success: false, error: "Sem acesso" }
        );
        const denied = await new GetRecurrenceFormOptionsUseCase(queries(), access({ canView: false })).execute({ session });
        assert.match(denied.error!, /permissão/i);
    });
    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await new GetRecurrenceFormOptionsUseCase(queries(true), access()).execute({ session });
        assert.match(result.error!, /erro interno/i);
    });
});
