import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    CycleStatusRuleEngine,
    CycleStatusEvaluationContext,
    ZeroEntriesCommitmentRule,
    SettledCommitmentRule,
    TransferredCommitmentRule,
    OverdueCommitmentRule,
    PartialCommitmentRule,
    PendingCommitmentRule,
    ZeroEntriesObligationRule,
} from "./cycle-status.rules";

describe("CycleStatusRuleEngine (Rules Pattern)", () => {
    const today = new Date(2026, 4, 15); // 2026-05-15
    const dueDate = new Date(2026, 4, 10); // 2026-05-10
    const endsAt = new Date(2026, 4, 5); // 2026-05-05

    const baseCtx: CycleStatusEvaluationContext = {
        totalEntriesCount: 3,
        totalAmount: 10000,
        paidAmount: 0,
        remainingAmount: 10000,
        recognizedAmount: 10000,
        dueDate,
        endsAt,
        today,
    };

    describe("Regras Atômicas em Isolamento", () => {
        it("ZeroEntriesCommitmentRule dá match apenas quando totalEntriesCount for zero", () => {
            assert.strictEqual(
                ZeroEntriesCommitmentRule.matches({ ...baseCtx, totalEntriesCount: 0 }),
                true
            );
            assert.strictEqual(
                ZeroEntriesCommitmentRule.matches({ ...baseCtx, totalEntriesCount: 1 }),
                false
            );
            assert.strictEqual(
                ZeroEntriesCommitmentRule.resolve({ ...baseCtx, totalEntriesCount: 0 }),
                "PROJECTED"
            );
        });

        it("SettledCommitmentRule dá match quando total > 0 e paid >= total", () => {
            assert.strictEqual(
                SettledCommitmentRule.matches({ ...baseCtx, totalAmount: 10000, paidAmount: 10000 }),
                true
            );
            assert.strictEqual(
                SettledCommitmentRule.matches({ ...baseCtx, totalAmount: 10000, paidAmount: 5000 }),
                false
            );
            assert.strictEqual(
                SettledCommitmentRule.matches({ ...baseCtx, totalAmount: 0, paidAmount: 0 }),
                false
            );
        });

        it("TransferredCommitmentRule dá match quando há transferência quitando o saldo restante sem quitação integral por pagamento", () => {
            assert.strictEqual(
                TransferredCommitmentRule.matches({
                    ...baseCtx,
                    transferredAmount: 6000,
                    remainingAmount: 0,
                    paidAmount: 4000,
                    totalAmount: 10000,
                }),
                true
            );
            assert.strictEqual(
                TransferredCommitmentRule.matches({
                    ...baseCtx,
                    transferredAmount: 0,
                    remainingAmount: 0,
                    paidAmount: 10000,
                    totalAmount: 10000,
                }),
                false
            );
            assert.strictEqual(
                TransferredCommitmentRule.resolve({ ...baseCtx }),
                "TRANSFERRED"
            );
        });

        it("OverdueCommitmentRule dá match quando há saldo devedor e dueDate < today", () => {
            assert.strictEqual(
                OverdueCommitmentRule.matches({
                    ...baseCtx,
                    remainingAmount: 5000,
                    dueDate: new Date(2026, 4, 10), // Venceu dia 10 (hoje é dia 15)
                }),
                true
            );
            assert.strictEqual(
                OverdueCommitmentRule.matches({
                    ...baseCtx,
                    remainingAmount: 0,
                    dueDate: new Date(2026, 4, 10),
                }),
                false
            );
            assert.strictEqual(
                OverdueCommitmentRule.matches({
                    ...baseCtx,
                    remainingAmount: 5000,
                    dueDate: new Date(2026, 4, 20), // Vence dia 20 (futuro)
                }),
                false
            );
        });

        it("ZeroEntriesObligationRule resolve UNRECORDED no passado e PROJECTED no futuro", () => {
            const pastDue = new Date(2026, 2, 10);
            const futureDue = new Date(2026, 5, 10);
            const periodStart = new Date(2026, 4, 1);

            const pastCtx = {
                ...baseCtx,
                totalEntriesCount: 0,
                dueDate: pastDue,
                currentPeriodStart: periodStart,
            };
            const futureCtx = {
                ...baseCtx,
                totalEntriesCount: 0,
                dueDate: futureDue,
                currentPeriodStart: periodStart,
            };

            assert.strictEqual(ZeroEntriesObligationRule.resolve(pastCtx), "UNRECORDED");
            assert.strictEqual(ZeroEntriesObligationRule.resolve(futureCtx), "PROJECTED");
        });
    });

    describe("Motor de Compromissos (forCommitmentCycle)", () => {
        const engine = CycleStatusRuleEngine.forCommitmentCycle();

        it("avalia e resolve PROJECTED para ciclo sem lançamentos", () => {
            assert.strictEqual(
                engine.evaluate({ ...baseCtx, totalEntriesCount: 0 }),
                "PROJECTED"
            );
        });

        it("avalia e resolve PAID quando quitado", () => {
            assert.strictEqual(
                engine.evaluate({ ...baseCtx, paidAmount: 10000, remainingAmount: 0 }),
                "PAID"
            );
        });

        it("avalia e resolve TRANSFERRED quando saldo restante foi liquidado via transferência", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    transferredAmount: 10000,
                    remainingAmount: 0,
                    paidAmount: 0,
                    totalAmount: 10000,
                }),
                "TRANSFERRED"
            );
        });

        it("avalia e resolve OVERDUE quando vencido", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    dueDate: new Date(2026, 4, 10),
                    remainingAmount: 5000,
                }),
                "OVERDUE"
            );
        });

        it("avalia e resolve PARTIAL quando parcialmente pago", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    dueDate: new Date(2026, 4, 20),
                    paidAmount: 4000,
                    remainingAmount: 6000,
                }),
                "PARTIAL"
            );
        });

        it("avalia e resolve PENDING quando fechado aguardando quitação", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    dueDate: new Date(2026, 4, 20),
                    endsAt: new Date(2026, 4, 10),
                    paidAmount: 0,
                    remainingAmount: 10000,
                    recognizedAmount: 10000,
                }),
                "PENDING"
            );
        });

        it("avalia e resolve OPEN por padrão quando nenhuma regra anterior der match", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    dueDate: new Date(2026, 4, 25),
                    endsAt: new Date(2026, 4, 20),
                    paidAmount: 0,
                    remainingAmount: 10000,
                    recognizedAmount: 0,
                }),
                "OPEN"
            );
        });
    });

    describe("Motor de Obrigações (forObligationCycle)", () => {
        const engine = CycleStatusRuleEngine.forObligationCycle();

        it("avalia e resolve UNRECORDED para ciclo vazio anterior ao período corrente", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    totalEntriesCount: 0,
                    dueDate: new Date(2026, 2, 10),
                    currentPeriodStart: new Date(2026, 4, 1),
                }),
                "UNRECORDED"
            );
        });

        it("avalia e resolve PROJECTED para ciclo vazio futuro", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    totalEntriesCount: 0,
                    dueDate: new Date(2026, 5, 10),
                    currentPeriodStart: new Date(2026, 4, 1),
                }),
                "PROJECTED"
            );
        });

        it("avalia e resolve SETTLED quando quitado", () => {
            assert.strictEqual(
                engine.evaluate({
                    ...baseCtx,
                    paidAmount: 10000,
                }),
                "SETTLED"
            );
        });
    });
});

