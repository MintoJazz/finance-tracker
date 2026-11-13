import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CycleDetailSchema } from "../../models/cycle-detail.schema";
import {
    ALL_MOCK_CYCLE_DETAILS,
    resolveMockCycleDetail,
} from "./cycle-detail.mock";
import { getCycleDetailAction } from "../../ui/actions/get-cycle-detail.action";
import { getCycleMovementEntriesAction } from "@/modules/movements/ui/actions/get-cycle-movement-entries.action";

describe("Mock Backend de Ciclo & Lançamentos", () => {
    it("todos os cenários estáticos em ALL_MOCK_CYCLE_DETAILS passam na validação do CycleDetailSchema", () => {
        assert.ok(ALL_MOCK_CYCLE_DETAILS.length >= 10);
        for (const mockItem of ALL_MOCK_CYCLE_DETAILS) {
            const parsed = CycleDetailSchema.safeParse(mockItem);
            assert.ok(
                parsed.success,
                `Mock falhou no schema: ${mockItem.label} (${JSON.stringify(parsed.error?.issues)})`
            );
        }
    });

    it("resolveMockCycleDetail retorna cenário exato quando range coincide", () => {
        const detail = resolveMockCycleDetail(10, {
            from: "2026-09-29",
            to: "2026-10-28",
        });
        assert.equal(detail.status, "PARTIAL");
        assert.equal(detail.totalAmount, 1234567890);
        assert.equal(detail.paidAmount, 823045260);
        assert.equal(detail.remainingAmount, 411522630);
    });

    it("resolveMockCycleDetail sintetiza prev e next dinamicamente para ranges arbitrários", () => {
        const detail = resolveMockCycleDetail(20, {
            from: "2026-01-15",
            to: "2026-02-14",
        }, "CARD");

        assert.equal(detail.balanceId, 20);
        assert.equal(detail.from, "2026-01-15");
        assert.equal(detail.to, "2026-02-14");
        assert.ok(detail.prev);
        assert.equal(detail.prev?.from, "2025-12-15");
        assert.ok(detail.next);
        assert.equal(detail.next?.from, "2026-02-15");
    });

    it("getCycleDetailAction retorna erro para balanceId inválido ou range malformado", async () => {
        const resInvalidId = await getCycleDetailAction({
            balanceId: 0,
            range: { from: "2026-01-01", to: "2026-01-31" },
        });
        assert.equal(resInvalidId.success, false);

        const resInvalidRange = await getCycleDetailAction({
            balanceId: 10,
            range: { from: "data-invalida", to: "" } as unknown as any,
        });
        assert.equal(resInvalidRange.success, false);
    });

    it("getCycleDetailAction obtém com sucesso os detalhes do ciclo", async () => {
        const res = await getCycleDetailAction({
            balanceId: 10,
            range: { from: "2026-09-29", to: "2026-10-28" },
            scope: "CONTRACT_CYCLE",
        });

        assert.equal(res.success, true);
        if (res.success) {
            assert.equal(res.data.status, "PARTIAL");
            assert.equal(res.data.balanceId, 10);
            assert.equal(res.data.amounts.total, 1234567890);
        }
    });

    it("getCycleMovementEntriesAction filtra e pagina lançamentos de CARD", async () => {
        const res = await getCycleMovementEntriesAction({
            balanceId: 20,
            scope: "CARD",
            pageRequest: { page: 1, pageSize: 5 },
            filter: { includeReversed: false },
        });

        assert.equal(res.success, true);
        if (res.success) {
            assert.equal(res.data.data.length, 5);
            assert.ok(res.data.total > 5);
            assert.equal(res.data.pageIndex, 1);
            assert.ok(res.data.pageCount >= 2);
            // Confirma que não há estorno quando includeReversed = false
            assert.ok(res.data.data.every((e) => !e.isReversed && e.type !== "REVERSAL"));
        }
    });

    it("getCycleMovementEntriesAction filtra e busca textual em CONTRACT_CYCLE", async () => {
        const res = await getCycleMovementEntriesAction({
            balanceId: 10,
            scope: "CONTRACT_CYCLE",
            filter: { q: "Parcela", includeReversed: false },
        });

        assert.equal(res.success, true);
        if (res.success) {
            assert.ok(res.data.data.length > 0);
            assert.ok(
                res.data.data.every((e) =>
                    e.description.toLowerCase().includes("parcela")
                )
            );
        }
    });
});

