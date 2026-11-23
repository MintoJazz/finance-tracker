import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { GetWalletMovementsUseCase } from "./get-wallet-movements.use-case";
import { emptyPage, pageRequest, session, setupMovements, silenceConsole } from "./movements.test-support";

const run = (options?: Parameters<typeof setupMovements>[0]) => {
    const ctx = setupMovements(options);
    const useCase = new GetWalletMovementsUseCase(ctx.queries, ctx.access, ctx.lookup);
    return { ...ctx, execute: () => useCase.execute({ session, walletId: 3, pageRequest }) };
};

describe("GetWalletMovementsUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("lista as movimentações da carteira do contexto", async () => {
        const { execute, calls } = run();
        const result = await execute();

        assert.equal(result.success, true);
        assert.deepEqual(result.data, emptyPage);
        assert.deepEqual(calls, ["lookup-wallet:3:100", "wallet-entries:3"]);
    });

    it("propaga o erro do provider de acesso sem consultar nada", async () => {
        silenceConsole();
        const { execute, calls } = run({ accessError: "Sem acesso" });
        const result = await execute();

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("usa mensagem padrão quando o acesso falha sem dados", async () => {
        silenceConsole();
        const { execute } = run({ accessSucceedsWithoutData: true });
        const result = await execute();

        assert.deepEqual(result, { success: false, error: "Falha ao validar acesso ao contexto." });
    });

    it("nega quem não pode visualizar saldos", async () => {
        silenceConsole();
        const { execute, calls } = run({
            permissions: { canViewBalances: false, canManageBalances: true },
        });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando a carteira não existe no contexto", async () => {
        const { execute, calls } = run({ found: false });
        const result = await execute();

        assert.deepEqual(result, { success: false, error: "Carteira não encontrada." });
        assert.ok(!calls.some((c) => c.startsWith("wallet-entries")));
    });

    it("converte exceção da consulta em erro genérico", async () => {
        silenceConsole();
        const { execute } = run({ queryThrows: true });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
