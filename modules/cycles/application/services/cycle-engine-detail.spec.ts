import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CycleEngineService } from "./cycle-engine.service";
import { CycleRuleItem } from "../interfaces/cycle-queries.interface";
import { CycleDetailSchema } from "../../models/cycle-detail.schema";

describe("CycleEngineService - Detalhes do Ciclo (Validação, Saldos e Montagem)", () => {
    const engine = new CycleEngineService();

    const monthlyRule: CycleRuleItem = {
        id: 1,
        agreementId: 10,
        effectiveFrom: new Date(2026, 0, 1), // 2026-01-01
        effectiveTo: null,
        frequency: "MONTHLY",
        interval: 1,
        closingDay: 25,
        dueDay: 5,
    };

    const agreementBounds = {
        startsAt: new Date(2026, 0, 1),
        endsAt: new Date(2026, 11, 31),
        includeInProjection: true,
    };

    describe("validateAndResolveWindows", () => {
        it("valida com sucesso um ciclo legítimo e resolve current, prev e next", () => {
            // Ciclo de Maio 2026: 2026-04-26 a 2026-05-25 (fecha dia 25)
            const result = engine.validateAndResolveWindows(
                [monthlyRule],
                agreementBounds,
                { from: "2026-04-26", to: "2026-05-25" }
            );

            assert.strictEqual(result.success, true);
            if (!result.success) return;

            assert.strictEqual(result.data.current.range.from, "2026-04-26");
            assert.strictEqual(result.data.current.range.to, "2026-05-25");
            assert.strictEqual(result.data.current.rule.id, 1);

            // Prev deve ser Abril: 2026-03-26 a 2026-04-25
            assert.ok(result.data.prev);
            assert.strictEqual(result.data.prev.range.from, "2026-03-26");
            assert.strictEqual(result.data.prev.range.to, "2026-04-25");

            // Next deve ser Junho: 2026-05-26 a 2026-06-25
            assert.ok(result.data.next);
            assert.strictEqual(result.data.next.range.from, "2026-05-26");
            assert.strictEqual(result.data.next.range.to, "2026-06-25");
        });

        it("rejeita período inválido ou adulterado pelo frontend", () => {
            const result = engine.validateAndResolveWindows(
                [monthlyRule],
                agreementBounds,
                { from: "2026-05-01", to: "2026-05-31" } // Incompatível com closingDay = 25
            );

            assert.strictEqual(result.success, false);
            assert.match(
                result.error ?? "",
                /Período de vigência informado não corresponde a um ciclo válido/
            );
        });

        it("define prev como null quando o ciclo atual coincide com o início do contrato", () => {
            // Primeiro ciclo possível do contrato: Janeiro 2026 (inicia 2026-01-01)
            const strictAgreement = {
                startsAt: new Date(2026, 3, 26), // começa exatamente em 2026-04-26
                endsAt: null,
            };

            const result = engine.validateAndResolveWindows(
                [monthlyRule],
                strictAgreement,
                { from: "2026-04-26", to: "2026-05-25" }
            );

            assert.strictEqual(result.success, true);
            if (!result.success) return;

            assert.strictEqual(result.data.prev, null);
            assert.ok(result.data.next);
        });

        it("define next como null quando o ciclo atual coincide com o fim do contrato", () => {
            const strictAgreement = {
                startsAt: new Date(2026, 0, 1),
                endsAt: new Date(2026, 4, 25), // termina exatamente em 2026-05-25
            };

            const result = engine.validateAndResolveWindows(
                [monthlyRule],
                strictAgreement,
                { from: "2026-04-26", to: "2026-05-25" }
            );

            assert.strictEqual(result.success, true);
            if (!result.success) return;

            assert.ok(result.data.prev);
            assert.strictEqual(result.data.next, null);
        });

        it("resolve corretamente transição de regras entre vigências diferentes", () => {
            // Regra 1: até 2026-05-31 (fecha dia 25)
            const rule1: CycleRuleItem = {
                id: 1,
                agreementId: 10,
                effectiveFrom: new Date(2026, 0, 1),
                effectiveTo: new Date(2026, 5, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 25,
                dueDay: 5,
            };

            // Regra 2: a partir de 2026-06-01 (fecha dia 10)
            const rule2: CycleRuleItem = {
                id: 2,
                agreementId: 10,
                effectiveFrom: new Date(2026, 5, 1),
                effectiveTo: null,
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 10,
                dueDay: 20,
            };

            // Ciclo ponte: começou dia 26/05 (após fechamento da Regra 1) e fechou dia 10/06 (novo corte da Regra 2)
            const result = engine.validateAndResolveWindows(
                [rule1, rule2],
                agreementBounds,
                { from: "2026-05-26", to: "2026-06-10" }
            );

            assert.strictEqual(result.success, true);
            if (!result.success) return;

            // Ciclo atual deve refletir a nova regra vigente (Regra 2)
            assert.strictEqual(result.data.current.rule.id, 2);

            // Ciclo anterior deve apontar para o último ciclo da Regra 1: 2026-04-26 a 2026-05-25
            assert.ok(result.data.prev);
            assert.strictEqual(result.data.prev.range.from, "2026-04-26");
            assert.strictEqual(result.data.prev.range.to, "2026-05-25");
            assert.strictEqual(result.data.prev.rule.id, 1);

            // Próximo ciclo deve apontar para o ciclo normal da Regra 2: 2026-06-11 a 2026-07-10
            assert.ok(result.data.next);
            assert.strictEqual(result.data.next.range.from, "2026-06-11");
            assert.strictEqual(result.data.next.range.to, "2026-07-10");
            assert.strictEqual(result.data.next.rule.id, 2);
        });

        it("rejeita ciclo válido na regra mas anterior a agreement.startsAt", () => {
            const result = engine.validateAndResolveWindows(
                [monthlyRule],
                agreementBounds,
                { from: "2025-04-26", to: "2025-05-25" }
            );

            assert.strictEqual(result.success, false);
            assert.match(
                result.error ?? "",
                /Período de vigência informado é anterior ao início do compromisso/
            );
        });

        it("rejeita ciclo válido na regra mas posterior a agreement.endsAt", () => {
            const result = engine.validateAndResolveWindows(
                [monthlyRule],
                agreementBounds,
                { from: "2027-04-26", to: "2027-05-25" }
            );

            assert.strictEqual(result.success, false);
            assert.match(
                result.error ?? "",
                /Período de vigência informado é posterior ao término do compromisso/
            );
        });

        it("mantém simetria ao navegar para trás (prev) a partir do ciclo seguinte a um ciclo ponte", () => {
            const rule1: CycleRuleItem = {
                id: 1,
                agreementId: 10,
                effectiveFrom: new Date(2026, 0, 1),
                effectiveTo: new Date(2026, 5, 1),
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 25,
                dueDay: 5,
            };

            const rule2: CycleRuleItem = {
                id: 2,
                agreementId: 10,
                effectiveFrom: new Date(2026, 5, 1),
                effectiveTo: null,
                frequency: "MONTHLY",
                interval: 1,
                closingDay: 10,
                dueDay: 20,
            };

            const result = engine.validateAndResolveWindows(
                [rule1, rule2],
                agreementBounds,
                { from: "2026-06-11", to: "2026-07-10" }
            );

            assert.strictEqual(result.success, true);
            if (!result.success) return;

            assert.ok(result.data.prev);
            assert.strictEqual(result.data.prev.range.from, "2026-05-26");
            assert.strictEqual(result.data.prev.range.to, "2026-06-10");
            assert.strictEqual(result.data.prev.rule.id, 2);
        });
    });

    describe("calculateCycleAmounts", () => {
        it("calcula valores de PAYABLE com polaridade contábil sobre lançamentos reais", () => {
            const amounts = engine.calculateCycleAmounts({
                balanceType: "PAYABLE",
                aggregated: {
                    movementsCount: 3,
                    recognizedSignedAmount: -100000, // R$ 1.000,00 de débito
                    settledSignedAmount: 40000,      // R$ 400,00 de amortização
                    transferredSignedAmount: 0,
                    netSignedAmount: -60000,         // Saldo devedor: R$ 600,00
                    hasSettlementReceipt: true,
                    latestSettlementDate: new Date(2026, 4, 10),
                },
                currentDueDate: new Date(2026, 5, 5),
                amountLog: [{ amount: 100000, effectiveAt: new Date(2026, 0, 1) }],
            });

            assert.strictEqual(amounts.total, 100000);
            assert.strictEqual(amounts.paid, 40000);
            assert.strictEqual(amounts.open, 60000);
            assert.strictEqual(amounts.transferred, 0);
        });

        it("calcula valores de RECEIVABLE com polaridade contábil sobre lançamentos reais", () => {
            const amounts = engine.calculateCycleAmounts({
                balanceType: "RECEIVABLE",
                aggregated: {
                    movementsCount: 2,
                    recognizedSignedAmount: 250000, // R$ 2.500,00 a receber
                    settledSignedAmount: -100000,   // R$ 1.000,00 recebidos
                    transferredSignedAmount: 0,
                    netSignedAmount: 150000,        // Aberto: R$ 1.500,00
                    hasSettlementReceipt: false,
                    latestSettlementDate: new Date(2026, 4, 15),
                },
                currentDueDate: new Date(2026, 5, 5),
                amountLog: [{ amount: 250000, effectiveAt: new Date(2026, 0, 1) }],
            });

            assert.strictEqual(amounts.total, 250000);
            assert.strictEqual(amounts.paid, 100000);
            assert.strictEqual(amounts.open, 150000);
        });

        it("calcula valores de CREDIT (Cartão de Crédito) com compras e pagamentos", () => {
            const amounts = engine.calculateCycleAmounts({
                balanceType: "CREDIT",
                aggregated: {
                    movementsCount: 5,
                    recognizedSignedAmount: -350000, // R$ 3.500,00 em compras
                    settledSignedAmount: 200000,     // R$ 2.000,00 pago na fatura
                    transferredSignedAmount: 0,
                    netSignedAmount: -150000,        // Aberto: R$ 1.500,00
                    hasSettlementReceipt: true,
                    latestSettlementDate: new Date(2026, 5, 4),
                },
                currentDueDate: new Date(2026, 5, 5),
                amountLog: [],
            });

            assert.strictEqual(amounts.total, 350000);
            assert.strictEqual(amounts.paid, 200000);
            assert.strictEqual(amounts.open, 150000);
        });

        it("resolve saldos de ciclo vazio para Contrato buscando valor em amountLog", () => {
            const amounts = engine.calculateCycleAmounts({
                balanceType: "PAYABLE",
                aggregated: {
                    movementsCount: 0,
                    recognizedSignedAmount: 0,
                    settledSignedAmount: 0,
                    transferredSignedAmount: 0,
                    netSignedAmount: 0,
                    hasSettlementReceipt: false,
                    latestSettlementDate: null,
                },
                currentDueDate: new Date(2026, 5, 5),
                amountLog: [
                    { amount: 50000, effectiveAt: new Date(2025, 0, 1) },
                    { amount: 25000, effectiveAt: new Date(2026, 0, 1) }, // incremento de 25.000 -> total 75.000 em maio 2026
                ],
            });

            assert.strictEqual(amounts.total, 75000);
            assert.strictEqual(amounts.paid, 0);
            assert.strictEqual(amounts.open, 75000);
        });

        it("resolve saldos de ciclo vazio para Cartão de Crédito zerando valores", () => {
            const amounts = engine.calculateCycleAmounts({
                balanceType: "CREDIT",
                aggregated: {
                    movementsCount: 0,
                    recognizedSignedAmount: 0,
                    settledSignedAmount: 0,
                    transferredSignedAmount: 0,
                    netSignedAmount: 0,
                    hasSettlementReceipt: false,
                    latestSettlementDate: null,
                },
                currentDueDate: new Date(2026, 5, 5),
                amountLog: [],
            });

            assert.strictEqual(amounts.total, 0);
            assert.strictEqual(amounts.paid, 0);
            assert.strictEqual(amounts.open, 0);
        });

        it("retorna valores zerados para qualquer balanceType quando movementsCount === 0 e amountLog for omitido ou vazio", () => {
            const types = ["PAYABLE", "RECEIVABLE", "CREDIT", "WALLET"] as const;
            for (const balanceType of types) {
                const amountsWithoutLog = engine.calculateCycleAmounts({
                    balanceType,
                    aggregated: {
                        movementsCount: 0,
                        recognizedSignedAmount: 0,
                        settledSignedAmount: 0,
                        transferredSignedAmount: 0,
                        netSignedAmount: 0,
                        hasSettlementReceipt: false,
                        latestSettlementDate: null,
                    },
                    currentDueDate: new Date(2026, 5, 5),
                });

                assert.deepStrictEqual(amountsWithoutLog, {
                    total: 0,
                    paid: 0,
                    open: 0,
                    transferred: 0,
                    recognized: 0,
                });

                const amountsWithEmptyLog = engine.calculateCycleAmounts({
                    balanceType,
                    aggregated: {
                        movementsCount: 0,
                        recognizedSignedAmount: 0,
                        settledSignedAmount: 0,
                        transferredSignedAmount: 0,
                        netSignedAmount: 0,
                        hasSettlementReceipt: false,
                        latestSettlementDate: null,
                    },
                    currentDueDate: new Date(2026, 5, 5),
                    amountLog: [],
                });

                assert.deepStrictEqual(amountsWithEmptyLog, {
                    total: 0,
                    paid: 0,
                    open: 0,
                    transferred: 0,
                    recognized: 0,
                });
            }
        });
    });

    describe("calculateCycleDetail", () => {
        const mockWindows = {
            current: {
                range: { from: "2026-04-26", to: "2026-05-25" },
                dueDate: new Date(2026, 5, 5), // 2026-06-05
                closingDate: new Date(2026, 4, 25), // 2026-05-25
                label: "Maio 2026",
                rule: monthlyRule,
            },
            prev: null,
            next: null,
        };

        it("monta CycleDetail com status PAID e data de liquidação", () => {
            const detail = engine.calculateCycleDetail({
                balance: { id: 10, name: "Contrato Aluguel", balanceType: "PAYABLE" },
                agreement: agreementBounds,
                windows: mockWindows,
                amounts: { total: 100000, paid: 100000, open: 0, transferred: 0 },
                movementsCount: 2,
                latestSettlementDate: new Date(2026, 5, 4),
                hasReceipt: true,
                now: new Date(2026, 5, 10),
            });

            assert.strictEqual(detail.status, "PAID");
            assert.strictEqual(detail.isOverdue, false);
            assert.strictEqual(detail.settlementDate, "2026-06-04");
            assert.strictEqual(detail.amounts.remaining, 0);

            // Valida schema
            const parsed = CycleDetailSchema.safeParse(detail);
            assert.strictEqual(parsed.success, true);
        });

        it("monta CycleDetail com status OVERDUE para ciclo vencido com saldo em aberto", () => {
            const detail = engine.calculateCycleDetail({
                balance: { id: 10, name: "Contrato Aluguel", balanceType: "PAYABLE" },
                agreement: agreementBounds,
                windows: mockWindows,
                amounts: { total: 100000, paid: 0, open: 100000, transferred: 0 },
                movementsCount: 1,
                latestSettlementDate: null,
                hasReceipt: false,
                now: new Date(2026, 5, 10), // após vencimento em 2026-06-05
            });

            assert.strictEqual(detail.status, "OVERDUE");
            assert.strictEqual(detail.isOverdue, true);

            const parsed = CycleDetailSchema.safeParse(detail);
            assert.strictEqual(parsed.success, true);
        });

        it("monta CycleDetail com status PROJECTED para ciclo sem lançamentos no futuro", () => {
            const detail = engine.calculateCycleDetail({
                balance: { id: 10, name: "Contrato Aluguel", balanceType: "PAYABLE" },
                agreement: agreementBounds,
                windows: mockWindows,
                amounts: { total: 100000, paid: 0, open: 100000, transferred: 0 },
                movementsCount: 0,
                latestSettlementDate: null,
                hasReceipt: false,
                now: new Date(2026, 4, 1), // antes do fechamento/vencimento
            });

            assert.strictEqual(detail.status, "PROJECTED");
            assert.strictEqual(detail.isOverdue, false);

            const parsed = CycleDetailSchema.safeParse(detail);
            assert.strictEqual(parsed.success, true);
        });

        it("monta CycleDetail com status TRANSFERRED quando saldo restante é liquidado via transferência", () => {
            const detail = engine.calculateCycleDetail({
                balance: { id: 10, name: "Contrato Aluguel", balanceType: "PAYABLE" },
                agreement: agreementBounds,
                windows: mockWindows,
                amounts: { total: 100000, paid: 20000, open: 0, transferred: 80000 },
                movementsCount: 2,
                latestSettlementDate: new Date(2026, 5, 4),
                hasReceipt: true,
                now: new Date(2026, 5, 10),
            });

            assert.strictEqual(detail.status, "TRANSFERRED");
            assert.strictEqual(detail.isOverdue, false);
            assert.strictEqual(detail.amounts.remaining, 0);
            assert.strictEqual(detail.amounts.transferred, 80000);

            const parsed = CycleDetailSchema.safeParse(detail);
            assert.strictEqual(parsed.success, true);
        });
    });
});
