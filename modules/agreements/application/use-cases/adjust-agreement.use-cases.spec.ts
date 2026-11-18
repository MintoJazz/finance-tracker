import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type {
    AddAmountEntryRepositoryDTO,
    AdjustableBalanceType,
    AgreementAdjustmentContext,
    IAgreementAdjustmentRepository,
    UpsertCycleRuleRepositoryDTO,
} from "../interfaces/agreement-adjustment-repository.interface";
import { AdjustAgreementAmountUseCase } from "./adjust-agreement-amount.use-case";
import { AdjustAgreementDeadlinesUseCase } from "./adjust-agreement-deadlines.use-case";

const session: SessionPayload = { contextId: 100, partyId: 5 };
const now = () => new Date(2026, 10, 17, 10); // 17/11/2026
const utc = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const localNoon = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

const manage: ISpaceAccessProvider = {
    execute: async () => success({ canViewBalances: true, canManageBalances: true }),
};

const card = (over: Partial<AgreementAdjustmentContext> = {}): AgreementAdjustmentContext => ({
    balanceId: 7,
    name: "Nubank",
    balanceType: "CREDIT",
    removedAt: null,
    frequency: "MONTHLY",
    interval: 1,
    startsAt: utc("2026-01-01"),
    endsAt: null,
    rules: [
        { id: 1, agreementId: 7, dueDay: 15, dueMonth: null, closingDay: 10, closingMonth: null, effectiveFrom: utc("2026-01-01") },
    ],
    amountEntries: [{ amount: 100000, effectiveAt: localNoon(2026, 1, 1) }],
    ...over,
});

function setup(context: AgreementAdjustmentContext | null, access: ISpaceAccessProvider = manage) {
    const entries: AddAmountEntryRepositoryDTO[] = [];
    const rules: UpsertCycleRuleRepositoryDTO[] = [];
    const lookups: { types: AdjustableBalanceType[]; contextId: number }[] = [];

    const repo: IAgreementAdjustmentRepository = {
        findAgreementContext: async (_id, contextId, types) => {
            lookups.push({ types, contextId });
            return context;
        },
        addAmountEntry: async (d) => (entries.push(d), { id: 1 }),
        upsertCycleRule: async (d) => (rules.push(d), { id: 2 }),
        withTransaction: async (work) => work(repo),
    };

    return {
        entries,
        rules,
        lookups,
        amount: new AdjustAgreementAmountUseCase(repo, access, now),
        deadlines: new AdjustAgreementDeadlinesUseCase(repo, access, now),
    };
}

describe("AdjustAgreementAmountUseCase", () => {
    const run = (s: ReturnType<typeof setup>, data: object, scope: "CARD" | "RECURRENCE" = "CARD") =>
        s.amount.execute({
            session,
            scope,
            balanceId: 7,
            data: { amount: 150000, effectiveMode: "NOW", ...data } as never,
        });

    it("grava a variação (delta), não o valor absoluto", async () => {
        const s = setup(card());
        const r = await run(s, {});
        assert.ok(r.success);
        assert.equal(s.entries.length, 1);
        assert.equal(s.entries[0].delta, 50000);
        assert.equal(s.entries[0].reason, "Ajuste de limite");
        assert.deepEqual(r.data, {
            id: 7,
            name: "Nubank",
            effectiveAt: "2026-11-17",
            amount: 150000,
            delta: 50000,
        });
    });

    it("aceita redução (delta negativo) e usa o motivo informado", async () => {
        const s = setup(card());
        const r = await run(s, { amount: 60000, reason: "  Corte  " });
        assert.ok(r.success);
        assert.equal(s.entries[0].delta, -40000);
        assert.equal(s.entries[0].reason, "Corte");
    });

    it("recorrência usa o motivo padrão 'Ajuste de valor' e os tipos PAYABLE/RECEIVABLE", async () => {
        const s = setup(card({ balanceType: "PAYABLE" }));
        await run(s, {}, "RECURRENCE");
        assert.equal(s.entries[0].reason, "Ajuste de valor");
        assert.deepEqual(s.lookups[0].types, ["PAYABLE", "RECEIVABLE"]);
        assert.equal(s.lookups[0].contextId, 100);
    });

    it("NEXT_CYCLE grava com vigência futura (dia 11/12) em meio-dia local", async () => {
        const s = setup(card());
        const r = await run(s, { effectiveMode: "NEXT_CYCLE" });
        assert.ok(r.success);
        assert.equal(r.data.effectiveAt, "2026-12-11");
        assert.equal(s.entries[0].effectiveAt.getTime(), localNoon(2026, 12, 11).getTime());
    });

    it("recusa valor igual ao vigente", async () => {
        const r = await run(setup(card()), { amount: 100000 });
        assert.deepEqual(r, failure("O valor informado é igual ao valor vigente nessa data."));
    });

    it("recusa quando já existe ajuste agendado depois da data", async () => {
        const scheduled = card({
            amountEntries: [
                { amount: 100000, effectiveAt: localNoon(2026, 1, 1) },
                { amount: 20000, effectiveAt: localNoon(2026, 12, 20) },
            ],
        });
        const r = await run(setup(scheduled), { amount: 130000 });
        assert.deepEqual(r, failure("Já existe um ajuste agendado para depois dessa data."));
    });

    it("recusa data passada e cartão arquivado", async () => {
        const past = await run(setup(card()), { effectiveMode: "DATE", effectiveFrom: "2026-11-01" });
        assert.equal(past.success, false);

        const archived = await run(setup(card({ removedAt: new Date() })), {});
        assert.deepEqual(archived, failure("Não é possível ajustar um cartão arquivado."));
    });

    it("recusa recorrência encerrada", async () => {
        const ended = card({ balanceType: "PAYABLE", endsAt: utc("2026-10-01") });
        const r = await run(setup(ended), {}, "RECURRENCE");
        assert.deepEqual(r, failure("Não é possível ajustar uma recorrência encerrada."));
    });

    it("não encontrado (escopo/contexto errados) e sem permissão", async () => {
        const missing = await run(setup(null), {});
        assert.deepEqual(missing, failure("Cartão não encontrado."));
        const missingRec = await run(setup(null), {}, "RECURRENCE");
        assert.deepEqual(missingRec, failure("Recorrência não encontrada."));

        const denied = setup(card(), {
            execute: async () => success({ canViewBalances: true, canManageBalances: false }),
        });
        const r = await run(denied, {});
        assert.deepEqual(r, failure("Sem permissão para gerenciar os cartões deste contexto!"));
        assert.equal(denied.lookups.length, 0);
    });

    it("propaga falha de acesso ao espaço", async () => {
        const s = setup(card(), { execute: async () => failure("Sem acesso") });
        assert.deepEqual(await run(s, {}), failure("Sem acesso"));
    });

    it("erro inesperado vira mensagem genérica", async () => {
        const s = setup(card());
        s.amount = new AdjustAgreementAmountUseCase(
            { ...({} as IAgreementAdjustmentRepository), withTransaction: async () => { throw new Error("db down"); } },
            manage,
            now
        );
        const r = await run(s, {});
        assert.deepEqual(r, failure("Ocorreu um erro interno. Tente novamente mais tarde."));
    });
});

describe("AdjustAgreementDeadlinesUseCase", () => {
    const run = (s: ReturnType<typeof setup>, data: object, scope: "CARD" | "RECURRENCE" = "CARD") =>
        s.deadlines.execute({
            session,
            scope,
            balanceId: 7,
            data: { dueDay: 12, closingDay: 5, effectiveMode: "NOW", ...data } as never,
        });

    it("cartão: grava regra com vigência em meia-noite UTC do dia", async () => {
        const s = setup(card());
        const r = await run(s, {});
        assert.ok(r.success);
        assert.equal(r.data.effectiveFrom, "2026-11-17");
        assert.deepEqual(s.rules[0], {
            agreementId: 7,
            effectiveFrom: utc("2026-11-17"),
            dueDay: 12,
            dueMonth: null,
            closingDay: 5,
            closingMonth: null,
        });
    });

    it("cartão: fechamento é obrigatório", async () => {
        const r = await run(setup(card()), { closingDay: null });
        assert.deepEqual(r, failure("O dia de fechamento deve ser entre 1 e 31."));
    });

    it("NEXT_CYCLE: vigência no dia seguinte ao fim do ciclo vigente", async () => {
        const s = setup(card());
        const r = await run(s, { effectiveMode: "NEXT_CYCLE" });
        assert.ok(r.success);
        assert.equal(r.data.effectiveFrom, "2026-12-11");
        assert.deepEqual(s.rules[0].effectiveFrom, utc("2026-12-11"));
    });

    it("recorrência mensal sem fechamento customizado zera fechamento e meses", async () => {
        const rec = card({ balanceType: "PAYABLE", rules: [{ ...card().rules[0], closingDay: null }] });
        const s = setup(rec);
        const r = await run(s, { hasCustomClosingDate: false, closingDay: 5, dueMonth: 3, closingMonth: 3 }, "RECURRENCE");
        assert.ok(r.success);
        assert.equal(s.rules[0].closingDay, null);
        assert.equal(s.rules[0].dueMonth, null);
        assert.equal(s.rules[0].closingMonth, null);
    });

    it("a frequência vem do acordo: semanal aceita 0–6 e recusa 15", async () => {
        const weekly = card({ balanceType: "PAYABLE", frequency: "WEEKLY" });
        const ok = await run(setup(weekly), { dueDay: 3, hasCustomClosingDate: false }, "RECURRENCE");
        assert.ok(ok.success);
        const bad = await run(setup(weekly), { dueDay: 15, hasCustomClosingDate: false }, "RECURRENCE");
        assert.deepEqual(bad, failure("Selecione o dia da semana do vencimento."));
    });

    it("anual exige dia e mês e grava os meses", async () => {
        const yearly = card({ balanceType: "RECEIVABLE", frequency: "YEARLY" });
        const s = setup(yearly);
        const bad = await run(s, { dueDay: 20, dueMonth: null, hasCustomClosingDate: false }, "RECURRENCE");
        assert.deepEqual(bad, failure("Informe o dia e o mês de vencimento."));

        const ok = await run(s, { dueDay: 20, dueMonth: 12, hasCustomClosingDate: true, closingDay: 5, closingMonth: 11 }, "RECURRENCE");
        assert.ok(ok.success);
        assert.equal(s.rules[0].dueMonth, 12);
        assert.equal(s.rules[0].closingMonth, 11);
    });

    it("recusa data passada, arquivado, não encontrado e sem permissão", async () => {
        assert.equal((await run(setup(card()), { effectiveMode: "DATE", effectiveFrom: "2026-11-16" })).success, false);
        assert.deepEqual(
            await run(setup(card({ removedAt: new Date() })), {}),
            failure("Não é possível ajustar um cartão arquivado.")
        );
        assert.deepEqual(await run(setup(null), {}), failure("Cartão não encontrado."));
        const denied = setup(card(), {
            execute: async () => success({ canViewBalances: true, canManageBalances: false }),
        });
        assert.deepEqual(
            await run(denied, {}, "RECURRENCE"),
            failure("Sem permissão para gerenciar as recorrências deste contexto!")
        );
    });
});
