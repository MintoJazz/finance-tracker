import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import type { ContextMemberType, Role, Status } from "@/modules/space/models/context-member.schema";
import type { IContextMemberRepository } from "../interfaces/context-member-repository.interface";
import type { IFinancialContextRepository } from "../interfaces/financial-context-repository.interface";
import { SpacePolicy } from "../policies/space.policy";
import { GetSpaceAccessUseCase } from "./get-acess.use-case";
import { GetUserContextsUseCase } from "./get-user-contexts.use-case";
import { SwitchContextUseCase } from "./switch-context.use-case";

const member = (role: Role, status: Status = "ACTIVE"): ContextMemberType => ({
    contextId: 100,
    partyId: 5,
    role,
    status,
    invitedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
});

const memberRepo = (found: ContextMemberType | null, throws = false) => {
    const calls: [number, number][] = [];
    const repo: IContextMemberRepository = {
        findByContextAndParty: async (contextId, partyId) => {
            if (throws) throw new Error("db offline");
            calls.push([contextId, partyId]);
            return found;
        },
    };
    return { repo, calls };
};

describe("SpacePolicy (permissões por papel)", () => {
    const expectations: [Role, boolean, boolean][] = [
        ["OWNER", true, true],
        ["ADMIN", true, true],
        ["MEMBER", true, false],
        ["DEPENDENT", false, false],
    ];

    for (const [role, canView, canManage] of expectations) {
        it(`${role}: visualizar=${canView}, gerenciar=${canManage}`, () => {
            assert.equal(SpacePolicy.canViewBalances(member(role)), canView);
            assert.equal(SpacePolicy.canManageBalances(member(role)), canManage);
        });
    }
});

describe("GetSpaceAccessUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("traduz o papel do membro em permissões", async () => {
        const { repo, calls } = memberRepo(member("MEMBER"));
        const result = await new GetSpaceAccessUseCase(repo).execute({ contextId: 100, partyId: 5 });

        assert.deepEqual(result, { success: true, data: { canViewBalances: true, canManageBalances: false } });
        assert.deepEqual(calls, [[100, 5]]);
    });

    it("OWNER pode ver e gerenciar; DEPENDENT não pode nada", async () => {
        const owner = await new GetSpaceAccessUseCase(memberRepo(member("OWNER")).repo).execute({ contextId: 1, partyId: 1 });
        assert.deepEqual(owner.data, { canViewBalances: true, canManageBalances: true });

        const dependent = await new GetSpaceAccessUseCase(memberRepo(member("DEPENDENT")).repo).execute({ contextId: 1, partyId: 1 });
        assert.deepEqual(dependent.data, { canViewBalances: false, canManageBalances: false });
    });

    // Defeito conhecido (ver relatório): o caso de uso só olha o papel e ignora `status`,
    // então um membro removido ou pendente com papel OWNER mantém acesso total.
    it(
        "membro removido ou pendente não deveria ter acesso, mesmo com papel OWNER",
        { todo: "GetSpaceAccessUseCase não verifica ContextMember.status" },
        async () => {
            for (const status of ["REMOVED", "PENDING"] as const) {
                const result = await new GetSpaceAccessUseCase(memberRepo(member("OWNER", status)).repo).execute({
                    contextId: 100,
                    partyId: 5,
                });
                assert.equal(result.success, false, status);
            }
        }
    );

    it("nega quando não há vínculo com o contexto", async () => {
        mock.method(console, "warn", () => {});
        const result = await new GetSpaceAccessUseCase(memberRepo(null).repo).execute({ contextId: 100, partyId: 5 });
        assert.deepEqual(result, { success: false, error: "Sem permissão para acessar este contexto!" });
    });

    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await new GetSpaceAccessUseCase(memberRepo(null, true).repo).execute({ contextId: 100, partyId: 5 });
        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});

describe("SwitchContextUseCase", () => {
    afterEach(() => mock.restoreAll());
    const run = (repo: IContextMemberRepository, partyId = 5, targetContextId = 200) =>
        new SwitchContextUseCase(repo).execute({ partyId, targetContextId });

    it("permite trocar para um contexto em que o vínculo está ativo", async () => {
        const { repo, calls } = memberRepo(member("MEMBER", "ACTIVE"));
        assert.deepEqual(await run(repo), { success: true, data: { contextId: 200 } });
        assert.deepEqual(calls, [[200, 5]]);
    });

    it("rejeita ids inválidos (0, negativo) sem consultar o banco", async () => {
        for (const [partyId, ctx] of [[0, 200], [-1, 200], [5, 0], [5, -3]] as const) {
            const { repo, calls } = memberRepo(member("OWNER"));
            assert.deepEqual(await run(repo, partyId, ctx), { success: false, error: "Parâmetros de contexto inválidos." });
            assert.deepEqual(calls, []);
        }
    });

    it("nega vínculo pendente, removido ou inexistente", async () => {
        mock.method(console, "warn", () => {});
        for (const found of [member("OWNER", "PENDING"), member("OWNER", "REMOVED"), null]) {
            const result = await run(memberRepo(found).repo);
            assert.equal(result.success, false);
            assert.match(result.error!, /não tem permissão/i);
        }
    });

    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await run(memberRepo(null, true).repo);
        assert.equal(result.success, false);
        assert.match(result.error!, /alternar de contexto/i);
    });
});

describe("GetUserContextsUseCase", () => {
    afterEach(() => mock.restoreAll());
    const repoOf = (value: unknown, throws = false) => {
        const calls: number[] = [];
        const repo = {
            findActiveContextsByParty: async (partyId: number) => {
                if (throws) throw new Error("db offline");
                calls.push(partyId);
                return value;
            },
        } as unknown as IFinancialContextRepository;
        return { repo, calls };
    };

    it("lista os contextos ativos do usuário", async () => {
        const contexts = [{ id: 1, name: "Casa" }];
        const { repo, calls } = repoOf(contexts);
        const result = await new GetUserContextsUseCase(repo).execute({ partyId: 5 });

        assert.deepEqual(result, { success: true, data: contexts });
        assert.deepEqual(calls, [5]);
    });

    it("trata retorno nulo como lista vazia", async () => {
        const result = await new GetUserContextsUseCase(repoOf(null).repo).execute({ partyId: 5 });
        assert.deepEqual(result, { success: true, data: [] });
    });

    it("rejeita partyId 0 ou negativo sem consultar", async () => {
        for (const partyId of [0, -1]) {
            const { repo, calls } = repoOf([]);
            assert.deepEqual(await new GetUserContextsUseCase(repo).execute({ partyId }), {
                success: false,
                error: "Identificador de usuário inválido.",
            });
            assert.deepEqual(calls, []);
        }
    });

    it("converte exceção em erro genérico", async () => {
        mock.method(console, "error", () => {});
        const result = await new GetUserContextsUseCase(repoOf(null, true).repo).execute({ partyId: 5 });
        assert.equal(result.success, false);
        assert.match(result.error!, /carregar os contextos/i);
    });
});
