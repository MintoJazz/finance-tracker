import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CycleRangeSchema, CycleStatusSchema } from "../../models/cycle-primitives.schema";
import { CycleDetailSchema } from "../../models/cycle-detail.schema";
import { CycleFiltersSchema, CycleItemSchema } from "../../models/cycle-item.schema";
import { CycleHorizonCalculator } from "./cycle-horizon.calculator";
import {
    COMMITMENT_STATUS_FINANCIAL_ROLE,
    CycleSummaryCalculator,
} from "./cycle-summary.policy";
import { paginate } from "./paginate";

/** Datas locais (sem fuso) para não depender do TZ da máquina. */
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d);
const ymd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

describe("CycleSummaryCalculator", () => {
    const cycle = (
        status: Parameters<typeof CycleStatusSchema.parse>[0],
        totalAmount: number,
        paidAmount: number,
        remainingAmount: number
    ) => ({ status, totalAmount, paidAmount, remainingAmount }) as Parameters<
        typeof CycleSummaryCalculator.summarize
    >[0][number];

    it("retorna zeros para lista vazia", () => {
        assert.deepEqual(CycleSummaryCalculator.summarize([]), {
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            overdueAmount: 0,
            overdueCount: 0,
        });
    });

    it("soma totais e pagos de todos os ciclos", () => {
        const s = CycleSummaryCalculator.summarize([
            cycle("PAID", 1000, 1000, 0),
            cycle("OPEN", 2000, 500, 1500),
        ]);
        assert.equal(s.totalAmount, 3000);
        assert.equal(s.paidAmount, 1500);
    });

    it("separa vencidos (valor e quantidade) de pendentes", () => {
        const s = CycleSummaryCalculator.summarize([
            cycle("OVERDUE", 1000, 0, 1000),
            cycle("OVERDUE", 500, 100, 400),
            cycle("PENDING", 700, 0, 700),
            cycle("PARTIAL", 900, 300, 600),
        ]);
        assert.equal(s.overdueAmount, 1400);
        assert.equal(s.overdueCount, 2);
        assert.equal(s.pendingAmount, 1300);
    });

    it("ciclos liquidados não entram em pendentes nem vencidos", () => {
        const s = CycleSummaryCalculator.summarize([
            cycle("PAID", 100, 100, 0),
            cycle("SETTLED", 100, 100, 0),
            cycle("TRANSFERRED", 100, 0, 100),
        ]);
        assert.equal(s.pendingAmount, 0);
        assert.equal(s.overdueAmount, 0);
        assert.equal(s.overdueCount, 0);
    });

    it("todo status possui papel financeiro definido", () => {
        for (const status of CycleStatusSchema.options) {
            assert.ok(["OVERDUE", "PENDING", "SETTLED"].includes(COMMITMENT_STATUS_FINANCIAL_ROLE[status]), status);
        }
        assert.equal(COMMITMENT_STATUS_FINANCIAL_ROLE.PROJECTED, "PENDING");
        assert.equal(COMMITMENT_STATUS_FINANCIAL_ROLE.UNRECORDED, "PENDING");
    });
});

describe("paginate", () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);

    it("devolve a primeira página e metadados", () => {
        const page = paginate(items, { page: 1, pageSize: 10 });
        assert.deepEqual(page.data, items.slice(0, 10));
        assert.deepEqual(
            { total: page.total, pageIndex: page.pageIndex, pageSize: page.pageSize, pageCount: page.pageCount },
            { total: 25, pageIndex: 0, pageSize: 10, pageCount: 3 }
        );
    });
    it("a última página vem parcial (valor limite)", () => {
        assert.deepEqual(paginate(items, { page: 3, pageSize: 10 }).data, [21, 22, 23, 24, 25]);
    });
    it("página além do fim retorna vazio mantendo o total", () => {
        const page = paginate(items, { page: 4, pageSize: 10 });
        assert.deepEqual(page.data, []);
        assert.equal(page.total, 25);
    });
    it("valores inválidos caem nos padrões 1 e 10", () => {
        for (const req of [
            { page: 0, pageSize: 0 },
            { page: -3, pageSize: -1 },
            { page: Number.NaN, pageSize: Number.NaN },
        ]) {
            const page = paginate(items, req);
            assert.equal(page.pageIndex, 0);
            assert.equal(page.pageSize, 10);
            assert.equal(page.data.length, 10);
        }
    });
    it("trunca valores decimais", () => {
        const page = paginate(items, { page: 2.9, pageSize: 5.7 });
        assert.equal(page.pageIndex, 1);
        assert.equal(page.pageSize, 5);
    });
    it("lista vazia gera pageCount 0", () => {
        const page = paginate([], { page: 1, pageSize: 10 });
        assert.deepEqual([page.data, page.total, page.pageCount], [[], 0, 0]);
    });
});

describe("CycleHorizonCalculator", () => {
    const today = day(2026, 5, 15);

    it("padrão (ano civil) cobre 1º jan a 31 dez e desloca por offset", () => {
        const h0 = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today });
        assert.deepEqual([ymd(h0.from), ymd(h0.to)], ["2026-01-01", "2026-12-31"]);
        const h1 = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, offset: 1 });
        assert.deepEqual([ymd(h1.from), ymd(h1.to)], ["2027-01-01", "2027-12-31"]);
        const hm = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, offset: -1 });
        assert.deepEqual([ymd(hm.from), ymd(hm.to)], ["2025-01-01", "2025-12-31"]);
    });

    it("trimestre civil: maio cai em abr–jun e o offset anda de 3 em 3 meses", () => {
        const q0 = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, mode: "CALENDAR_QUARTER" });
        assert.deepEqual([ymd(q0.from), ymd(q0.to)], ["2026-04-01", "2026-06-30"]);
        const q1 = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, mode: "CALENDAR_QUARTER", offset: 1 });
        assert.deepEqual([ymd(q1.from), ymd(q1.to)], ["2026-07-01", "2026-09-30"]);
        const qm = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, mode: "CALENDAR_QUARTER", offset: -2 });
        assert.deepEqual([ymd(qm.from), ymd(qm.to)], ["2025-10-01", "2025-12-31"]);
    });

    it("janela deslizante: de -2 a +9 meses e offset de 12 em 12", () => {
        const r0 = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, mode: "ROLLING" });
        assert.deepEqual([ymd(r0.from), ymd(r0.to)], ["2026-03-01", "2027-02-28"]);
        const r1 = CycleHorizonCalculator.calculate({ frequency: "MONTHLY", today, mode: "ROLLING", offset: 1 });
        assert.deepEqual([ymd(r1.from), ymd(r1.to)], ["2027-03-01", "2028-02-29"]);
    });

    it("frequência anual usa blocos de 10 anos, ignorando o modo", () => {
        const y0 = CycleHorizonCalculator.calculate({ frequency: "YEARLY", today });
        assert.deepEqual([ymd(y0.from), ymd(y0.to)], ["2026-01-01", "2035-12-31"]);
        const y1 = CycleHorizonCalculator.calculate({ frequency: "YEARLY", today, offset: 1, mode: "ROLLING" });
        assert.deepEqual([ymd(y1.from), ymd(y1.to)], ["2036-01-01", "2045-12-31"]);
    });
});

describe("Schemas de ciclo", () => {
    it("CycleRangeSchema aceita YYYY-MM-DD com from <= to (inclusive)", () => {
        assert.equal(CycleRangeSchema.safeParse({ from: "2026-01-01", to: "2026-01-31" }).success, true);
        assert.equal(CycleRangeSchema.safeParse({ from: "2026-01-01", to: "2026-01-01" }).success, true);
    });
    it("CycleRangeSchema rejeita ordem invertida e formato inválido", () => {
        assert.equal(CycleRangeSchema.safeParse({ from: "2026-02-01", to: "2026-01-31" }).success, false);
        assert.equal(CycleRangeSchema.safeParse({ from: "01/01/2026", to: "2026-01-31" }).success, false);
        assert.equal(CycleRangeSchema.safeParse({ from: "2026-1-1", to: "2026-01-31" }).success, false);
    });
    it("CycleStatusSchema tem os 9 status esperados", () => {
        assert.equal(CycleStatusSchema.options.length, 9);
        assert.equal(CycleStatusSchema.safeParse("LATE").success, false);
    });
    it("CycleFiltersSchema valida os status informados", () => {
        assert.equal(CycleFiltersSchema.safeParse({ statuses: ["PAID", "OPEN"] }).success, true);
        assert.equal(CycleFiltersSchema.safeParse({ statuses: ["NOPE"] }).success, false);
    });
    it("CycleItemSchema rejeita balanceType desconhecido", () => {
        assert.equal(CycleItemSchema.shape.balanceType.safeParse("WALLET").success, false);
        assert.equal(CycleItemSchema.shape.balanceType.safeParse("PAYABLE").success, true);
    });
    it("CycleDetailSchema exige source, amounts e vizinhos", () => {
        assert.equal(CycleDetailSchema.safeParse({}).success, false);
        assert.equal(CycleDetailSchema.shape.amounts.safeParse({ total: 1, paid: 0, remaining: 1 }).data?.transferred, 0);
        assert.equal(CycleDetailSchema.shape.amounts.safeParse({ total: -1, paid: 0, remaining: 0 }).success, false);
        assert.equal(CycleDetailSchema.shape.source.safeParse({ balanceId: 1, kind: "CARD", name: "" }).success, false);
        assert.equal(CycleDetailSchema.shape.prev.safeParse(null).success, true);
    });
});
