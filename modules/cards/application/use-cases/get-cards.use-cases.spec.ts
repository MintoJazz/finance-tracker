import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { ICardQueries } from "../interfaces/card-queries.interface";
import { GetCardByIdUseCase } from "./get-card-by-id.use-case";
import { GetCardProfileUseCase } from "./get-card-profile.use-case";
import { GetContextCardsUseCase } from "./get-context-cards.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const page = { data: [], total: 0, pageIndex: 0, pageSize: 10, pageCount: 0 };
const edit = { id: 7, name: "Nubank", limit: 300000, closingDay: 5, dueDay: 12 };
const profile = { id: 7, name: "Nubank" };

interface Options {
    canView?: boolean;
    accessError?: string;
    accessWithoutData?: boolean;
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
        listCardsByContextId: async (...a: unknown[]) => (guard("list", a), page),
        findCardById: async (...a: unknown[]) => (guard("find", a), "card" in options ? options.card : edit),
        findCardProfileById: async (...a: unknown[]) =>
            (guard("profile", a), "profile" in options ? options.profile : profile),
    } as unknown as ICardQueries;

    const access = {
        execute: async () => {
            if (options.accessError) return failure(options.accessError);
            if (options.accessWithoutData) return { success: true, data: undefined } as never;
            return success({ canViewBalances: options.canView ?? true, canManageBalances: false });
        },
    } as ISpaceAccessProvider;

    return { queries, access, args };
}

const useCases = {
    GetContextCardsUseCase: (o?: Options) => {
        const { queries, access, args } = setup(o);
        return {
            args,
            run: () =>
                new GetContextCardsUseCase(queries, access).execute({
                    session,
                    pageRequest: { page: 2, pageSize: 5 },
                    filter: { q: "nu" } as never,
                }),
        };
    },
    GetCardByIdUseCase: (o?: Options) => {
        const { queries, access, args } = setup(o);
        return { args, run: () => new GetCardByIdUseCase(queries, access).execute({ session, cardId: 7 }) };
    },
    GetCardProfileUseCase: (o?: Options) => {
        const { queries, access, args } = setup(o);
        return { args, run: () => new GetCardProfileUseCase(queries, access).execute({ session, cardId: 7 }) };
    },
};

describe("Use-cases de leitura de cartões", () => {
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

    it("GetContextCardsUseCase lista os cartões do contexto com paginação e filtro", async () => {
        const { run, args } = useCases.GetContextCardsUseCase();
        const result = await run();

        assert.deepEqual(result, { success: true, data: page });
        assert.deepEqual(args.list, [100, { page: 2, pageSize: 5 }, { q: "nu" }]);
    });

    it("GetCardByIdUseCase devolve os dados de edição do cartão", async () => {
        const { run, args } = useCases.GetCardByIdUseCase();
        const result = await run();

        assert.deepEqual(result, { success: true, data: edit });
        assert.deepEqual(args.find, [7, 100]);
    });

    it("GetCardByIdUseCase falha quando o cartão não existe", async () => {
        const result = await useCases.GetCardByIdUseCase({ card: null }).run();
        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
    });

    it("GetCardProfileUseCase devolve o perfil do cartão", async () => {
        const { run, args } = useCases.GetCardProfileUseCase();
        const result = await run();

        assert.deepEqual(result, { success: true, data: profile });
        assert.deepEqual(args.profile, [7, 100]);
    });

    it("GetCardProfileUseCase falha quando o perfil não existe", async () => {
        const result = await useCases.GetCardProfileUseCase({ profile: null }).run();
        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
    });

    it("GetCardProfileUseCase usa mensagem padrão quando o acesso falha sem dados", async () => {
        mock.method(console, "warn", () => {});
        const result = await useCases.GetCardProfileUseCase({ accessWithoutData: true }).run();
        assert.deepEqual(result, { success: false, error: "Falha ao validar acesso ao contexto." });
    });
});
