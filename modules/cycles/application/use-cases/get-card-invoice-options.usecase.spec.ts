import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import { GetCardInvoiceOptionsUseCase } from "./get-card-invoice-options.usecase";
import {
    aggregatedRow,
    rule,
    session,
    setupCycleQueries,
    silenceConsole,
} from "./cycle-use-cases.test-support";

const today = new Date(2026, 4, 15);

const run = (
    options?: Parameters<typeof setupCycleQueries>[0],
    input: { offset?: number; statuses?: ("OPEN" | "PAID")[] } = {}
) => {
    const ctx = setupCycleQueries(options);
    const useCase = new GetCardInvoiceOptionsUseCase(ctx.queries, ctx.access);
    return { ...ctx, execute: () => useCase.execute({ session, balanceId: 9, today, ...input }) };
};

describe("GetCardInvoiceOptionsUseCase", () => {
    afterEach(() => mock.restoreAll());

    it("gera as faturas do ano e mapeia as linhas agregadas para opções", async () => {
        const { execute, calls } = run();
        const result = await execute();

        assert.equal(result.success, true);
        assert.deepEqual(calls, ["rules", "aggregate"]);
        assert.equal(result.data?.length, 1);
        assert.deepEqual(result.data?.[0], {
            from: "2026-02-04",
            to: "2026-03-03",
            dueDate: "2026-03-10",
            referenceDate: "2026-02-04",
            label: "Março 2026",
            status: "PARTIAL",
            totalAmount: 12000,
            paidAmount: 2000,
            remainingAmount: 10000,
            isOverdue: false,
            balanceId: 9,
            agreementId: 9,
        });
    });

    it("consulta as regras no ano civil e agrega como CREDIT incluindo projetadas", async () => {
        const { execute, ruleParams, aggregateParams } = run();
        await execute();

        assert.equal(ruleParams[0].agreementId, 9);
        assert.deepEqual(
            [ruleParams[0].from.getFullYear(), ruleParams[0].from.getMonth(), ruleParams[0].to.getMonth()],
            [2026, 0, 11]
        );
        assert.equal(aggregateParams[0].balanceType, "CREDIT");
        assert.equal(aggregateParams[0].includeProjected, true);
        assert.equal(aggregateParams[0].isOnce, false);
        assert.ok(aggregateParams[0].windows.length >= 12);
    });

    it("o offset desloca o horizonte em anos", async () => {
        const { execute, ruleParams } = run(undefined, { offset: 1 });
        await execute();
        assert.equal(ruleParams[0].from.getFullYear(), 2027);
    });

    it("repassa o filtro de status para a agregação", async () => {
        const { execute, aggregateParams } = run(undefined, { statuses: ["OPEN"] });
        await execute();
        assert.deepEqual(aggregateParams[0].statuses, ["OPEN"]);
    });

    it("sem regras de fechamento/vencimento retorna erro", async () => {
        const { execute, calls } = run({ rules: [] });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /nenhuma regra/i);
        assert.ok(!calls.includes("aggregate"));
    });

    it("regra que só passa a valer depois do horizonte não gera faturas", async () => {
        const { execute, calls } = run({ rules: [rule({ effectiveFrom: new Date(2030, 0, 1) })] });
        const result = await execute();

        assert.equal(result.success, true);
        assert.ok(Array.isArray(result.data));
        assert.ok(calls.includes("rules"));
    });

    it("converte várias linhas agregadas mantendo a ordem", async () => {
        const rows = [
            aggregatedRow({ label: "Janeiro 2026", status: "PAID" }),
            aggregatedRow({ label: "Fevereiro 2026", status: "OVERDUE", isOverdue: true }),
        ];
        const { execute } = run({ rows });
        const result = await execute();

        assert.deepEqual(
            result.data?.map((o) => [o.label, o.status, o.isOverdue]),
            [
                ["Janeiro 2026", "PAID", false],
                ["Fevereiro 2026", "OVERDUE", true],
            ]
        );
    });

    it("propaga erro de acesso e acesso sem dados", async () => {
        silenceConsole();
        const denied = await run({ accessError: "Sem acesso" }).execute();
        assert.deepEqual(denied, { success: false, error: "Sem acesso" });

        const empty = await run({ accessWithoutData: true }).execute();
        assert.deepEqual(empty, { success: false, error: "Falha ao validar acesso ao contexto." });
    });

    it("nega quem não pode visualizar saldos", async () => {
        silenceConsole();
        const { execute, calls } = run({ permissions: { canViewBalances: false, canManageBalances: true } });
        const result = await execute();

        assert.equal(result.success, false);
        assert.match(result.error!, /permissão/i);
        assert.deepEqual(calls, []);
    });

    it("converte exceção em erro genérico", async () => {
        silenceConsole();
        const ctx = setupCycleQueries();
        ctx.queries.findCycleRulesInWindow = async () => {
            throw new Error("db offline");
        };
        const result = await new GetCardInvoiceOptionsUseCase(ctx.queries, ctx.access).execute({
            session,
            balanceId: 9,
            today,
        });

        assert.equal(result.success, false);
        assert.match(result.error!, /erro interno/i);
    });
});
