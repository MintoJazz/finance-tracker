import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CycleEngineService } from "./cycle-engine.service";
import { AgreementCycleSourceData, CycleWindow } from "../types/commitment-cycle-engine.interface";

const civilDate = (year: number, month: number, day: number) =>
    new Date(year, month - 1, day);

describe("CycleEngineService", () => {
    const engine = new CycleEngineService();

    it("should project cycles for recurring commitment as PROJECTED when there are no entries", () => {
        const now = civilDate(2026, 10, 15);
        const window: CycleWindow = {
            from: civilDate(2026, 10, 1),
            to: civilDate(2026, 10, 31),
        };

        const sources: AgreementCycleSourceData[] = [
            {
                agreementId: 1,
                balanceId: 10,
                balanceName: "Aluguel",
                balanceType: "COMMITMENT",
                includeInProjection: true,
                startsAt: civilDate(2026, 1, 1),
                endsAt: null,
                amountLog: [
                    {
                        amount: 250000, // R$ 2.500,00
                        effectiveAt: civilDate(2026, 1, 1),
                    },
                ],
                rules: [
                    {
                        id: 1,
                        agreementId: 1,
                        effectiveFrom: civilDate(2026, 1, 1),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: null,
                        dueDay: 10,
                        entries: [],
                    },
                ],
            },
        ];

        const cycles = engine.projectCycles(sources, window, now);

        assert.equal(cycles.length, 1);
        const item = cycles[0];
        assert.equal(item.balanceName, "Aluguel");
        assert.equal(item.balanceType, "COMMITMENT");
        assert.equal(item.kind, "PROJECTED");
        assert.equal(item.totalAmount, 250000);
        assert.equal(item.paidAmount, 0);
        assert.equal(item.remainingAmount, 250000);
        // Vencimento dia 10/10 < hoje 15/10 -> OVERDUE
        assert.equal(item.status, "OVERDUE");
    });

    it("should omit empty credit card cycle when both recognizedAmount and paidAmount are zero", () => {
        const now = civilDate(2026, 10, 15);
        const window: CycleWindow = {
            from: civilDate(2026, 10, 1),
            to: civilDate(2026, 10, 31),
        };

        const sources: AgreementCycleSourceData[] = [
            {
                agreementId: 2,
                balanceId: 20,
                balanceName: "Cartão Sem Gastos",
                balanceType: "CREDIT",
                includeInProjection: true,
                startsAt: civilDate(2026, 1, 1),
                endsAt: null,
                amountLog: [{ amount: 500000, effectiveAt: civilDate(2026, 1, 1) }],
                rules: [
                    {
                        id: 2,
                        agreementId: 2,
                        effectiveFrom: civilDate(2026, 1, 1),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: 5,
                        dueDay: 15, // Vence dia 15/10 (dentro da janela)
                        entries: [], // Zero compras e pagamentos
                    },
                ],
            },
        ];

        const cycles = engine.projectCycles(sources, window, now);
        // Ciclo vazio de cartão DEVE ser omitido
        assert.equal(cycles.length, 0);
    });

    it("should emit credit card cycle if there is a payment even without purchases", () => {
        const now = civilDate(2026, 10, 15);
        const window: CycleWindow = {
            from: civilDate(2026, 10, 1),
            to: civilDate(2026, 10, 31),
        };

        const sources: AgreementCycleSourceData[] = [
            {
                agreementId: 3,
                balanceId: 30,
                balanceName: "Cartão Pago",
                balanceType: "CREDIT",
                includeInProjection: true,
                startsAt: civilDate(2026, 1, 1),
                endsAt: null,
                amountLog: [],
                rules: [
                    {
                        id: 3,
                        agreementId: 3,
                        effectiveFrom: civilDate(2026, 1, 1),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: 5,
                        dueDay: 15, // Vence dia 15/10
                        entries: [
                            {
                                referenceDate: civilDate(2026, 10, 2),
                                type: "SETTLEMENT",
                                reversesEntryType: null,
                                direction: "CREDIT", // Pagamento do cartão (reduz saldo devedor)
                                amount: 150000,
                                count: 1,
                            },
                        ],
                    },
                ],
            },
        ];

        const cycles = engine.projectCycles(sources, window, now);
        assert.equal(cycles.length, 1);
        assert.equal(cycles[0].kind, "ACTUAL");
        assert.equal(cycles[0].paidAmount, 150000);
        assert.equal(cycles[0].totalAmount, 0);
    });

    it("should handle REVERSAL entry and correctly subtract from recognized amount", () => {
        const now = civilDate(2026, 10, 15);
        const window: CycleWindow = {
            from: civilDate(2026, 10, 1),
            to: civilDate(2026, 10, 31),
        };

        const sources: AgreementCycleSourceData[] = [
            {
                agreementId: 4,
                balanceId: 40,
                balanceName: "Cartão com Estorno",
                balanceType: "CREDIT",
                includeInProjection: true,
                startsAt: civilDate(2026, 1, 1),
                endsAt: null,
                amountLog: [],
                rules: [
                    {
                        id: 4,
                        agreementId: 4,
                        effectiveFrom: civilDate(2026, 1, 1),
                        frequency: "MONTHLY",
                        interval: 1,
                        closingDay: 5,
                        dueDay: 15,
                        entries: [
                            // Compra inicial: R$ 300,00 (aumenta saldo devedor)
                            {
                                referenceDate: civilDate(2026, 10, 2),
                                type: "DIRECT",
                                reversesEntryType: null,
                                direction: "DEBIT",
                                amount: 30000,
                                count: 1,
                            },
                            // Estorno parcial: R$ 100,00 (diminui saldo devedor CREDIT)
                            {
                                referenceDate: civilDate(2026, 10, 3),
                                type: "REVERSAL",
                                reversesEntryType: "DIRECT",
                                direction: "CREDIT",
                                amount: 10000,
                                count: 1,
                            },
                        ],
                    },
                ],
            },
        ];

        const cycles = engine.projectCycles(sources, window, now);
        assert.equal(cycles.length, 1);
        // Reconhecido: 30000 - 10000 = 20000 (R$ 200,00)
        assert.equal(cycles[0].totalAmount, 20000);
        assert.equal(cycles[0].kind, "ACTUAL");
    });

    it("should correctly transition through statuses: PAID, PARTIAL, PENDING, OVERDUE, OPEN", () => {
        const now = civilDate(2026, 10, 15);
        const window: CycleWindow = {
            from: civilDate(2026, 10, 1),
            to: civilDate(2026, 10, 31),
        };

        const createSource = (
            id: number,
            dueDay: number,
            total: number,
            paid: number,
            recognized = 0
        ): AgreementCycleSourceData => ({
            agreementId: id,
            balanceId: id,
            balanceName: `Item ${id}`,
            balanceType: "COMMITMENT",
            includeInProjection: true,
            startsAt: civilDate(2026, 1, 1),
            endsAt: null,
            amountLog: [{ amount: total, effectiveAt: civilDate(2026, 1, 1) }],
            rules: [
                {
                    id,
                    agreementId: id,
                    effectiveFrom: civilDate(2026, 1, 1),
                    frequency: "MONTHLY",
                    interval: 1,
                    closingDay: null,
                    dueDay,
                    entries: [
                        ...(paid > 0
                            ? [
                                  {
                                      referenceDate: civilDate(2026, 10, 5),
                                      type: "SETTLEMENT" as const,
                                      reversesEntryType: null,
                                      direction: "CREDIT" as const,
                                      amount: paid,
                                      count: 1,
                                  },
                              ]
                            : []),
                        ...(recognized > 0
                            ? [
                                  {
                                      referenceDate: civilDate(2026, 10, 5),
                                      type: "ACCRUAL" as const,
                                      reversesEntryType: null,
                                      direction: "DEBIT" as const,
                                      amount: recognized,
                                      count: 1,
                                  },
                              ]
                            : []),
                    ],
                },
            ],
        });

        // 1. Total 100, Pago 100 -> PAID
        const paidSource = createSource(1, 20, 10000, 10000);
        const [paidCycle] = engine.projectCycles([paidSource], window, now);
        assert.equal(paidCycle.status, "PAID");

        // 2. Vencido (dueDay 10 < now 15), Restante 100 -> OVERDUE
        const overdueSource = createSource(2, 10, 10000, 0);
        const [overdueCycle] = engine.projectCycles([overdueSource], window, now);
        assert.equal(overdueCycle.status, "OVERDUE");

        // 3. Pago 40 de 100, dueDay 20 -> PARTIAL
        const partialSource = createSource(3, 20, 10000, 4000);
        const [partialCycle] = engine.projectCycles([partialSource], window, now);
        assert.equal(partialCycle.status, "PARTIAL");

        // 4. Pago 0, Reconhecido > 0, dueDay 20 -> PENDING
        const pendingSource = createSource(4, 20, 10000, 0, 10000);
        const [pendingCycle] = engine.projectCycles([pendingSource], window, now);
        assert.equal(pendingCycle.status, "PENDING");

        // 5. Futuro (dueDay 20), sem lançamentos -> OPEN
        const openSource = createSource(5, 20, 10000, 0, 0);
        const [openCycle] = engine.projectCycles([openSource], window, now);
        assert.equal(openCycle.status, "OPEN");
    });

    it("should summarize cycles and apply filters correctly", () => {
        const cycles = [
            {
                balanceId: 1,
                balanceName: "Internet",
                balanceType: "COMMITMENT" as const,
                kind: "PROJECTED" as const,
                label: "Outubro 2026",
                from: "2026-10-01",
                to: "2026-10-31",
                dueDate: civilDate(2026, 10, 10),
                totalAmount: 10000,
                paidAmount: 0,
                remainingAmount: 10000,
                status: "OVERDUE" as const,
            },
            {
                balanceId: 2,
                balanceName: "Energia",
                balanceType: "COMMITMENT" as const,
                kind: "PROJECTED" as const,
                label: "Outubro 2026",
                from: "2026-10-01",
                to: "2026-10-31",
                dueDate: civilDate(2026, 10, 20),
                totalAmount: 20000,
                paidAmount: 5000,
                remainingAmount: 15000,
                status: "PARTIAL" as const,
            },
            {
                balanceId: 3,
                balanceName: "Cartão",
                balanceType: "CREDIT" as const,
                kind: "ACTUAL" as const,
                label: "Outubro 2026",
                from: "2026-10-01",
                to: "2026-10-31",
                dueDate: civilDate(2026, 10, 25),
                totalAmount: 30000,
                paidAmount: 30000,
                remainingAmount: 0,
                status: "PAID" as const,
            },
        ];

        const summary = engine.summarizeCycles(cycles);
        assert.equal(summary.totalAmount, 60000);
        assert.equal(summary.paidAmount, 35000);
        assert.equal(summary.overdueAmount, 10000);
        assert.equal(summary.overdueCount, 1);
        assert.equal(summary.pendingAmount, 15000);

        // Filtro por q
        const filteredQ = engine.applyFilters(cycles, {
            from: "2026-10-01",
            to: "2026-10-31",
            q: "Energia",
        });
        assert.equal(filteredQ.length, 1);
        assert.equal(filteredQ[0].balanceName, "Energia");

        // Filtro por statuses
        const filteredStatus = engine.applyFilters(cycles, {
            from: "2026-10-01",
            to: "2026-10-31",
            statuses: ["OVERDUE", "PAID"],
        });
        assert.equal(filteredStatus.length, 2);
    });
});
