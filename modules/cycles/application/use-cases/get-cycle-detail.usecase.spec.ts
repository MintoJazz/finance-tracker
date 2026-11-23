import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { GetCycleDetailUseCase } from "./get-cycle-detail.usecase";
import {
    agreementContext,
    aggregatedRow,
    rule,
    session,
    setupCycleQueries,
    silenceConsole,
    utcDay,
} from "./cycle-use-cases.test-support";

/** 15/mai/2026: o ciclo ativo (fechamento dia 3) é 04/05 a 03/06. */
const today = new Date(2026, 4, 15);
const range = { from: "2026-05-04", to: "2026-06-03" };

const run = (
    options?: Parameters<typeof setupCycleQueries>[0],
    input: { range?: { from: string; to: string } } = { range }
) => {
    const ctx = setupCycleQueries(options);
    const useCase = new GetCycleDetailUseCase(ctx.queries, ctx.access);
    return { ...ctx, execute: () => useCase.execute({ session, balanceId: 9, today, ...input }) };
};

describe("GetCycleDetailUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("monta o detalhe do ciclo solicitado com valores, regra e navegação", async () => {
        const { execute, calls, aggregateParams } = run();
        const result = await execute();

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["agreement:9:100", "rules", "aggregate"]);

        const detail = result.data!;
        assert.deepEqual(detail.balance, {
            id: 9,
            name: "Nubank",
            balanceType: "CREDIT",
            frequency: "MONTHLY",
            interval: 1,
        });
        assert.deepEqual(detail.cycle.range, range);
        assert.deepEqual(detail.cycle.amounts, {
            total: 12000,
            recognized: 12000,
            paid: 2000,
            transferred: 0,
            remaining: 10000,
        });
        assert.equal(detail.cycle.dueDate, "2026-03-10");
        assert.equal(detail.cycle.closingDate, "2026-03-03");
        assert.equal(detail.cycle.settlementDate, null);
        assert.equal(detail.cycle.status, "PARTIAL");
        assert.equal(detail.cycle.isBridgeCycle, false);
        assert.deepEqual(detail.rule, {
            id: 1,
            effectiveFrom: "2026-01-01",
            dueDay: 10,
            dueMonth: null,
            closingDay: 3,
            closingMonth: null,
        });
        assert.deepEqual(detail.navigation, {
            prev: { from: "2026-04-04", to: "2026-05-03" },
            next: { from: "2026-06-04", to: "2026-07-03" },
        });

        assert.equal(aggregateParams[0].windows.length, 1);
        assert.equal(aggregateParams[0].includeProjected, true);
        assert.equal(aggregateParams[0].isOnce, false);
        assert.equal(aggregateParams[0].balanceType, "CREDIT");
    });

    it("sem intervalo informado resolve o ciclo ativo de hoje", async () => {
        const { execute, calls } = run(undefined, {});
        const result = await execute();

        assert.equal(result.success, true);
        assert.deepEqual(result.data?.cycle.range, range);
        assert.deepEqual(calls, ["agreement:9:100", "rules", "rules", "aggregate"]);
    });

    it("sem regras para resolver o ciclo ativo retorna erro", async () => {
        const { execute } = run({ rules: [] }, {});
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /ciclo ativo/i);
    });

    it("formata datas civis da agregação e a data de liquidação", async () => {
        const { execute } = run({
            rows: [aggregatedRow({ settlementDate: utcDay(2026, 3, 9), closingDate: null, hasReceipt: true })],
        });
        const result = await execute();

        assert.equal(result.data?.cycle.settlementDate, "2026-03-09");
        assert.equal(result.data?.cycle.closingDate, null);
        assert.equal(result.data?.cycle.hasReceipt, true);
    });

    it("marca acordos ONCE ao agregar", async () => {
        const { execute, aggregateParams } = run({
            agreement: agreementContext({ frequency: "ONCE", startsAt: new Date(2026, 4, 10) }),
            rules: [rule({ closingDay: null, effectiveFrom: new Date(2026, 4, 10) })],
        }, { range: { from: "2026-05-10", to: "2026-05-10" } });
        const result = await execute();

        assert.equal(result.success, true);
        assert.equal(aggregateParams[0].isOnce, true);
        assert.deepEqual(result.data?.navigation, { prev: null, next: null });
    });

    it("falha quando o acordo/cartão não existe no contexto", async () => {
        const { execute, calls } = run({ agreement: null });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /não encontrado/i);
        assert.deepEqual(calls, ["agreement:9:100"]);
    });

    it("falha quando não há regras na vizinhança", async () => {
        const { execute } = run({ rules: [] });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /nenhuma regra/i);
    });

    it("rejeita intervalo com início depois do fim", async () => {
        const { execute } = run(undefined, { range: { from: "2026-06-03", to: "2026-05-04" } });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /não pode ser posterior/i);
    });

    it("rejeita intervalo que não é uma vigência canônica", async () => {
        const { execute, calls } = run(undefined, { range: { from: "2026-05-05", to: "2026-06-03" } });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /não corresponde a uma vigência válida/i);
        assert.ok(!calls.includes("aggregate"));
    });

    it("rejeita ciclo fora da vigência do acordo", async () => {
        const { execute } = run({ agreement: agreementContext({ startsAt: new Date(2027, 0, 1) }) });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /fora da vigência/i);
    });

    it("falha quando a agregação não retorna linha", async () => {
        const { execute } = run({ rows: [] });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /agregar/i);
    });

    it("propaga erro de acesso, acesso sem dados e falta de permissão", async () => {
        silenceConsole();
        assert.deepEqual(await run({ accessError: "Sem acesso" }).execute(), {
            success: false,
            error: "Sem acesso",
        });
        assert.deepEqual(await run({ accessWithoutData: true }).execute(), {
            success: false,
            error: "Falha ao validar acesso ao contexto.",
        });
        const denied = await run({ permissions: { canViewBalances: false, canManageBalances: true } }).execute();
        assert.equal(denied.success, false);
        assert.match(denied.error!, /permissão/i);
    });

    it("converte exceção em erro genérico", async () => {
        silenceConsole();
        const result = await run({ queryThrows: true }).execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
