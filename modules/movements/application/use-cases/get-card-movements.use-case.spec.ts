import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { GetCardMovementsUseCase } from "./get-card-movements.use-case";
import { emptyPage, pageRequest, session, setupMovements, silenceConsole } from "./movements.test-support";

const run = (options?: Parameters<typeof setupMovements>[0]) => {
    const ctx = setupMovements(options);
    const useCase = new GetCardMovementsUseCase(ctx.queries, ctx.access, ctx.lookup);
    return { ...ctx, execute: () => useCase.execute({ session, cardId: 9, pageRequest }) };
};

describe("GetCardMovementsUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("lista os lançamentos do cartão com escopo CARD", async () => {
        const { execute, calls } = run();
        const result = await execute();

        assert.equal(result.success, true);
        assert.deepEqual(result.data, emptyPage);
        assert.deepEqual(calls, ["lookup-card:9:100", "balance-entries:9:CARD"]);
    });

    it("propaga o erro do provider de acesso", async () => {
        silenceConsole();
        const { execute, calls } = run({ accessError: "Sem acesso" });
        const result = await execute();

        assert.deepEqual(result, { success: false, error: "Sem acesso" });
        assert.deepEqual(calls, []);
    });

    it("nega quem não pode visualizar saldos", async () => {
        silenceConsole();
        const { execute, calls } = run({
            permissions: { canViewBalances: false, canManageBalances: false },
        });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("falha quando o cartão não existe no contexto", async () => {
        const { execute } = run({ found: false });
        const result = await execute();

        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
    });

    it("trata a ausência do lookup de cartão como cartão não encontrado", async () => {
        const { execute, calls } = run({ withCardLookup: false });
        const result = await execute();

        assert.deepEqual(result, { success: false, error: "Cartão não encontrado." });
        assert.deepEqual(calls, []);
    });

    it("converte exceção da consulta em erro genérico", async () => {
        silenceConsole();
        const { execute } = run({ queryThrows: true });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
