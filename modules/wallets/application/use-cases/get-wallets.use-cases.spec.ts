import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { IWalletQueries } from "../interfaces/wallet-queries.interface";
import { GetWalletByIdUseCase } from "./get-wallet-by-id.use-case";
import { GetWalletProfileUseCase } from "./get-wallet-profile.use-case";
import { GetContextWalletsUseCase } from "./get-context-wallets.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const page = { data: [], total: 0, pageIndex: 0, pageSize: 10, pageCount: 0 };
const edit = { id: 7, name: "Nubank" };
const profile = { id: 7, name: "Nubank" };

interface Options {
    canView?: boolean;
    accessError?: string;
    card?: typeof edit | null;
    profile?: typeof profile | null;
    throws?: boolean;
}

function setup(options: Options = {}) {
    const args: Record<string, unknown[]> = {};
    const guard = (name: string, a: unknown[]) => {
        if (options.throws) throw new Error("db offline");
        args[name] = a;
    };
    const queries = {
        listWalletsByContextId: async (...a: unknown[]) => (guard("list", a), page),
        findWalletById: async (...a: unknown[]) => (guard("find", a), "card" in options ? options.card : edit),
        findWalletProfileById: async (...a: unknown[]) =>
            (guard("profile", a), "profile" in options ? options.profile : profile),
    } as unknown as IWalletQueries;

    const access = {
        execute: async () => {
            if (options.accessError) return failure(options.accessError);
            return success({ canViewBalances: options.canView ?? true, canManageBalances: false });
        },
    } as ISpaceAccessProvider;

    return { queries, access, args };
}

const useCases = {
    GetContextWalletsUseCase: (o?: Options) => {
        const { queries, access, args } = setup(o);
        return {
            args,
            run: () =>
                new GetContextWalletsUseCase(queries, access).execute({
                    session,
                    pageRequest: { page: 2, pageSize: 5 },
                    filter: { q: "nu" } as never,
                }),
        };
    },
    GetWalletByIdUseCase: (o?: Options) => {
        const { queries, access, args } = setup(o);
        return { args, run: () => new GetWalletByIdUseCase(queries, access).execute({ session, walletId: 7 }) };
    },
    GetWalletProfileUseCase: (o?: Options) => {
        const { queries, access, args } = setup(o);
        return { args, run: () => new GetWalletProfileUseCase(queries, access).execute({ session, walletId: 7 }) };
    },
};

describe("Use-cases de leitura de carteiras", () => {
    afterEach(() => mock.restoreAll());

    for (const [name, make] of Object.entries(useCases)) {
        describe(name, () => {
            it("propaga o erro de acesso sem consultar", async () => {
                mock.method(console, "warn", () => {});
                const { run, args } = make({ accessError: "Sem acesso" });
                assert.deepEqual(await run(), { success: false, error: "Sem acesso" });
                assert.deepEqual(args, {});
            });

            it("nega quem não pode visualizar saldos", async () => {
                mock.method(console, "warn", () => {});
                const { run, args } = make({ canView: false });
                const result = await run();
                assert.equal(result.success, false);
                assert.match(result.error!, /permissão/i);
                assert.deepEqual(args, {});
            });

            it("converte exceção em erro genérico", async () => {
                mock.method(console, "error", () => {});
                const result = await make({ throws: true }).run();
                assert.equal(result.success, false);
                assert.match(result.error!, /erro interno/i);
            });
        });
    }

    it("GetContextWalletsUseCase lista os carteiras do contexto com paginação e filtro", async () => {
        const { run, args } = useCases.GetContextWalletsUseCase();
        const result = await run();

        assert.deepEqual(result, { success: true, data: page });
        assert.deepEqual(args.list, [100, { page: 2, pageSize: 5 }, { q: "nu" }]);
    });

    it("GetWalletByIdUseCase devolve os dados de edição do carteira", async () => {
        const { run, args } = useCases.GetWalletByIdUseCase();
        const result = await run();

        assert.deepEqual(result, { success: true, data: edit });
        assert.deepEqual(args.find, [7, 100]);
    });

    it("GetWalletByIdUseCase falha quando o carteira não existe", async () => {
        const result = await useCases.GetWalletByIdUseCase({ card: null }).run();
        assert.deepEqual(result, { success: false, error: "Carteira não encontrada." });
    });

    it("GetWalletProfileUseCase devolve o perfil do carteira", async () => {
        const { run, args } = useCases.GetWalletProfileUseCase();
        const result = await run();

        assert.deepEqual(result, { success: true, data: profile });
        assert.deepEqual(args.profile, [7, 100]);
    });

    it("GetWalletProfileUseCase falha quando o perfil não existe", async () => {
        const result = await useCases.GetWalletProfileUseCase({ profile: null }).run();
        assert.deepEqual(result, { success: false, error: "Carteira não encontrada." });
    });
});
